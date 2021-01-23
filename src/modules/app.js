// Foreign modules
import add from 'date-fns/add'
import format from 'date-fns/format'
import datepicker from 'js-datepicker'
// Helper home-made modules
import createNode from "./createNode"
import NodeObjectBinder from "./NodeObjBinderClass"
// Images
import emptySquareIcon from "../img/square.svg"
import filledSquareIcon from "../img/square-fill.svg"
import pencilSquareIcon from "../img/pencil-square.svg"
import trashIcon from "../img/trash.svg"
import addIcon from "../img/plus-square.svg"

export const runApp = () => {

    // 'DataController' is the content controller, which CRUDs user tasks and lists
    const DataController = (() => {

        // Stores user tasks
        const userData = new Map() // Note: need to figure out how to configure this to operate with lists as buckets for the Map

        // Creates a task object
        function createTask(completeBool, title, dueDate) {

            // Assigns a unique identifying hash to each task object based on task title and the time it was created.
            // This hash is used to identify objects for deletion at a later point, if requested by a user.
            function _makeTaskHash(title) {
                const hash = title + new Date()
                return hash
            }

            const task = {
                completeBool,
                title,
                dueDate,
                hash: _makeTaskHash(title),
            }

            userData.set(task.hash, task)
            return task
        }

        // Deletes a task object
        function deleteTaskObject(taskObject) {
            userData.delete(taskObject.hash)
        }

        return { createTask, deleteTaskObject, userData }
    })()

    // 'render' controls the publication of information to the DOM
    const Render = (() => {

        // Renders a task object to the DOM
        function renderTask(taskObject) {

            const taskNode = createNode("li", userContentContainer, "", "task")
            const checkbox = createNode("img", taskNode, "", "checkbox")
            if (!taskObject.completeBool) {
                checkbox.src = emptySquareIcon
            } else {
                checkbox.src = filledSquareIcon
            }

            const taskDescription = createNode("div", taskNode, "", "taskDescription")
            taskDescription.textContent = taskObject.title

            const taskDueDate = createNode("div", taskNode, "", "taskDueDate")
            if (taskObject.dueDate) {
                let date = taskObject.dueDate
                date = format(date, "dd/MM/yy")
                taskDueDate.textContent = date
            }
            const editTaskIcon = createNode("img", taskNode, "", "editTaskIcon")
            editTaskIcon.src = pencilSquareIcon
            const deleteTaskIcon = createNode("img", taskNode, "", "deleteTaskIcon")
            deleteTaskIcon.src = trashIcon

            taskNode.setAttribute("data-taskID", taskObject.taskID)


            document.getElementById("userContentContainer").insertBefore(taskNode, document.getElementById("lowerAddTask"))

            return taskNode
        }

        // Deletes a task node from the DOM
        function deleteTaskNode(node) {
            node.remove()
        }

        // Show add task form
        const renderAddTaskForm = (() => {

            const form = document.getElementById("newTaskContainer")
            const lowerAddButton = document.getElementById("lowerAddTask")
            const inputFocus = document.getElementById("newItemTitle")

            function show() {
                form.style.display = "flex"
                lowerAddButton.style.display = "none"
                inputFocus.focus()
            }

            function hide() {
                form.style.display = "none"
                lowerAddButton.style.display = "flex"
                // Move the 'Add Task' button to the end of the user content container, after the new task item
                const newItem = document.getElementById("userContentContainer").lastChild
                newItem.parentNode.insertBefore(lowerAddButton, newItem.nextSibling)
                // Do the same thing for the 'new task form', so it shows up at the bottom the next time it is opened
                newItem.parentNode.insertBefore(form, newItem.nextSibling)
            }

            return { show, hide }

        })()

        const renderEditTaskForm = (taskBinder) => {
            const editTaskContainer = document.querySelector("#editTaskContainer")
            userContentContainer.insertBefore(editTaskContainer, taskBinder.node)

            // Title
            const titleSelector = editTaskContainer.querySelector("#editItemTitle")
            const priorTitle = taskBinder.obj.title
            titleSelector.setAttribute("placeholder", priorTitle)

            // Date
            const dateSelector = editTaskContainer.querySelector("#editDateInput")
            if (taskBinder.obj.dueDate) {
                const priorDate = format(taskBinder.obj.dueDate, "eee d/M/yy")
                dateSelector.setAttribute("placeholder", priorDate)
            }

            // Add other task parameters here

            // Assigns hash from original task to the form, so on submission the form can use the hash to identify and update the correct task object
            editTaskContainer.setAttribute("data-hash", taskBinder.obj.hash)


            editTaskContainer.style.display = "flex"
        }

        return { renderTask, deleteTaskNode, renderAddTaskForm, renderEditTaskForm }
    })()

    // Main allocates commands to the DataController and Render sub-modules
    const Main = (() => {

        // Stores task binders, the objects that link together a DOM task node and a stored task object
        const taskBinders = []

        function createTaskBinder(taskNode, taskObject) {
            const taskBinder = new NodeObjectBinder(taskNode, taskObject)
            taskBinders.push(taskBinder)
            return taskBinder
        }

        function deleteTaskBinder(taskBinder) {
            DataController.deleteTaskObject(taskBinder.obj)
            Render.deleteTaskNode(taskBinder.node)
        }

        function editTaskBinder(taskBinder) {
            // Give the node being updated a designator, so that it can be found and updated with the new values later
            taskBinder.node.setAttribute("id", "beingEdited")
            // Make the existing task div disappear
            taskBinder.node.style.display = "none"
            // Make the new task form appear in place of the div
            Render.renderEditTaskForm(taskBinder)
            // Load the existing task div into the new task form <-- Done
            // When the new task form is submitted, load the form data into the existing task using the hash identifier

            // Make the new task form disappear

        }

        return { taskBinders, createTaskBinder, deleteTaskBinder, editTaskBinder }
    })()

    // 'Listeners' adds functionality to DOM buttons
    const Listeners = (() => {

        function applyTaskListeners(taskBinder) {

            function _addDeletionListener(taskBinder) {
                const button = taskBinder.node.querySelector(".deleteTaskIcon")
                button.addEventListener("click", function () {
                    Main.deleteTaskBinder(taskBinder)
                })
            }

            function _addEditListener(taskBinder) {
                const button = taskBinder.node.querySelector(".editTaskIcon")
                button.addEventListener("click", () => {
                    Main.editTaskBinder(taskBinder)
                })
            }

            _addDeletionListener(taskBinder)
            _addEditListener(taskBinder)
        }

        const addTaskButtons = (() => {
            const buttons = document.getElementsByClassName("addTaskButton")
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i]
                button.addEventListener("click", function () { Render.renderAddTaskForm.show() })
            }
        })()

        const datePickers = (() => {
            const dateInputs = document.querySelectorAll(".date")
            dateInputs.forEach(function (dateNode) {
                const datePicker = datepicker(dateNode, {
                    formatter: (input, date) => {
                        input.value = format(date, "eee d/M/yy")
                        dateNode.setAttribute("data-date", date)
                    },
                })
            })
        })()

        const submitButtons = (() => {

            // Function to prevent page from refreshing when new task form is submitted
            const submitRefreshBlocker = (() => {
                const newTaskForm = document.getElementById("newTaskForm")
                newTaskForm.addEventListener("submit", (e) => {
                    e.preventDefault()
                })

                const editTaskForm = document.getElementById("editTaskForm")
                editTaskForm.addEventListener("submit", (e) => {
                    e.preventDefault()
                })
            })()

            // Function to handle submission of form input into createTask factory function
            function submitNewItem() {
                const title = document.getElementById("newItemTitle").value
                const date = Date.parse(document.getElementById("dateInput").dataset.date)
                const taskObject = DataController.createTask(false, title, date)
                const taskNode = Render.renderTask(taskObject)
                const newTaskBinder = Main.createTaskBinder(taskNode, taskObject)
                Listeners.applyTaskListeners(newTaskBinder)
            }

            const newTaskSubmitButton = document.getElementById("newItemSubmit")
            newTaskSubmitButton.addEventListener("click", function () {
                submitNewItem()
                Render.renderAddTaskForm.hide()
                document.getElementById("newTaskForm").reset()
            })

            // Function to handle submissions of edit task form and supply form input into editTask factory function
            function editItemSubmit() {

                const editTaskContainer = document.getElementById("editTaskContainer")
                console.log(editTaskContainer.dataset.hash)

                // const taskBinder = 
                console.log("OLD")
                console.log(Main.taskBinders)
                // Get the new form data
                const title = document.getElementById("editItemTitle").value
                const date = Date.parse(document.getElementById("editDateInput").dataset.date)
                // Update the task object with the new form data
                const hash = editTaskContainer.dataset.hash
                const taskObject = DataController.userData.get(hash)
                taskObject.title = title
                taskObject.dueDate = date

                // Render an updated task node with the new object values, in place of the old one
                const newTaskNode = Render.renderTask(taskObject)
                const oldTaskNode = document.getElementById("beingEdited")
                userContentContainer.insertBefore(newTaskNode, oldTaskNode)
                oldTaskNode.remove()

                // Remove the old task binder, and add a new one
                // const oldTaskBinder =
                Main.createTaskBinder(newTaskNode, taskObject)

                // Listeners.applyTaskListeners(newTaskBinder)
            }

            const editTaskSubmitButton = document.querySelector("#editItemSubmit")
            editTaskSubmitButton.addEventListener("click", function (e) {

                editItemSubmit(e)
                console.log("NEW")
                console.log(Main.taskBinders)
            })







        })()

        const cancelButton = (() => {
            const button = document.getElementById("newItemAbort")
            button.addEventListener("click", function () {
                document.getElementById("newTaskForm").reset()
                Render.renderAddTaskForm.hide()
            })
        })()

        return { applyTaskListeners }
    })()


    // APP LOGIC
    const App = (() => {

        // Dev tools to be deleted when production ready
        const devStuff = (() => {
            DataController.createTask(false, "Demo Task", new Date())

            document.getElementById("topBar").addEventListener("click", function () {
                console.log(DataController.userData)
            })
        })()

        // Custom event for NodeObjectBinder class
        const publish = new Event('publish');

        // Render stored tasks from stored data for this user, and bind each rendered node with its task object,
        // and store the binder object in an array

        for (let taskObject of DataController.userData.values()) {
            const taskNode = Render.renderTask(taskObject)
            Main.createTaskBinder(taskNode, taskObject)
        }
        // Apply listeners to rendered tasks
        for (let i = 0; i < Main.taskBinders.length; i++) {
            Listeners.applyTaskListeners(Main.taskBinders[i])
        }
    })()
}

