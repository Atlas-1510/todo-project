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
import flagIcon from "../img/flag.svg"

export const runApp = () => {


    // List stores and creates/edits/deletes objects that hold groups of task objects. i.e "Grocery List".
    // List also creates list node elements in the DOM
    const List = (() => {

        // This is the list of list objects
        const ListStorage = new Map()

        // This is a storage object for list binders. Used to keep references to pairs of list nodes and list objects.
        // Can be used to enable list nodes & object pairs to be renamed by the user (not implemented yet), 
        // and to update side bar count of tasks within a list.
        const ListBinderStorage = new Map()

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

        function createListNode(listContainer) {
            const listNode = createNode("div", listsContainer, "", "sideBarList")
            const listIcon = createNode("img", listNode, "", "listIcon")
            listIcon.src = emptyAppIcon
            const listName = createNode("div", listNode, "", "listName")
            listName.textContent = listContainer.listName
            const listCount = createNode("div", listNode, "", "listCount")
            listCount.textContent = listContainer.list.size
            return listNode
        }

        function createListBinder(listContainer, listNode) {
            const listObject = listContainer.list
            const listHash = listContainer.hash
            const listBinder = new ListBinderInstance(listNode, listObject, listHash)
            ListBinderStorage.set(listHash, listBinder)
            return listBinder
        }

        function editListBinder(listHash, newName) {
            // Not implemented yet. Relies on listBinderStorage above.
        }

        function updateTaskCounters() {

            ListBinderStorage.forEach(function (listBinder) {
                const taskCount = listBinder.node.querySelector(".listCount")
                taskCount.textContent = listBinder.obj.size
            })
        }

        return { ListStorage, createListObject, createListNode, createListBinder, ListBinderStorage, updateTaskCounters }
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
                flagged: false,
                scheduled: false,
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

            if (taskObject.flagged) {
                // Create a flag icon on the task here
                const flagNode = createNode("img", taskNode, "", "taskFlagIcon")
                flagNode.src = flagIcon
                taskNode.insertBefore(flagNode, editTaskIcon)
            }

            document.getElementById("userContentContainer").insertBefore(taskNode, document.getElementById("lowerAddTask"))
            taskNode.setAttribute("data-hash", taskObject.hash)

            taskNode.setAttribute("data-title", taskObject.title)
            taskNode.setAttribute("data-duedate", taskObject.dueDate)

            return taskNode
        }

        // Stores a newly created task object in the list storage object
        function storeTaskBinder(taskBinder) {
            List.ListStorage.get(taskBinder.listHash).list.set(taskBinder.taskHash, taskBinder.obj)
        }

        function createTaskBinder(taskNode, taskObject, listHash) {
            const taskHash = taskObject.taskHash
            const taskBinder = new TaskBinderInstance(taskNode, taskObject, listHash, taskHash)
            TaskBinderStorage.set(taskBinder.taskHash, taskBinder)

            return taskBinder
        }

        function deleteTaskBinder(taskBinder) {
            taskBinder.node.remove()
            taskBinder.obj = null
            List.ListStorage.get(taskBinder.listHash).list.delete(taskBinder.taskHash)
            TaskBinder.TaskBinderStorage.delete(taskBinder.taskHash)
        }

        function editTaskBinder(taskBinder, newTitle, newDate, flagToggle) {

            // Update the task object with the newly edited data
            if (newTitle !== "") {
                taskBinder.obj.title = newTitle
                console.log(`NEW TITLE IS ${newTitle}`)
            }

            if (!isNaN(newDate)) {
                taskBinder.obj.dueDate = newDate
                console.log(`NEW DATE IS ${newDate}`)
            }

            if (taskBinder.obj.flagged != flagToggle) {
                taskBinder.obj.flagged = flagToggle
                console.log(`NEW FLAG IS ${flagToggle}`)
            }

            // Update the node with the newly edited data in the task object
            taskBinder.change()
        }

        return { TaskBinderStorage, storeTaskBinder, createTaskBinder, deleteTaskBinder, editTaskBinder, createTaskObject, createTaskNode }
    })()

    // Search uses the sidebar interface to allow a user to search through all tasks
    const Search = (() => {
        const toggles = {
            scheduled: false,
            flagged: false,
            today: false,
            all: false,
        }

        function runSearch() {

            // Get a list of all the task objects that fit the search requirements
            const searchResultObjects = []

            if (toggles.all) {
                // Iterate over each list in listStorage
                List.ListStorage.forEach((listContainer) => {
                    const list = listContainer.list
                    // Iterate over each task in list
                    list.forEach((task) => {
                        searchResultObjects.push(task)
                    })
                })
            }
            else {
                const searchParameters = []

                for (const [key, value] of Object.entries(toggles)) {
                    if (value) {
                        searchParameters.push(key)
                    }
                }

                // Iterate over each list in listStorage
                List.ListStorage.forEach((listContainer) => {
                    const list = listContainer.list
                    // Iterate over each task in list
                    list.forEach((task) => {
                        let shouldAddThisOne = true
                        // Iterate over each search parameter
                        for (let i = 0; i < searchParameters.length; i++) {
                            if (task[searchParameters[i]] != true) {
                                shouldAddThisOne = false
                            }
                        }

                        if (shouldAddThisOne) {
                            searchResultObjects.push(task)
                        }
                    })
                })
            }

            searchResultObjects.forEach((taskObject) => {
                const listHash = 'searchResults'
                const taskNode = TaskBinder.createTaskNode(taskObject)
                const taskBinder = TaskBinder.createTaskBinder(taskNode, taskObject, listHash)
                Listeners.applyTaskListeners(taskBinder)
            })

            // Hide the add task form

            document.getElementById("lowerAddTask").style.display = "none"

            return searchResultObjects
        }

        return { toggles, runSearch }
    })()

    // Listeners applies functionality to buttons in DOM elements.
    const Listeners = (() => {

        // Edit and Delete buttons for task nodes
        function applyTaskListeners(taskBinder) {
            function _addDeletionListener(taskBinder) {
                const button = taskBinder.node.querySelector(".deleteTaskIcon")
                button.addEventListener("click", function () {
                    TaskBinder.deleteTaskBinder(taskBinder)
                    List.updateTaskCounters()
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

        function applyListListeners(listBinder) {
            const node = listBinder.node
            node.addEventListener("click", function () {
                contentController.unloadLists()
                contentController.loadList(listBinder.listHash)
                contentController.refreshTopBar(listBinder.listHash)
                document.getElementById("lowerAddTask").style.display = "flex"
            })
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
                    onSelect: (instance, date) => {

                        // If in new task form or edit task form
                        const formType = instance.parent.parentNode.id
                        if (formType == "newTaskForm") {
                            let dateDeleteButton = document.getElementById("dateDeleteButton")
                            if (dateDeleteButton) {
                                dateDeleteButton.disabled = false
                                dateDeleteButton.checked = true
                            } else {
                                dateDeleteButton = document.createElement("input")
                                dateDeleteButton.setAttribute("id", "dateDeleteButton")
                                dateDeleteButton.type = "checkbox"
                                dateDeleteButton.setAttribute("checked", "true")
                                const newTaskSubContainer = document.getElementById("newTaskSubContainer")
                                newTaskSubContainer.insertBefore(dateDeleteButton, document.getElementById("dateInput"))
                                dateDeleteButton.addEventListener("click", () => {
                                    console.log("click event on checkbox in NEW TASK FORM")

                                    // get rid of stored date info
                                    dateNode.removeAttribute("data-date")

                                    // Reset the date picker
                                    dateNode.value = "Add Date"
                                    dateNode.setAttribute("placeholder", "")

                                    // deactivate the checkbox
                                    dateDeleteButton.checked = false
                                    dateDeleteButton.disabled = true
                                })
                            }
                        } else if (formType == "editTaskForm") {
                            let dateDeleteButton = document.getElementById("dateDeleteButton")
                            if (dateDeleteButton) {
                                dateDeleteButton.disabled = false
                                dateDeleteButton.checked = true
                            } else {
                                dateDeleteButton = document.createElement("input")
                                dateDeleteButton.setAttribute("id", "dateDeleteButton")
                                dateDeleteButton.type = "checkbox"
                                dateDeleteButton.setAttribute("checked", "true")
                                const editTaskSubContainer = document.getElementById("editTaskSubContainer")
                                editTaskSubContainer.insertBefore(dateDeleteButton, document.getElementById("editDateInput"))
                                dateDeleteButton.addEventListener("click", () => {
                                    console.log("click event on checkbox activated")
                                    // Need to get the task binder
                                    const editTaskContainer = document.getElementById("editTaskContainer")
                                    const taskHash = editTaskContainer.dataset.taskhash
                                    console.log(`taskHash: ${taskHash}`)
                                    const taskBinderInstance = TaskBinder.TaskBinderStorage.get(taskHash)
                                    console.log(`taskBinder:`)
                                    console.log(taskBinderInstance)
                                    taskBinderInstance.obj.dueDate = NaN
                                    console.log(`stored date is ${taskBinderInstance.obj.dueDate}`)
                                    const dateSelector = document.getElementById("editDateInput")
                                    dateSelector.removeAttribute("data-date")
                                    dateSelector.value = ""
                                    dateSelector.setAttribute("placeholder", "Add Date")
                                    dateDeleteButton.disabled = true
                                })
                            }
                        }
                    }
                })
            })
        })()

        const locationButton = (() => {
            const buttons = document.querySelectorAll(".location")
            buttons.forEach((button) => {
                button.addEventListener("click", () => {
                    alert("The location feature has not yet been implemented. Try choosing a date or flagging this task instead :)")
                })
            })
        })()

        const flagButtons = (() => {
            const buttons = document.getElementsByClassName("flagButton")
            for (let i = 0; i < buttons.length; i++) {
                let button = buttons[i]
                button.addEventListener("click", () => {
                    console.log("FLAGBUTTONS SECTION")
                    console.log(`data-flagged: ${button.dataset.flagged}`)
                    console.log(`typeof data-flagged: ${typeof button.dataset.flagged}`)
                    if (button.dataset.flagged == undefined) {
                        button.setAttribute("data-flagged", "true")
                        console.log("this task has been flagged")
                        button.classList.add("flagActive")
                    } else if (button.dataset.flagged == "true") {
                        button.removeAttribute("data-flagged")
                        button.classList.remove("flagActive")
                        console.log("this task has been un-flagged")
                    } else {
                        console.log("flag error")
                    }
                })
            }
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

                // Date
                const date = Date.parse(document.getElementById("editDateInput").dataset.date)

                if (document.getElementById("dateDeleteButton")) {
                    document.getElementById("dateDeleteButton").remove()
                }

                // Flag
                const flagButton = document.getElementById("editItemFlag")
                const flagToggle = (flagButton.dataset.flagged == "true")
                console.log(`editTaskSubmit - flagToggle: ${flagToggle}`)
                flagButton.removeAttribute("data-flagged")
                flagButton.classList.remove("flagActive")

                // Update the taskBinder
                TaskBinder.editTaskBinder(taskBinder, title, date, flagToggle)

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
                if (!isNaN(date)) {
                    taskObject.scheduled = true
                }
                document.getElementById("dateInput").setAttribute("data-date", NaN)
                const flagButton = document.getElementById("newItemFlag")
                if (flagButton.dataset.flagged) {
                    taskObject.flagged = true
                }
                flagButton.removeAttribute("data-flagged")
                flagButton.classList.remove("flagActive")

                const taskNode = TaskBinder.createTaskNode(taskObject)
                const listHash = userContentContainer.dataset.activelist
                const taskBinder = TaskBinder.createTaskBinder(taskNode, taskObject, listHash)
                TaskBinder.storeTaskBinder(taskBinder)
                Listeners.applyTaskListeners(taskBinder)

                List.updateTaskCounters()
                contentController.refreshTopBar(listHash)
                const datePickerActiveSquare = document.getElementsByClassName("qs-active")
                if (datePickerActiveSquare[0]) {
                    datePickerActiveSquare[0].classList.remove("qs-active")
                }

                if (document.getElementById("dateDeleteButton")) {
                    document.getElementById("dateDeleteButton").remove()
                }
                document.getElementById("dateInput").value = ""
                document.getElementById("dateInput").setAttribute("placeholder", "Add Date")
                console.log(document.getElementById("dateInput"))
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
                applyListListeners(listBinder)

                userContentContainer.setAttribute("data-activelist", listBinder.listHash)
                contentController.unloadLists()
                contentController.loadList(listBinder.listHash)
                contentController.refreshTopBar(listBinder.listHash)
                // userContentContainer.dataset.activelist
                Render.renderAddListForm.hide()
                document.getElementById("newListForm").reset()
            }

            const newListSubmitButton = document.getElementById("newListSubmit")
            newListSubmitButton.addEventListener("click", function () {
                submitNewList()
            })

        })()

        const scheduledToggle = (() => {
            const button = document.getElementById("scheduledToggle")
            button.addEventListener("click", () => {
                contentController.unloadLists()
                if (button.classList.contains("scheduledToggleActive")) {
                    button.classList.remove("scheduledToggleActive")
                    Search.toggles.scheduled = false

                } else {
                    button.classList.add("scheduledToggleActive")
                    document.getElementById("listTitle").textContent = "Search"
                    Search.toggles.scheduled = true
                }

                const searchResults = Search.runSearch()
                document.getElementById("topBarListCount").textContent = Object.keys(searchResults).length
            })
        })()

        const flaggedToggle = (() => {
            const button = document.getElementById("flaggedToggle")
            button.addEventListener("click", () => {
                contentController.unloadLists()
                if (button.classList.contains("flaggedToggleActive")) {
                    button.classList.remove("flaggedToggleActive")
                    Search.toggles.flagged = false

                } else {
                    button.classList.add("flaggedToggleActive")
                    document.getElementById("listTitle").textContent = "Search"
                    Search.toggles.flagged = true
                }

                const searchResults = Search.runSearch()
                document.getElementById("topBarListCount").textContent = Object.keys(searchResults).length
            })
        })()

        const allToggle = (() => {
            const button = document.getElementById("allToggle")
            button.addEventListener("click", () => {
                contentController.unloadLists()
                if (button.classList.contains("allToggleActive")) {
                    button.classList.remove("allToggleActive")
                    Search.toggles.all = false
                }
                else {
                    button.classList.add("allToggleActive")
                    document.getElementById("listTitle").textContent = "Search"
                    Search.toggles.all = true
                }

                const searchResults = Search.runSearch()
                document.getElementById("topBarListCount").textContent = Object.keys(searchResults).length
            })
        })()

        return { applyTaskListeners, applyListListeners }

    })()

    // contentController loads/unloads stored user content into the DOM.
    const contentController = (() => {

        // Render list of lists in sidebar
        const loadListsIntoSideBar = (() => {
            let listIterator = List.ListStorage.values()

            for (let i = 0; i < List.ListStorage.size; i++) {
                let listContainer = listIterator.next().value
                let listNode = List.createListNode(listContainer)
                let listBinder = List.createListBinder(listContainer, listNode)
                Listeners.applyListListeners(listBinder)
            }
        })()


        function refreshTopBar(listHash) {
            // Update TopBar information
            const listContainer = List.ListStorage.get(listHash)
            const topBarTitle = document.getElementById("listTitle")
            topBarTitle.textContent = listContainer.listName
            const topBarCount = document.getElementById("topBarListCount")
            topBarCount.textContent = listContainer.list.size
        }

        // Load tasks from a list into the user content container
        function loadList(listHash) {

            userContentContainer.setAttribute("data-activeList", listHash)

            const listContainer = List.ListStorage.get(listHash)
            listContainer.list.forEach(function (taskObject) {
                let taskNode = TaskBinder.createTaskNode(taskObject)
                let taskBinder = TaskBinder.createTaskBinder(taskNode, taskObject, listHash)
                Listeners.applyTaskListeners(taskBinder)
            })
        }

        function unloadLists() {
            // For every taskBinder in task binder storage
            TaskBinder.TaskBinderStorage.forEach(function (taskBinder) {
                // delete the node, but retain the task object
                taskBinder.node.remove()
                // delete the task binder
                TaskBinder.TaskBinderStorage.delete(taskBinder.taskHash)
            })
        }

        return { loadList, unloadLists, loadListsIntoSideBar, refreshTopBar }
    })()

    // Render loads interactable DOM elements such as forms and buttons.
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
            if (!isNaN(taskBinder.obj.dueDate)) {
                const priorDate = format(taskBinder.obj.dueDate, "eee d/M/yy")
                dateSelector.setAttribute("placeholder", priorDate)
                // Optional button to remove date entirely
                const dateDeleteButton = document.createElement("input")
                dateDeleteButton.setAttribute("id", "dateDeleteButton")
                dateDeleteButton.type = "checkbox"
                dateDeleteButton.setAttribute("checked", "true")
                const editTaskSubContainer = document.getElementById("editTaskSubContainer")
                editTaskSubContainer.insertBefore(dateDeleteButton, document.getElementById("editDateInput"))
                dateDeleteButton.addEventListener("click", () => {
                    console.log("click event on checkbox activated")
                    taskBinder.obj.dueDate = NaN
                    console.log(`stored date is ${taskBinder.obj.dueDate}`)
                    dateSelector.removeAttribute("data-date")
                    dateSelector.value = ""
                    dateSelector.setAttribute("placeholder", "Add Date")
                    dateDeleteButton.disabled = true
                })
            }

            // Flag
            if (taskBinder.obj.flagged) {
                const flagButton = document.getElementById("editItemFlag")
                flagButton.setAttribute("data-flagged", true)
                flagButton.classList.add("flagActive")
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

    // APP LOGIC
    const App = (() => {

        // Dev tools to be deleted when production ready.
        const devStuff = (() => {

            function createDemo(title) {

                // Demo list
                // const demoListHash = List.createListObject(title)
                // const demoListNode = List.createListNode(List.ListStorage.get(demoListHash))

                // Demo task
                // const demoTask = TaskBinder.createTaskObject(false, `demo task ${title}`, new Date(), demoListHash)
                // List.ListStorage.get(demoListHash).list.set(demoTask.taskHash, demoTask)

                // return demoListHash
            }

            // const demoLoader = createDemo("first")
            // createDemo("second")
            // createDemo("third")

            // Easy check
            document.getElementById("topBar").addEventListener("click", function () {
                console.log("LIST STORAGE")
                console.log(List.ListStorage)
                console.log("LIST BINDER STORAGE")
                console.log(List.ListBinderStorage)
                console.log("TASK BINDER STORAGE")
                console.log(TaskBinder.TaskBinderStorage)
            })
            // contentController.loadList(demoLoader)
            // contentController.refreshTopBar(demoLoader)

        })()
    })()
}