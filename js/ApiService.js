
class ApiService {
    constructor() {
        this.apikey = "2daed076-b5f5-423b-8262-edd6b33ea5a1"; //tutaj jest swój klucz
        this.url = "https://todo-api.coderslab.pl";
    }

    getTasks(successCallbackFn, errorCallbackFn) {
        fetch(this.url + "/api/tasks", {
            headers: {
                Authorization: this.apikey,
            },
            method: "GET",
        })
            .then(function (response) {

                return response.json();
            })
            .then((responseData) => {
                if (typeof successCallbackFn === "function") {
                    const tasksToProcess = responseData.data;
                    const tasks = tasksToProcess.map((element) => {
                        return this.createTaskFromResponseData(element);
                    });
                    successCallbackFn(tasks);
                }
            })
            .catch((error) => {
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn(error);
                }
            });
    }

    createTaskFromResponseData(data) {
        const task = new Task(data.title, data.description, data.status);
        if (data.id) {
            task.id = data.id;
        }
        return task;

    }

    saveTask(task, successCallbackFn, errorCallbackFn) {
        fetch(this.url + "/api/tasks", {
            headers: {
                Authorization: this.apikey,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(task),
        })
            .then((response) => {
                return response.json();
            })
            .then((responseData) => {
                if (typeof successCallbackFn === "function") {
                    const newTask = this.createTaskFromResponseData(responseData.data);
                    successCallbackFn(newTask);
                }
            })
            .catch((error) => {
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn(error);
                }
            });
    }

    getOperationsForTask(taskId, successCallbackFn, errorCallbackFn) {
        fetch(this.url + "/api/tasks/" + taskId + "/operations", {
            headers: {
                Authorization: this.apikey,
            },
            method: "GET",
        })
            .then((response) => {
                return response.json();
            })
            .then((responseData) => {
                if (typeof successCallbackFn === "function") {
                    const operations = responseData.data.map((element) => {
                        return this.createOperationFromResponseData(element);
                    });
                    successCallbackFn(operations);
                }
            })
            .catch(function (error) {
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn(error);
                }
            });
    }

    createOperationFromResponseData(data) {
        const operation = new Operation(data.description, data.timeSpent);
        if (data.id) {
            operation.id = data.id;
        }
        return operation;
    }

    addEventToLoadOperations(taskOperationsElement) {
        // Dostajemy się do h2, do którego podepniemy zdarzenie 'click'
        const h2Elem = taskOperationsElement.firstElementChild;

        // Pobieramy id zadania z atrybutu data-id
        const taskId = taskOperationsElement.dataset.id;

        h2Elem.addEventListener("click", () => {
            this.apiService.getOperationsForTask(
                taskId,
                (operations) => {
                    operations.forEach((operation) => {
                        this.createOperationElement(operation, taskOperationsElement);
                    });
                },
                (error) => console.log(error)
            );
        });
    }

    addOperationForTask(
        taskId,
        operation,
        successCallbackFn,
        errorCallbackFn
    ) {

        fetch(this.url + "/api/tasks/" + taskId + "/operations", {
            headers: {
                Authorization: this.apikey,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(operation),
        })
            .then((response) => {
                return response.json();
            })
            .then((responseData) => {
                if (typeof successCallbackFn === "function") {
                    const operation = this.createOperationFromResponseData(
                        responseData.data
                    );
                    successCallbackFn(operation);
                }
            })
            .catch((error) => {
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn(error);
                }
            });
    }



}