// Foreign modules
import add from 'date-fns/add'
import format from 'date-fns/format'
import datepicker from 'js-datepicker'
// Helper home-made modules
import createNode from "./createNode"
import ListBinderInstance from "./ListBinderClass"
import TaskBinderInstance from "./TaskBinderClass"
import publish from "./publishEvent"
// Images
import emptyAppIcon from "../img/app.svg"
import emptySquareIcon from "../img/square.svg"
import filledSquareIcon from "../img/square-fill.svg"
import pencilSquareIcon from "../img/pencil-square.svg"
import trashIcon from "../img/trash.svg"
import addIcon from "../img/plus-square.svg"

export const runApp = () => {


    // List stores and creates/edits/deletes objects that hold groups of task objects. i.e "Grocery List".
    // List also creates list node elements in the DOM
    const List = (() => {

        // This is the list of lists
        const ListStorage = new Map()

        // Add a new list to ListStorage 
        function createListObject(name) {
            const newList = new Map()
            const hash = name + new Date()
            const listContainer = {
                listName: name,
                list: newList,
                hash: hash,
            }

            ListStorage.set(hash, listContainer)
            return hash
        }

        function createListNode(listObject) {
            const listNode = createNode("div", listsContainer, "", "sideBarList")
            const listIcon = createNode("img", listNode, "", "listIcon")
            listIcon.src = emptyAppIcon
            const listName = createNode("div", listNode, "", "listName")
            listName.textContent = listObject.listName
            const listCount = createNode("div", listNode, "", "listCount")
            listCount.textContent = listObject.list.size
            return listNode
        }

        function createListBinder(listObject, listNode) {
            const listHash = listObject.hash
            const listBinder = new ListBinderInstance(listNode, listObject, listHash)

            return listBinder
        }



        return { ListStorage, createListObject, createListNode, createListBinder }
    })()

    // Render inserts interactable DOM elements, such as forms and buttons.
    const Render = (() => {

        // Form for adding new lists
        const renderAddListForm = (() => {

            const form = document.getElementById("newListContainer")
            const inputFocus = document.getElementById("newListTitle")

            function show() {
                form.style.display = "flex"
                inputFocus.focus()
            }

            function hide() {
                form.style.display = "none"
                // Move the add list form container, so it shows up at the bottom the next time it is opened
                const newItem = document.getElementById("listsContainer").lastChild
                newItem.parentNode.insertBefore(form, newItem.nextSibling)
            }

            return { show, hide }

        })()

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

            // Assigns task and list hashes from original task to the form, so on submission the form can use the hash to 
            // identify and update the correct task object
            editTaskContainer.setAttribute("data-taskHash", taskBinder.taskHash)
            editTaskContainer.setAttribute("data-listHash", taskBinder.listHash)

            editTaskContainer.style.display = "flex"
        }


        return { renderAddTaskForm, renderEditTaskForm, renderAddListForm }
    })()

    // TaskBinder creates/edits/deletes objects that pair together a task node and a task object.
    const TaskBinder = (() => {

        const TaskBinderStorage = new Map()

        function createTaskObject(completeBool, title, dueDate) {

            const taskHash = title + new Date()

            const task = {
                completeBool,
                title,
                dueDate,
                taskHash,
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

            taskNode.setAttribute("data-title", taskObject.title)
            taskNode.setAttribute("data-duedate", taskObject.dueDate)

            return taskNode
        }

        function storeTaskBinder(taskBinder) {
            TaskBinderStorage.set(taskBinder.taskHash, taskBinder)
            List.ListStorage.get(taskBinder.listHash).list.set(taskBinder.taskHash, taskBinder)
        }

        function createTaskBinder(taskNode, taskObject, listHash) {
            const taskHash = taskObject.taskHash
            const taskBinder = new TaskBinderInstance(taskNode, taskObject, listHash, taskHash)

            return taskBinder
        }

        function deleteTaskBinder(taskBinder) {
            taskBinder.node.remove()
            taskBinder.obj = null
            List.ListStorage.get(taskBinder.listHash).list.delete(taskBinder.taskHash)
            TaskBinder.TaskBinderStorage.delete(taskBinder.taskHash)
        }

        function editTaskBinder(taskBinder, newTitle, newDate) {

            // Update the task object with the newly edited data
            taskBinder.obj.title = newTitle
            taskBinder.obj.dueDate = newDate

            // Update the node with the newly edited data in the task object
            taskBinder.change()
        }

        return { TaskBinderStorage, storeTaskBinder, createTaskBinder, deleteTaskBinder, editTaskBinder, createTaskObject, createTaskNode }
    })()

    // Listeners applies functionality to buttons in DOM elements.
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
                    taskBinder.node.style.display = "none"
                    Render.renderEditTaskForm(taskBinder)
                })
            }

            _addDeletionListener(taskBinder)
            _addEditListener(taskBinder)
        }

        const addListButton = (() => {
            const button = document.getElementById("addListButton")
            button.addEventListener("click", function () { Render.renderAddListForm.show() })
        })()

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

        const submitButtons = (() => {

            // Function to prevent page from refreshing when new task form is submitted
            const _submitRefreshBlocker = (() => {
                const buttons = document.querySelectorAll(".submitRefreshBlocker")
                buttons.forEach(function (button) {
                    button.addEventListener("submit", (e) => {
                        e.preventDefault()
                    })
                })
            })()

            function editTaskSubmit() {

                const editTaskContainer = document.getElementById("editTaskContainer")
                const taskHash = editTaskContainer.dataset.taskhash
                const taskBinder = TaskBinder.TaskBinderStorage.get(taskHash)

                // Get the edited form data
                const completeBool = false // make this changeable later
                const title = document.getElementById("editItemTitle").value
                const date = Date.parse(document.getElementById("editDateInput").dataset.date)

                // Update the taskBinder
                TaskBinder.editTaskBinder(taskBinder, title, date)

                // Reset and hide the form
                document.getElementById("editTaskForm").reset()
                editTaskContainer.style.display = "none"

                // Reveal the edited node
                taskBinder.node.style.display = "flex"
            }

            const editTaskSubmitButton = document.querySelector("#editTaskSubmit")
            editTaskSubmitButton.addEventListener("click", function () {
                editTaskSubmit()
            })

            // Function to handle submission of form input into new task binder
            function submitNewTask() {
                const title = document.getElementById("newItemTitle").value
                const date = Date.parse(document.getElementById("dateInput").dataset.date)
                const completeBool = false // make this changeable later
                const taskObject = TaskBinder.createTaskObject(completeBool, title, date)
                const taskNode = TaskBinder.createTaskNode(taskObject)
                const listHash = userContentContainer.dataset.activelist
                const taskBinder = TaskBinder.createTaskBinder(taskNode, taskObject, listHash)
                TaskBinder.storeTaskBinder(taskBinder)
                Listeners.applyTaskListeners(taskBinder)
            }

            const newTaskSubmitButton = document.getElementById("newItemSubmit")
            newTaskSubmitButton.addEventListener("click", function () {
                submitNewTask()
                Render.renderAddTaskForm.hide()
                document.getElementById("newTaskForm").reset()
            })


            // Function to handle of submission of form input into new list
            function submitNewList() {
                const listTitle = document.getElementById("newListTitle").value
                const listObjectHash = List.createListObject(listTitle)
                const listObject = List.ListStorage.get(listObjectHash)
                const listNode = List.createListNode(listObject)
                const listBinder = List.createListBinder(listObject, listNode)
                Render.renderAddListForm.hide()
            }

            const newListSubmitButton = document.getElementById("newListSubmit")
            newListSubmitButton.addEventListener("click", function () {
                submitNewList()
            })

        })()

        return { applyTaskListeners }

    })()

    // APP LOGIC
    const App = (() => {

        // Dev tools to be deleted when production ready.
        const devStuff = (() => {

            // Demo list
            const demoListHash = List.createListObject("demoList")
            const demoListNode = List.createListNode(List.ListStorage.get(demoListHash))


            // Make the Demo list the one that is currently loaded in the userContent area (so when new tasks are created, 
            // they know to be added to this list)
            userContentContainer.setAttribute("data-activeList", demoListHash)

            // Demo task
            const demoTask = TaskBinder.createTaskObject(false, "Demo Task", new Date(), demoListHash)
            List.ListStorage.get(demoListHash).list.set(demoTask.taskHash, demoTask)

            // Easy check
            document.getElementById("topBar").addEventListener("click", function () {
                console.log("LIST STORAGE")
                console.log(List.ListStorage)
                console.log("TASK BINDER STORAGE")
                console.log(TaskBinder.TaskBinderStorage)
            })
        })()



        // Render stored tasks from stored data for this user, and generate taskBinders.
        let listIterator = List.ListStorage.entries()

        for (let i = 0; i < List.ListStorage.size; i++) {
            let listInfo = listIterator.next().value
            // console.log(listInfo)
            let listHash = listInfo[0]
            let list = listInfo[1].list
            for (let taskObject of list.values()) {
                console.log("dan Carlin")
                let taskNode = TaskBinder.createTaskNode(taskObject)
                let newTaskBinder = TaskBinder.createTaskBinder(taskNode, taskObject, listHash)
                TaskBinder.storeTaskBinder(newTaskBinder)
            }
        }

        // Apply listeners to rendered tasks.
        for (let taskBinder of TaskBinder.TaskBinderStorage.values()) {
            Listeners.applyTaskListeners(taskBinder)
        }

    })()
}