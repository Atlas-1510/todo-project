// Foreign modules
import add from 'date-fns/add'
import format from 'date-fns/format'
import isToday from 'date-fns/isToday'
import datepicker from 'js-datepicker'
import ColorPicker from 'simple-color-picker';
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
        function createListObject(name, color) {
            const newList = new Map()
            const hash = name + new Date()
            const listContainer = {
                listName: name,
                list: newList,
                hash: hash,
            }

            if (color != "") {
                listContainer.color = color
            }

            ListStorage.set(hash, listContainer)
            return hash
        }

        function createListNode(listContainer) {
            const listNode = createNode("div", listsContainer, "", "sideBarList")
            const listPointer = createNode("div", listNode, "", "listPointer")
            if (listContainer.color) {
                listPointer.style.backgroundColor = listContainer.color
            }
            const listName = createNode("div", listNode, "", "listName")
            listName.textContent = listContainer.listName
            const listCount = createNode("div", listPointer, "", "listCount")
            listCount.textContent = listContainer.list.size
            const listEditIcon = createNode("img", listNode, "", ["editListIcon", "listIcon"])
            listEditIcon.src = pencilSquareIcon
            const listDeleteIcon = createNode("img", listNode, "", ["deleteListIcon", "listIcon"])
            listDeleteIcon.src = trashIcon
            return listNode
        }

        function createListBinder(listContainer, listNode) {
            console.log(listContainer)
            const listHash = listContainer.hash
            const listBinder = new ListBinderInstance(listNode, listContainer, listHash)
            ListBinderStorage.set(listHash, listBinder)
            return listBinder
        }

        function editListBinder(listBinder, title, color) {
            if (title !== "") {
                listBinder.container.listName = title
            }

            listBinder.container.color = color
            listBinder.change()
        }

        function updateTaskCounters() {

            ListBinderStorage.forEach(function (listBinder) {
                const taskCount = listBinder.node.querySelector(".listCount")
                taskCount.textContent = listBinder.obj.size
            })
        }

        return { ListStorage, createListObject, createListNode, createListBinder, ListBinderStorage, updateTaskCounters, editListBinder }
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

            const flagNodeHolder = createNode("div", taskNode, "", "flagNodeHolder")
            if (taskObject.flagged) {
                // Create a flag icon on the task here
                const flagNode = createNode("img", flagNodeHolder, "", "taskFlagIcon")
                flagNode.src = flagIcon
            } else {
                const flagNode = createNode("img", flagNodeHolder, "", "taskFlagIcon")
            }
            taskNode.insertBefore(flagNodeHolder, editTaskIcon)

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
            }

            taskBinder.obj.dueDate = newDate

            if (!isNaN(newDate)) {
                taskBinder.obj.scheduled = true
            } else {
                taskBinder.obj.scheduled = false
            }

            if (taskBinder.obj.flagged != flagToggle) {
                taskBinder.obj.flagged = flagToggle
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

            // today search goes here. But how to fit in If/Else logic?

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

                            // If the search parameter is 'today', do something different
                            if (searchParameters[i] == "today") {
                                if (!isToday(task.dueDate)) {
                                    shouldAddThisOne = false
                                }
                            } else if (task[searchParameters[i]] != true) {
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
                    if (Render.renderEditTaskForm.editFormActive) {
                        Render.renderEditTaskForm.hide()
                    }
                    if (Render.renderAddTaskForm.newFormActive) {
                        Render.renderAddTaskForm.hide()
                    }
                    Render.renderEditTaskForm.show(taskBinder)
                    Render.renderAddListForm.hide()
                })
            }

            _addDeletionListener(taskBinder)
            _addEditListener(taskBinder)
        }

        function applyListListeners(listBinder) {
            const node = listBinder.node
            node.addEventListener("click", function () {
                Render.renderAddListForm.hide()
                Render.renderAddTaskForm.hide()
                Render.renderEditTaskForm.hide()
                contentController.unloadLists()
                contentController.loadList(listBinder.listHash)
                contentController.refreshTopBar(listBinder.listHash)
                document.getElementById("lowerAddTask").style.display = "flex"
            })

            const editButton = listBinder.node.querySelector(".editListIcon")
            editButton.addEventListener("click", () => {
                node.style.display = "none"
                Render.renderEditListForm.show(listBinder)
            })

            const deleteButton = listBinder.node.querySelector(".editAbortButton")
            // NEED TO ADD DELETE LIST FUNCTIONALITY HERE
        }

        const addListButton = (() => {
            const button = document.getElementById("addListButton")
            button.addEventListener("click", function () {
                if (Render.renderEditTaskForm.editFormActive) {
                    Render.renderEditTaskForm.hide()
                }
                if (Render.renderAddTaskForm.newFormActive) {
                    Render.renderAddTaskForm.hide()
                }
                Render.renderAddListForm.show()
            })
        })()

        const addTaskButtons = (() => {
            const buttons = document.getElementsByClassName("addTaskButton")
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i]
                button.addEventListener("click", function () {

                    if (Render.renderEditTaskForm.editFormActive) {
                        Render.renderEditTaskForm.hide()
                    }

                    if (Render.renderAddTaskForm.newFormActive) {
                        Render.renderAddTaskForm.hide()
                    }
                    Render.renderAddTaskForm.show()
                    Render.renderAddListForm.hide()
                })
            }
        })()

        const datePickers = (() => {
            const dateInputs = document.querySelectorAll(".date")
            dateInputs.forEach(function (dateNode) {
                const dateChange = new Event("dateChange")
                const datePicker = datepicker(dateNode, {
                    formatter: (input, date) => {
                        input.value = format(date, "eee d/M/yy")
                    },
                    onSelect: (instance, date) => {

                        dateNode.dispatchEvent(dateChange)
                        // If in new task form or edit task form
                        const formType = instance.parent.parentNode.id
                        const parsedDate = Date.parse(date)

                        instance.setDate()
                        dateNode.value = format(date, "eee d/M/yy")
                        console.log(dateNode)

                        if (formType == "newTaskForm") {

                            // Not clicking on the checkbox, clicking on the date selector menu
                            // If first click, there shouldn't be a data date attribute yet. toggle date on
                            dateNode.setAttribute("data-date", parsedDate)
                            const newFormDateCheckBox = document.getElementById("newFormDateCheckBox")
                            newFormDateCheckBox.style.display = "flex"
                            newFormDateCheckBox.checked = true
                        }

                        else if (formType == "editTaskForm") {
                            dateNode.setAttribute("data-date", parsedDate)
                            const editFormDateCheckBox = document.getElementById("editFormDateDeleteButton")
                            editFormDateCheckBox.style.display = "flex"
                            editFormDateCheckBox.checked = true
                        }
                    }
                })



                dateNode.addEventListener("dateChange", () => {
                    dateNode.classList.add("dateChosen")
                })
            })
        })()

        const colorPicker = (() => {

            const buttons = document.querySelectorAll(".colorPicker")

            buttons.forEach(button => {
                const colorButton = button
                const colorPickerHolder = colorButton.parentElement.querySelector(".colorPickerHolder")
                let colorPickerActive = false
                colorButton.addEventListener("click", () => {
                    if (colorPickerActive) {
                        return
                    } else {
                        colorPickerActive = true
                    }
                    const colorPicker = new ColorPicker();

                    if (colorButton.dataset.color) {
                        colorPicker.setColor(colorButton.dataset.color)
                    }

                    colorPicker.appendTo(colorPickerHolder)
                    const buttonRect = colorButton.getBoundingClientRect()
                    colorPickerHolder.style.top = `${buttonRect.bottom}px`
                    colorPickerHolder.style.left = `${buttonRect.left}px`

                    const colorButtonHolder = createNode("div", colorPickerHolder, "colorButtonHolder", "")
                    const colorSubmit = createNode("button", colorButtonHolder, "colorSubmit", "listButton")
                    colorSubmit.textContent = "Accept"
                    const colorAbort = createNode("button", colorButtonHolder, "colorAbort", "listButton")
                    colorAbort.textContent = "Remove"

                    colorSubmit.addEventListener("click", () => {
                        const color = colorPicker.getColor()
                        colorButton.style.backgroundColor = color
                        colorButton.setAttribute("data-color", color)
                        colorPicker.remove()
                        colorSubmit.remove()
                        colorAbort.remove()
                        colorPickerActive = false
                    })

                    colorAbort.addEventListener("click", () => {
                        colorButton.removeAttribute("data-color")
                        colorButton.style.backgroundColor = "#F1FAEE"
                        colorPicker.remove()
                        colorSubmit.remove()
                        colorAbort.remove()
                        colorPickerActive = false
                    })

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
                button.setAttribute("data-flagged", false)
                button.addEventListener("click", () => {
                    // get current state in BOOLEAN
                    const priorFlagState = (button.dataset.flagged == "true")
                    // swap to new state
                    if (priorFlagState) {
                        // If it was already flagged, turn flag off
                        button.classList.remove("flagActive")
                        button.setAttribute("data-flagged", false)
                    } else if (!priorFlagState) {
                        // If it wasn't flagged
                        button.classList.add("flagActive")
                        button.setAttribute("data-flagged", true)
                    }
                })
            }
        })()

        const cancelButton = (() => {
            const newTaskButton = document.getElementById("newItemAbort")
            newTaskButton.addEventListener("click", function () {
                document.getElementById("newTaskForm").reset()
                Render.renderAddTaskForm.hide()
            })

            const editTaskButton = document.getElementById("editTaskAbort")
            editTaskButton.addEventListener("click", function () {
                document.getElementById("editTaskForm").reset()
                console.log("hide activated")
                Render.renderEditTaskForm.hide()
                Render.renderEditTaskForm.editFormActive = false
            })

            const newListAbortButton = document.getElementById("newListAbort")
            newListAbortButton.addEventListener("click", function () {
                document.getElementById("newListForm").reset()
                document.getElementById("newListContainer").style.display = "none"
                document.getElementById("newListColor").removeAttribute("data-color")
                document.getElementById("newListColor").removeAttribute("style")
            })

            const editListAbortButton = document.getElementById("editListAbort")
            editListAbortButton.addEventListener("click", function () {
                document.getElementById("editListForm").reset()
                Render.renderEditListForm.hide()
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
                const dateInput = document.getElementById("editDateInput")
                dateInput.classList.remove("dateChosen")
                const date = parseInt(dateInput.dataset.date)
                dateInput.removeAttribute("data-date")
                dateInput.setAttribute("placeholder", "Add Date")
                document.getElementById("editFormDateDeleteButton").style.display = "none"


                // Flag
                const flagButton = document.getElementById("editItemFlag")
                const flagToggle = (flagButton.dataset.flagged == "true")
                flagButton.removeAttribute("data-flagged")
                flagButton.classList.remove("flagActive")

                // Update the taskBinder
                TaskBinder.editTaskBinder(taskBinder, title, date, flagToggle)

                // Reset and hide the form
                document.getElementById("editTaskForm").reset()
                editTaskContainer.style.display = "none"

                // Reveal the edited node
                taskBinder.node.style.display = "grid"
            }

            const editTaskSubmitButton = document.querySelector("#editTaskSubmit")
            editTaskSubmitButton.addEventListener("click", function () {
                editTaskSubmit()
            })

            function editListSubmit() {

                const editListContainer = document.getElementById("editListContainer")
                const listHash = editListContainer.dataset.listhash
                console.log(`LIST HASH: ${listHash}`)
                const listBinder = List.ListBinderStorage.get(listHash)

                // Get the edited form data
                const title = document.getElementById("editListTitle").value
                const color = document.getElementById("editListColor").dataset.color

                // Update the taskBinder
                List.editListBinder(listBinder, title, color)

                // Reset the form
                document.getElementById("editListForm").reset()
                // editListContainer.style.display = "none"

                // Reveal the edited node
                // listBinder.node.style.display = "grid"
                Render.renderEditListForm.hide()
                listBinder.node.click()

            }

            const editListSubmitButton = document.querySelector("#editListSubmit")
            editListSubmitButton.addEventListener("click", function () {
                editListSubmit()
            })


            // Function to handle submission of form input into new task binder
            function submitNewTask() {
                const title = document.getElementById("newItemTitle").value
                if (title == "") {
                    alert("Remember to give your task a title!")
                    return
                }
                const storedDateValue = parseInt(document.getElementById("dateInput").dataset.date)
                const date = storedDateValue
                const completeBool = false // make this changeable later
                const taskObject = TaskBinder.createTaskObject(completeBool, title, date)
                if (!isNaN(date)) {
                    taskObject.scheduled = true
                }
                document.getElementById("dateInput").setAttribute("data-date", NaN)
                document.getElementById("dateInput").classList.remove("dateChosen")
                document.getElementById("newFormDateCheckBox").style.display = "none"



                const flagButton = document.getElementById("newItemFlag")
                if (flagButton.dataset.flagged == "true") {
                    taskObject.flagged = true

                } else {
                    taskObject.flagged = false
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

                if (document.getElementById("dateDeleteButton")) {
                    document.getElementById("dateDeleteButton").remove()
                }
                document.getElementById("dateInput").value = ""
                document.getElementById("dateInput").setAttribute("placeholder", "Add Date")
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
                const listColor = document.getElementById("newListColor").dataset.color
                const listObjectHash = List.createListObject(listTitle, listColor)
                const listObject = List.ListStorage.get(listObjectHash)
                console.log(listObject)
                const listNode = List.createListNode(listObject)
                const listBinder = List.createListBinder(listObject, listNode)
                console.log(listBinder)
                applyListListeners(listBinder)

                userContentContainer.setAttribute("data-activelist", listBinder.listHash)
                contentController.unloadLists()
                contentController.loadList(listBinder.listHash)
                contentController.refreshTopBar(listBinder.listHash)
                Render.renderAddListForm.hide()
                document.getElementById("newListForm").reset()
                document.getElementById("newListColor").removeAttribute("data-color")
                document.getElementById("newListColor").removeAttribute("style")
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
                    document.getElementById("listTitle").style.color = "black"
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
                    document.getElementById("listTitle").style.color = "black"
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
                    document.getElementById("listTitle").style.color = "black"
                    Search.toggles.all = true
                }

                const searchResults = Search.runSearch()
                document.getElementById("topBarListCount").textContent = Object.keys(searchResults).length
            })
        })()

        const todayToggle = (() => {
            const button = document.getElementById("todayToggle")
            button.addEventListener("click", () => {
                contentController.unloadLists()
                if (button.classList.contains("todayToggleActive")) {
                    button.classList.remove("todayToggleActive")
                    Search.toggles.today = false
                }
                else {
                    button.classList.add("todayToggleActive")
                    document.getElementById("listTitle").textContent = "Search"
                    document.getElementById("listTitle").style.color = "black"
                    Search.toggles.today = true
                }

                const searchResults = Search.runSearch()
                document.getElementById("topBarListCount").textContent = Object.keys(searchResults).length
            })
        })()

        const dateCheckBox = (() => {

            // Listener for the date deselector checkbox in the new task form
            // This listener is activated when clicked on to remove a previously selected date
            const newForm = (() => {
                const newFormDateCheckBox = document.getElementById("newFormDateCheckBox")
                const newFormDateSelector = document.getElementById("dateInput")
                newFormDateCheckBox.addEventListener("click", () => {
                    newFormDateSelector.value = ""
                    newFormDateSelector.setAttribute("placeholder", "Add Date")
                    newFormDateSelector.removeAttribute("data-date")
                    newFormDateCheckBox.style.display = "none"
                    document.getElementById("dateInput").classList.remove("dateChosen")
                })
            })()

            const editForm = (() => {
                const editFormDateCheckBox = document.getElementById("editFormDateDeleteButton")
                const editDateInput = document.getElementById("editDateInput")
                editFormDateCheckBox.addEventListener("click", () => {
                    editDateInput.value = ""
                    editDateInput.setAttribute("placeholder", "Add Date")
                    editDateInput.removeAttribute("data-date")
                    editFormDateCheckBox.style.display = "none"
                    document.getElementById("editDateInput").classList.remove("dateChosen")
                })

            })()
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
            if (listContainer.color) {
                topBarTitle.style.color = listContainer.color
            } else {
                topBarTitle.style.color = "black"
            }
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

        const renderAddTaskForm = (() => {

            const form = document.getElementById("newTaskContainer")
            const lowerAddButton = document.getElementById("lowerAddTask")
            const inputFocus = document.getElementById("newItemTitle")

            let newFormActive = false

            function show() {
                form.style.display = "flex"
                lowerAddButton.style.display = "none"
                inputFocus.focus()
                Render.renderAddTaskForm.newFormActive = true
            }

            function hide() {
                newFormActive = false
                form.style.display = "none"
                lowerAddButton.style.display = "flex"
                // Move the 'Add Task' button to the end of the user content container, after the new task item
                const newItem = document.getElementById("userContentContainer").lastChild
                newItem.parentNode.insertBefore(lowerAddButton, newItem.nextSibling)
                // Do the same thing for the 'new task form', so it shows up at the bottom the next time it is opened
                newItem.parentNode.insertBefore(form, newItem.nextSibling)
            }

            return { show, hide, newFormActive }

        })()

        const renderEditListForm = (() => {

            const editListFormContainer = document.getElementById("editListContainer")

            let editListFormActive = false

            function show(listBinder) {
                console.log("Show function activated")
                console.log(listBinder)

                Render.renderEditListForm.editListFormActive = true
                editListFormContainer.style.display = "flex"

                document.getElementById("listsContainer").insertBefore(editListFormContainer, listBinder.node)

                // Title
                const titleSelector = editListFormContainer.querySelector("#editListTitle")
                const priorTitle = listBinder.container.listName
                titleSelector.setAttribute("placeholder", priorTitle)

                // Colour
                const colourSelector = editListFormContainer.querySelector("#editListColor")
                const priorColour = listBinder.container.color
                if (priorColour) {
                    colourSelector.style.backgroundColor = priorColour
                }

                // Assigns list hash from original list to the form, so on submission the form can use the hash to 
                // identify and update the correct list object
                editListFormContainer.setAttribute("data-listHash", listBinder.container.hash)
                editListFormContainer.style.display = "flex"
            }

            function hide() {
                if (Render.renderEditListForm.editListFormActive) {
                    Render.renderEditListForm.editListFormActive = false
                    const listHash = editListFormContainer.dataset.listhash
                    const listBinderInstance = List.ListBinderStorage.get(listHash)
                    listBinderInstance.node.style.display = "grid"

                    editListFormContainer.style.display = "none"
                    editListFormContainer.removeAttribute("data-listHash")
                }
            }

            return { show, hide, editListFormActive }
        })()

        const renderEditTaskForm = (() => {

            const editTaskContainer = document.querySelector("#editTaskContainer")

            let editFormActive = false

            function show(taskBinder) {

                Render.renderEditTaskForm.editFormActive = true

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
                    dateSelector.setAttribute("data-date", taskBinder.obj.dueDate)
                    const editDateCheckBox = document.getElementById("editFormDateDeleteButton")
                    editDateCheckBox.style.display = "flex"
                    editDateCheckBox.checked = true
                    dateSelector.classList.add("dateChosen")
                }

                // Flag
                if (taskBinder.obj.flagged) {
                    const flagButton = document.getElementById("editItemFlag")
                    flagButton.setAttribute("data-flagged", true)
                    flagButton.classList.add("flagActive")
                }

                // Assigns task and list hashes from original task to the form, so on submission the form can use the hash to 
                // identify and update the correct task object
                editTaskContainer.setAttribute("data-taskHash", taskBinder.taskHash)
                editTaskContainer.setAttribute("data-listHash", taskBinder.listHash)

                editTaskContainer.style.display = "flex"
            }

            function hide() {

                if (Render.renderEditTaskForm.editFormActive) {
                    Render.renderEditTaskForm.editFormActive = false
                    const taskHash = editTaskContainer.dataset.taskhash
                    const taskBinderInstance = TaskBinder.TaskBinderStorage.get(taskHash)
                    taskBinderInstance.node.style.display = "flex"

                    editTaskContainer.style.display = "none"
                    editTaskContainer.removeAttribute("data-taskHash")
                    editTaskContainer.removeAttribute("data-listHash")
                }
            }

            return { show, hide, editFormActive }
        })()

        return { renderAddTaskForm, renderEditTaskForm, renderAddListForm, renderEditListForm }
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