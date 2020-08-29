
class DomElements {
    constructor() {
        this.appEl = document.querySelector(".todo-app");
        this.apiService = new ApiService();

        //start App
        this.loadAll();
        this.addEventToNewTaskForm();
        this.addEventToShowNewOperationForm();
        this.addEventToSubmitOperationForm();
    }

    loadAll() {
        this.apiService.getTasks(
            (tasks) => {
                tasks.map((task) => {
                    this.createTaskElement(task);
                });
            },
            (error) => {
                console.log(error);
            }
        );
    }

createTaskElement(task) {
        let taskSectionEl = document.createElement("section");
        taskSectionEl.classList.add("task");
        taskSectionEl.dataset.id = task.id;

        let taskHeaderEl = document.createElement("h2");
        taskHeaderEl.innerText = task.title;
        taskSectionEl.appendChild(taskHeaderEl);

        let listEl = document.createElement("ul");
        listEl.classList.add("list-group", "todo");
        taskSectionEl.appendChild(listEl);

        let listFirstEl = document.createElement("li");
        listFirstEl.classList.add("list-group-item", "active", "task-description");
        listFirstEl.innerText = task.description;
        listEl.appendChild(listFirstEl);

        if (task.status === "open") {
            let finishButton = document.createElement("a");
            finishButton.classList.add(
                "btn",
                "btn-secondary",
                "float-right",
                "close-task"
            );

            finishButton.innerText = "Finish";
            listFirstEl.appendChild(finishButton);

            let addOperationButton = document.createElement("a");
            addOperationButton.classList.add(
                "btn",
                "btn-secondary",
                "float-right",
                "add-operation"
            );

            addOperationButton.innerText = "Add operation";
            listFirstEl.appendChild(addOperationButton);
        }

        this.appEl.appendChild(taskSectionEl);
        this.addEventToLoadOperations(taskSectionEl);
    }

    addEventToNewTaskForm() {
        let formEl = document.querySelector("form.new-task");
        formEl.addEventListener("submit", (e) => {
            e.preventDefault();
            let titleEl = e.currentTarget.querySelector("input[name=title]");
            let descriptionEl = e.currentTarget.querySelector(
                "input[name=description]"
            );

            let task = new Task(titleEl.value, descriptionEl.value, "open");

            this.apiService.saveTask(
                task,
                (savedTask) => {
                    this.createTaskElement(savedTask);
                    titleEl.value = "";
                    descriptionEl.value = "";
                },
                (error) => console.log(error)
            );
        });
    }

    createOperationElement(operation, taskOperationsElement) {
        let operationEl = document.createElement("div");
        operationEl.classList.add("list-group-item", "task-operation");
        operationEl.dataset.id = operation.id;
        operationEl.innerText = operation.description;
        taskOperationsElement.appendChild(operationEl);
    }

    addEventToLoadOperations(taskOperationsElement) {
        // Dostajemy się do h2, do którego podepniemy zdarzenie 'click'
        const h2Elem = taskOperationsElement.firstElementChild;

        // Pobieramy id zadania z atrybutu data-id
        const taskId = taskOperationsElement.dataset.id;

        h2Elem.addEventListener("click", (e) => {
            // Ponieważ korzystamy z Fat arrow, this nie wskazuje na kliknięty element
            // Do klikniętego elementu możemy się dostać przez obiekt Event
            const clickedElem = e.target;

            // Gdy jest ustawiony data-loaded przerywamy dalsze wykonywanie funkcji poprzez słowo return
            if (clickedElem.parentElement.dataset.loaded) {
                return;
            }

            this.apiService.getOperationsForTask(
                taskId,
                (operations) => {
                    operations.forEach((operation) => {
                        this.createOperationElement(operation, taskOperationsElement);
                    });

                    // Dodanie przycisku do odświeżania
                    clickedElem.parentElement.dataset.loaded = true;
                },
                (error) => console.log(error)
            );
        });
    }

    addEventToShowNewOperationForm() {
        document.querySelector("div.todo-app").addEventListener("click", (e) => {
            if (e.target.classList.contains("add-operation")) {
                e.preventDefault();
                let currentEl = e.target;

                // Namierzamy element, do którego ma być wstawiony formularz
                let operationFormElParent = currentEl.parentElement.parentElement;
                this.addOperationFormVisibility(operationFormElParent);
            }
        });
    }

    addOperationFormVisibility(taskOperationsElement) {
        // Sprawdzamy czy już nie istnieje
        if (taskOperationsElement.dataset.operationForm) {
            // Jak istnieje to usuwamy i przerywamy działanie funkcji
            taskOperationsElement.removeChild(taskOperationsElement.lastElementChild);
            // Nie zapomnijmy też usunąć dataset, bo inaczej za dużo rzeczy zacznie nam znikać
            taskOperationsElement.removeAttribute("data-operation-form");
            return;
        }

        // Jak nie istnieje to dodajemy dataset

        taskOperationsElement.dataset.operationForm = true;

        let operationEl = document.createElement("li");
        operationEl.classList.add(
            "list-group-item",
            "task-operation",
            "task-operation-form",
            "d-none"
        );
        taskOperationsElement.appendChild(operationEl);

        let inputDescription = document.createElement("input");
        inputDescription.setAttribute("type", "text");
        inputDescription.setAttribute("name", "description");
        inputDescription.setAttribute("placeholder", "Operation description");
        inputDescription.classList.add("form-control");
        operationEl.appendChild(inputDescription);

        let inputSubmit = document.createElement("input");
        inputSubmit.setAttribute("type", "submit");
        inputSubmit.setAttribute("value", "Add");
        inputSubmit.classList.add("btn", "btn-primary");
        operationEl.appendChild(inputSubmit);
    }

    addEventToSubmitOperationForm() {
        document.querySelector("div.todo-app").addEventListener("click", (e) => {
            if (
                e.target.parentElement.classList.contains("task-operation-form") &&
                e.target.classList.contains("btn")
            ) {
                e.preventDefault();
                let currentEl = e.target;
                let description = currentEl.previousElementSibling.value;

                let taskId =
                    currentEl.parentElement.parentElement.parentElement.dataset.id;
                let operation = new Operation(description);

                console.log(operation, taskId);

                this.apiService.addOperationForTask(
                    taskId,
                    operation,
                    (savedOperation) => {
                        // Udało się zapisać wiec dodajemy element do listy
                        this.createOperationElement(
                            operation,
                            currentEl.parentElement.parentElement.parentElement
                        );
                        // Usuwamy formularz
                        this.addOperationFormVisibility(
                            currentEl.parentElement.parentElement
                        );
                    },
                    (err) => console.log(err)
                );
            }
        });
    }



}