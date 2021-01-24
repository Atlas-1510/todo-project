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

    // List stores and creates/edits/deletes objects that hold groups of TaskBinders. i.e "Grocery List"
    const List = (() => {

        // This is the list of lists
        const ListStorage = new Map()


        // Add a new list to ListStorage 
        function createList(name) {
            const newList = new Map()
            const hash = name + new Date()
            ListStorage.set(hash, newList)
            return hash
        }

        // Remove a list from ListStorage
        function deleteList(name) {
            ListStorage.delete(name)
        }

        return { ListStorage, createList, deleteList }
    })()

    // Render inserts interactable DOM elements, such as forms and buttons
    const Render = (() => {

        // Form for adding new tasks
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
            // const editTaskContainer = document.querySelector("#editTaskContainer")
            // userContentContainer.insertBefore(editTaskContainer, taskBinder.node)

            // // Title
            // const titleSelector = editTaskContainer.querySelector("#editItemTitle")
            // const priorTitle = taskBinder.obj.title
            // titleSelector.setAttribute("placeholder", priorTitle)

            // // Date
            // const dateSelector = editTaskContainer.querySelector("#editDateInput")
            // if (taskBinder.obj.dueDate) {
            //     const priorDate = format(taskBinder.obj.dueDate, "eee d/M/yy")
            //     dateSelector.setAttribute("placeholder", priorDate)
            // }

            // // Add other task parameters here

            // // Assigns hash from original task to the form, so on submission the form can use the hash to identify and update the correct task object
            // editTaskContainer.setAttribute("data-hash", taskBinder.obj.hash)


            // editTaskContainer.style.display = "flex"
        }


        return { renderAddTaskForm }
    })()

    // Listeners applies functionality to buttons in DOM elements
    const Listeners = (() => {

        // Edit and Delete buttons for task nodes
        function applyTaskListeners(taskBinder) {
            function _addDeletionListener(taskBinder) {
                const button = taskBinder.node.querySelector(".deleteTaskIcon")
                button.addEventListener("click", function () {
                    TaskBinder.deleteTaskBinder(taskBinder)
                })
            }

            function _addEditListener(taskBinder) {
                const button = taskBinder.node.querySelector(".editTaskIcon")
                button.addEventListener("click", () => {
                    TaskBinder.editTaskBinder(taskBinder)
                })
            }

            _addDeletionListener(taskBinder)
            _addEditListener(taskBinder)
        }

        // Add task buttons
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

        const cancelButton = (() => {
            const button = document.getElementById("newItemAbort")
            button.addEventListener("click", function () {
                document.getElementById("newTaskForm").reset()
                Render.renderAddTaskForm.hide()
            })
        })()


        return { applyTaskListeners }

    })()

    // BinderComponents creates task objects and nodes, which are then paired in a TaskBinder
    const BinderComponents = (() => {
        function createTaskObject(completeBool, title, dueDate, hash) {

            const task = {
                completeBool,
                title,
                dueDate,
                hash,
            }

            return task
        }

        function createTaskNode(taskObject) {

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

            document.getElementById("userContentContainer").insertBefore(taskNode, document.getElementById("lowerAddTask"))
            taskNode.setAttribute("data-hash", taskObject.hash)

            return taskNode
        }

        return { createTaskObject, createTaskNode }

    })()

    // TaskBinder creates/edits/deletes objects that pair together a task node and a task object.
    const TaskBinder = (() => {
        function createTaskBinder(taskNode, taskObject, listHash) {
            const hash = taskObject.title + new Date()
            const taskBinder = new NodeObjectBinder(taskNode, taskObject, hash)
            const ParentList = List.ListStorage.get(listHash)
            ParentList.set(hash, taskBinder)
        }

        function deleteTaskBinder(taskBinder) {
            taskBinder.node.remove()
            taskBinder.obj = null
            List.ListStorage.list.delete(taskBinder.hash)
        }

        function editTaskBinder(taskBinder) {
            //
        }

        return { createTaskBinder, deleteTaskBinder, editTaskBinder }
    })()

    // APP LOGIC
    const App = (() => {

        // Dev tools to be deleted when production ready
        const devStuff = (() => {

            // Demo list
            const demoListHash = List.createList("demoList")

            // Demo task
            const demoTask = BinderComponents.createTaskObject(false, "Demo Task", new Date())
            const demoNode = BinderComponents.createTaskNode(demoTask)
            demoNode.parentNode.removeChild(demoNode) // removing to be readded via taskBinder storage
            TaskBinder.createTaskBinder(demoNode, demoTask, demoListHash)

            document.getElementById("topBar").addEventListener("click", function () {
                console.log(List.ListStorage)
            })
        })()

        // Custom event for NodeObjectBinder class
        const publish = new Event('publish');

        // Render stored tasks from stored data for this user
        for (let list of List.ListStorage.values()) {
            for (let taskBinder of list.values()) {

            }
        }

        // // Apply listeners to rendered tasks
        for () {



            Listeners.applyTaskListeners(Main.taskBinders[i])
        }
    })()
}








































//         const submitButtons = (() => {

//             // Function to prevent page from refreshing when new task form is submitted
//             const submitRefreshBlocker = (() => {
//                 const newTaskForm = document.getElementById("newTaskForm")
//                 newTaskForm.addEventListener("submit", (e) => {
//                     e.preventDefault()
//                 })

//                 const editTaskForm = document.getElementById("editTaskForm")
//                 editTaskForm.addEventListener("submit", (e) => {
//                     e.preventDefault()
//                 })
//             })()

//             // Function to handle submission of form input into createTask factory function
//             function submitNewItem() {
//                 const title = document.getElementById("newItemTitle").value
//                 const date = Date.parse(document.getElementById("dateInput").dataset.date)
//                 const taskObject = DataController.createTask(false, title, date)
//                 const taskNode = Render.renderTask(taskObject)
//                 const newTaskBinder = Main.createTaskBinder(taskNode, taskObject)
//                 Listeners.applyTaskListeners(newTaskBinder)
//             }

//             const newTaskSubmitButton = document.getElementById("newItemSubmit")
//             newTaskSubmitButton.addEventListener("click", function () {
//                 submitNewItem()
//                 Render.renderAddTaskForm.hide()
//                 document.getElementById("newTaskForm").reset()
//             })

//             // Function to handle submissions of edit task form and supply form input into editTask factory function
//             function editItemSubmit() {

//                 const editTaskContainer = document.getElementById("editTaskContainer")
//                 const oldTaskBinderHash = editTaskContainer.dataset.hash
//                 console.log(oldTaskBinderHash) 
//                 console.log("OLD")
//                 console.log(Main.taskBinders)

//                 // Get the new form data
//                 const completeBool = false // make this changeable later
//                 const title = document.getElementById("editItemTitle").value
//                 const date = Date.parse(document.getElementById("editDateInput").dataset.date)


//                 // Create new object and node, create new taskBinder
//                 const newObject = DataController.createTask(completeBool, title, date)
//                 const newNode = Render.renderTask(newObject)
//                 const newBinder = Main.createTaskBinder(newNode, newObject)

//                 // Insert new node where the old one was
//                 const oldTaskNode = document.getElementById("beingEdited")
//                 userContentContainer.insertBefore(newNode, oldTaskNode)

//                 // Delete the old taskBinder





//                 // Update the task object with the new form data
//                 const hash = editTaskContainer.dataset.hash
//                 const taskObject = DataController.userData.get(hash)
//                 taskObject.title = title
//                 taskObject.dueDate = date

//                 // Render an updated task node with the new object values, in place of the old one
//                 const newTaskNode = Render.renderTask(taskObject)
//                 const oldTaskNode = document.getElementById("beingEdited")
//                 userContentContainer.insertBefore(newTaskNode, oldTaskNode)
//                 oldTaskNode.remove()

//                 // Remove the old task binder, and add a new one
//                 const oldTaskBinder =
//                 Main.createTaskBinder(newTaskNode, taskObject)

//                 // Listeners.applyTaskListeners(newTaskBinder)
//             }

//             const editTaskSubmitButton = document.querySelector("#editItemSubmit")
//             editTaskSubmitButton.addEventListener("click", function (e) {

//                 editItemSubmit(e)
//                 console.log("NEW")
//                 console.log(Main.taskBinders)
//             })







//         })()



//         return { applyTaskListeners }
//     })()




