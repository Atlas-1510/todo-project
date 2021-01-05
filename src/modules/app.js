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

    // 'main' is the main content controller, which CRUDs user tasks and lists
    const Main = (() => {

        // Stores user tasks
        const userData = new Map() // Note: need to figure out how to configure this to operate with lists as buckets for the Map

        // Creates a task object
        function createTask(completeBool, title, dueDate) {
            const task = {
                completeBool,
                title,
                dueDate,
            }

            userData.set(`${userData.size + 1}`, task)
            return task
        }

        return { newBinder, createTask, userData }
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

        return { renderTask, renderAddTaskForm }
    })()

    // 'Listeners' adds functionality to DOM buttons
    const Listeners = (() => {

        // Function be to invoked by event listener on delete buttons
        function deletionListener(taskBinder) {

            const button = taskBinder.node.querySelector(".deleteTaskIcon")
            button.addEventListener("click", function () {
                Main.deleteTask(taskBinder)
            })
        }

        const addTaskButtons = (() => {
            const buttons = document.getElementsByClassName("addTaskButton")
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i]
                button.addEventListener("click", function () { Render.renderAddTaskForm.show() })
            }
        })()

        const datePicker = datepicker('#dateInput', {
            formatter: (input, date) => {
                input.value = format(date, "eee d/M/yy")
                const node = document.getElementById("dateInput")
                node.setAttribute("data-date", date)
            },
        })

        const submitButton = (() => {

            // Function to prevent page from refreshing when new task form is submitted
            const submitRefreshBlocker = (() => {
                const form = document.getElementById("newTaskForm")
                form.addEventListener("submit", (e) => {
                    e.preventDefault()
                })
            })()

            // Function to handle submission of form input into createTask factory function
            function submitNewItem() {
                const title = document.getElementById("newItemTitle").value
                const date = Date.parse(document.getElementById("dateInput").dataset.date)
                const taskObject = Main.createTask(false, title, date)
                const taskNode = Render.renderTask(taskObject)
                deletionListener(taskNode)
            }
            const submitButtonElement = document.getElementById("newItemSubmit")
            submitButtonElement.addEventListener("click", function () {
                submitNewItem()
                Render.renderAddTaskForm.hide()
                document.getElementById("newTaskForm").reset()
            })
        })()

        const cancelButton = (() => {
            const button = document.getElementById("newItemAbort")
            button.addEventListener("click", function () {
                document.getElementById("newTaskForm").reset()
                Render.renderAddTaskForm.hide()
            })
        })()

        return { deletionListener }
    })()

    // MAIN APP LOGIC
    const App = (() => {

        // Dev tools to be deleted when production ready
        const devStuff = (() => {
            Main.createTask(false, "Demo Task", new Date())

            document.getElementById("topBar").addEventListener("click", function () {
                console.log(Main.userData)
            })
        })()

        // Custom event for NodeObjectBinder class
        const publish = new Event('publish');

        // Render stored tasks from stored data for this user, and bind each rendered node with its task object,
        // and store the binder object in an array
        const taskBinders = []
        for (let taskObject of Main.userData.values()) {
            const taskNode = Render.renderTask(taskObject)
            const taskBinder = new NodeObjectBinder(taskNode, taskObject)
            taskBinders.push(taskBinder)
        }
        // Apply listeners to rendered tasks
        for (let i = 0; i < taskBinders.length; i++) {
            // Add listeners here
        }


    })()
}

