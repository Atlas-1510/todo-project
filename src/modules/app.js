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
        function createListObject(listParameters) {

            // this function takes an object of the form:
            // {
            //     color: #ABCD
            //     name: "blahblahblah"
            // }

            const newList = new Map()
            const hash = listParameters.name + new Date()
            const listContainer = {
                name: listParameters.name,
                list: newList,
                hash: hash,
            }

            if (listParameters.color != "") {
                listContainer.color = listParameters.color
                listContainer.lightToggle = listParameters.lightToggle
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
            listName.textContent = listContainer.name
            const listCount = createNode("div", listPointer, "", "listCount")
            listCount.textContent = listContainer.list.size
            if (listContainer.lightToggle === 'true' || listContainer.lightToggle === true) {
                listCount.style.color = "black"
            } else {
                listCount.style.color = "white"
            }
            const listEditIcon = createNode("img", listNode, "", ["editListIcon", "listIcon"])
            listEditIcon.src = pencilSquareIcon
            const listDeleteIcon = createNode("img", listNode, "", ["deleteListIcon", "listIcon"])
            listDeleteIcon.src = trashIcon
            return listNode
        }

        function createListBinder(listContainer, listNode) {
            const listHash = listContainer.hash
            const listBinder = new ListBinderInstance(listNode, listContainer, listHash)
            ListBinderStorage.set(listHash, listBinder)
            return listBinder
        }

        function editListBinder(listParameters) {

            // function takes an object like so:
            // {
            //     name: "asdfasdf",
            //     color: "#1234",
            //     listBinder: listBinder,
            // }

            if (listParameters.name !== "") {
                listParameters.listBinder.container.name = listParameters.name
            }

            listParameters.listBinder.container.color = listParameters.color
            listParameters.listBinder.container.lightToggle = listParameters.lightToggle
            listParameters.listBinder.change()
        }

        function updateTaskCounters() {

            ListBinderStorage.forEach(function (listBinder) {
                const taskCount = listBinder.node.querySelector(".listCount")
                taskCount.textContent = listBinder.obj.size
            })
        }

        function deleteListBinder(listBinder) {
            listBinder.node.remove()
            listBinder.obj = null
            List.ListStorage.delete(listBinder.container.hash)
        }

        // Function to handle of submission of form input into new list
        function submitNewList(listParameters) {

            // this function takes an object of the form:
            // {
            //     color: #ABCD
            //     name: "blahblahblah"
            // }

            const listObjectHash = List.createListObject(listParameters)
            const listObject = List.ListStorage.get(listObjectHash)
            const listNode = List.createListNode(listObject)
            const listBinder = List.createListBinder(listObject, listNode)
            Listeners.applyListListeners(listBinder)
            userContentContainer.setAttribute("data-activelist", listBinder.listHash)
            contentController.unloadLists()
            contentController.loadList(listBinder.listHash)
            contentController.refreshTopBar(listBinder.listHash)
            Render.renderAddListForm.hide()
            document.getElementById("newListForm").reset()
            document.getElementById("newListColor").removeAttribute("data-color")
            document.getElementById("newListColor").removeAttribute("style")
            document.getElementById("lowerAddTask").style.display = "flex"

            return listObjectHash
        }

        return { ListStorage, createListObject, createListNode, createListBinder, ListBinderStorage, updateTaskCounters, editListBinder, deleteListBinder, submitNewList }
    })()

    // TaskBinder creates/edits/deletes objects that pair together a task node and a task object.
    const TaskBinder = (() => {

        const TaskBinderStorage = new Map()

        function createTaskObject(taskParameters) {

            const taskHash = taskParameters.name + new Date()

            const task = {
                completeBool: taskParameters.completeBool,
                name: taskParameters.name,
                date: taskParameters.date,
                taskHash: taskHash,
                flagged: taskParameters.flagged,
                scheduled: taskParameters.scheduled,
                listHash: taskParameters.listHash,
                // color: List.ListStorage.get(taskParameters.listHash).color,
                // lightToggle: List.ListStorage.get(taskParameters.listHash).lightToggle
            }

            return task
        }

        function createTaskNode(taskObject) {

            const taskNode = createNode("li", userContentContainer, "", "task")
            if (List.ListStorage.get(taskObject.listHash).color) {
                taskNode.style.backgroundColor = List.ListStorage.get(taskObject.listHash).color
            }
            const checkbox = createNode("img", taskNode, "", "checkbox")
            if (!taskObject.completeBool) {
                checkbox.src = emptySquareIcon
            } else {
                checkbox.src = filledSquareIcon
            }

            const taskDescription = createNode("div", taskNode, "", "taskDescription")
            taskDescription.textContent = taskObject.name

            const taskDueDate = createNode("div", taskNode, "", "taskDueDate")
            if (taskObject.date) {
                let date = taskObject.date
                date = format(date, "dd/MM/yy")
                taskDueDate.textContent = date
            }

            const editTaskIcon = createNode("img", taskNode, "", "editTaskIcon")
            editTaskIcon.src = pencilSquareIcon
            const deleteTaskIcon = createNode("img", taskNode, "", "deleteTaskIcon")
            deleteTaskIcon.src = trashIcon

            const flagNodeHolder = createNode("div", taskNode, "", "flagNodeHolder")
            const flagNode = createNode("img", flagNodeHolder, "", "taskFlagIcon")
            if (taskObject.flagged) {
                flagNode.src = flagIcon
            }







            if (List.ListStorage.get(taskObject.listHash).lightToggle === 'true' || List.ListStorage.get(taskObject.listHash).lightToggle === true) {
                taskNode.style.color = "black"
            } else if (List.ListStorage.get(taskObject.listHash).lightToggle === 'false' || List.ListStorage.get(taskObject.listHash).lightToggle === false) {
                taskNode.style.color = "white"
                taskDueDate.style.color = "white"
                // make complete checkbox, flag, edit, and delete icons all white
                const elements = [checkbox, editTaskIcon, deleteTaskIcon, flagNode]
                for (let i = 0; i < elements.length; i++) {
                    elements[i].classList.add("whiteColouringForDarkBackground")
                }
            }

            taskNode.insertBefore(flagNodeHolder, editTaskIcon)

            document.getElementById("userContentContainer").insertBefore(taskNode, document.getElementById("lowerAddTask"))
            taskNode.setAttribute("data-hash", taskObject.hash)

            taskNode.setAttribute("data-title", taskObject.name)
            taskNode.setAttribute("data-duedate", taskObject.date)

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

        function editTaskBinder(taskParameters) {

            const taskBinder = taskParameters.taskBinder

            // Update the task object with the newly edited data
            if (taskParameters.name !== "") {
                taskBinder.obj.name = taskParameters.name
            }

            taskBinder.obj.date = taskParameters.date

            if (!isNaN(taskParameters.date)) {
                taskBinder.obj.scheduled = true
            } else {
                taskBinder.obj.scheduled = false
            }

            if (taskBinder.obj.flagged != taskParameters.flagged) {
                taskBinder.obj.flagged = taskParameters.flagged
            }

            if (taskParameters.completeBool) {
                taskBinder.obj.completeBool = true
            } else {
                taskBinder.obj.completeBool = false
            }

            // Update the node with the newly edited data in the task object
            taskBinder.change()
        }

        // Function to handle submission of form input into new task binder
        function submitNewTask(taskParameters) {

            // {
            //     name
            //     date
            //     completeBool
            //     flagged
            //     listHash
            // }

            const taskObject = TaskBinder.createTaskObject(taskParameters)
            const taskNode = TaskBinder.createTaskNode(taskObject)
            const taskBinder = TaskBinder.createTaskBinder(taskNode, taskObject, taskParameters.listHash)
            TaskBinder.storeTaskBinder(taskBinder)
            Listeners.applyTaskListeners(taskBinder)
        }

        return { TaskBinderStorage, storeTaskBinder, createTaskBinder, deleteTaskBinder, editTaskBinder, createTaskObject, createTaskNode, submitNewTask }
    })()

    // Search uses the sidebar interface to allow a user to search through all tasks
    const Search = (() => {

        const toggles = {
            scheduled: false,
            flagged: false,
            today: false,
            all: false,
        }

        // Runs a search based on either a text parameter, or an object that contains the bool state of the flagged/scheduled/today/all toggles
        function runSearch(searchType, searchParameters) {

            function _createSearchTest() {
                if (searchType == "toggle") {
                    function searchTest(task, searchParameters) {

                        let shouldAddThisOne = false
                        for (const [key, value] of Object.entries(searchParameters)) {

                            if (key == "all") {
                                if (value) {
                                    shouldAddThisOne = true
                                    break
                                }
                            }

                            else if (key == "today") {
                                if (value) {
                                    if (isToday(task.date)) {
                                        shouldAddThisOne = true
                                        break
                                    }
                                }
                            }

                            else if (value) {
                                if (task[key])
                                    shouldAddThisOne = true
                            }
                        }
                        return shouldAddThisOne
                    }
                    return searchTest

                } else if (searchType == "text") {
                    function searchTest(task, searchParameters) {
                        if (searchParameters == "") {
                            return true
                        } else if (task.name.includes(searchParameters)) {
                            return true
                        } else {
                            return false
                        }
                    }
                    return searchTest
                } else {
                    console.log("Error with createSearchTest - no test type provided")
                }
            }

            const searchTest = _createSearchTest(searchType, searchParameters)

            let searchResultObjects = []

            // Iterate over each list in listStorage
            List.ListStorage.forEach((listContainer) => {
                const list = listContainer.list
                // Iterate over each task in list
                list.forEach((task) => {
                    if (searchTest(task, searchParameters)) {
                        searchResultObjects.push(task)
                    }
                })
            })

            return searchResultObjects
        }

        function publishSearchResults(searchResults) {

            searchResults.forEach((taskObject) => {
                const listHash = 'searchResults'
                const taskNode = TaskBinder.createTaskNode(taskObject)
                const taskBinder = TaskBinder.createTaskBinder(taskNode, taskObject, listHash)
                Listeners.applyTaskListeners(taskBinder)
            })

            // Hide the add task form
            document.getElementById("lowerAddTask").style.display = "none"

            // Update top bar
            document.getElementById("listTitle").textContent = "Search"
            document.getElementById("listTitle").style.color = "black"
            document.getElementById("topBarListCount").textContent = Object.keys(searchResults).length

        }

        return { runSearch, toggles, publishSearchResults }

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
                    Listeners.sideBarToggles.updateSideBarToggleCounts()
                })
            }

            function _addEditListener(taskBinder) {
                const button = taskBinder.node.querySelector(".editTaskIcon")
                button.addEventListener("click", () => {
                    taskBinder.node.style.display = "none"
                    Render.hideAllForms()
                    Render.renderEditTaskForm.show(taskBinder)
                })
            }

            function _addCheckBoxListener(taskBinder) {
                const checkbox = taskBinder.node.querySelector(".checkbox")
                checkbox.addEventListener("click", () => {

                    taskBinder.obj.completeBool = !taskBinder.obj.completeBool

                    if (taskBinder.obj.completeBool) {
                        checkbox.src = filledSquareIcon
                    } else if (!taskBinder.obj.completeBool) {
                        checkbox.src = emptySquareIcon
                    }
                })
            }
            _addCheckBoxListener(taskBinder)
            _addDeletionListener(taskBinder)
            _addEditListener(taskBinder)
        }

        function applyListListeners(listBinder) {
            const node = listBinder.node

            const clickBoxElements = []

            clickBoxElements.push(node.querySelector(".listPointer"))
            clickBoxElements.push(node.querySelector(".listName"))

            clickBoxElements.forEach(element => {
                element.addEventListener("click", function () {

                    Render.hideAllForms()
                    Listeners.sideBarToggles.deactivate()
                    contentController.unloadLists()

                    contentController.loadList(listBinder.listHash)
                    contentController.refreshTopBar(listBinder.listHash)
                    document.getElementById("lowerAddTask").style.display = "flex"
                })
            })

            const editButton = listBinder.node.querySelector(".editListIcon")
            editButton.addEventListener("click", () => {
                node.style.display = "none"
                Render.renderEditListForm.show(listBinder)
            })

            const deleteButton = listBinder.node.querySelector(".deleteListIcon")
            deleteButton.addEventListener("click", () => {
                List.deleteListBinder(listBinder)
                contentController.unloadLists()
                contentController.generateHome()
            })
        }

        const searchBar = (() => {
            const searchInputNode = document.getElementById("searchBar")
            searchInputNode.addEventListener("input", function (e) {
                document.getElementById("clearIcon").style.visibility = "visible"
                contentController.unloadLists()
                Render.hideAllForms()
                const searchResults = Search.runSearch("text", e.target.value)
                Search.publishSearchResults(searchResults)
            })

            const searchClearButton = document.getElementById("clearIcon")
            searchClearButton.addEventListener("click", () => {
                searchInputNode.value = ""
                contentController.unloadLists()
            })
        })()

        const addListButton = (() => {
            const button = document.getElementById("addListButton")
            button.addEventListener("click", function () {
                Render.hideAllForms()
                Render.renderAddListForm.show()
            })
        })()

        const addTaskButtons = (() => {
            const buttons = document.getElementsByClassName("addTaskButton")
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i]
                button.addEventListener("click", function () {
                    Render.hideAllForms()
                    Render.renderAddTaskForm.show()
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
                        if (colorPicker.isDark()) {
                            colorButton.setAttribute("data-lightToggle", false)
                        } else if (colorPicker.isLight()) {
                            colorButton.setAttribute("data-lightToggle", true)
                        }
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
                const lowerAddButton = document.getElementById("lowerAddTask")
                lowerAddButton.style.display = "flex"
            })

            const editTaskButton = document.getElementById("editTaskAbort")
            editTaskButton.addEventListener("click", function () {
                document.getElementById("editTaskForm").reset()
                Render.renderEditTaskForm.hide()
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

            const editTaskSubmitButton = document.querySelector("#editTaskSubmit")
            editTaskSubmitButton.addEventListener("click", function () {

                // GET THE EDIT FORM INFORMATION

                const editTaskContainer = document.getElementById("editTaskContainer")
                const taskHash = editTaskContainer.dataset.taskhash
                const taskBinder = TaskBinder.TaskBinderStorage.get(taskHash)
                const completeBool = (editTaskContainer.dataset.complete === 'true');
                const name = document.getElementById("editItemTitle").value
                const dateInput = document.getElementById("editDateInput")
                const date = parseInt(dateInput.dataset.date)
                const flagButton = document.getElementById("editItemFlag")
                const flagged = (flagButton.dataset.flagged == "true")


                const taskParameters = {
                    taskBinder,
                    completeBool,
                    name,
                    date,
                    flagged,
                }


                TaskBinder.editTaskBinder(taskParameters)

                // RESET AND HIDE THE FORM
                const editFormCheckBox = editTaskContainer.querySelector(".checkbox")
                editFormCheckBox.removeEventListener("click", Listeners.completeCheckBoxEditForm)

                editTaskContainer.removeAttribute("data-complete")

                dateInput.classList.remove("dateChosen")
                dateInput.removeAttribute("data-date")
                dateInput.setAttribute("placeholder", "Add Date")
                document.getElementById("editFormDateDeleteButton").style.display = "none"
                flagButton.removeAttribute("data-flagged")
                flagButton.classList.remove("flagActive")

                document.getElementById("editTaskForm").reset()
                editTaskContainer.style.display = "none"
                editTaskContainer.removeAttribute("data-taskhash")

                // REVEAL THE EDITED NODE
                taskBinder.node.style.display = "grid"

                // Update side bar toggle counts
                Listeners.sideBarToggles.updateSideBarToggleCounts()
            })

            const editListSubmitButton = document.querySelector("#editListSubmit")
            editListSubmitButton.addEventListener("click", function () {
                // Get the edited form data
                const name = document.getElementById("editListTitle").value
                const color = document.getElementById("editListColor").dataset.color
                const lightToggle = document.getElementById("editListColor").dataset.lighttoggle

                const editListContainer = document.getElementById("editListContainer")
                const listHash = editListContainer.dataset.listhash
                const listBinder = List.ListBinderStorage.get(listHash)
                const listParameters = {
                    name: name,
                    color: color,
                    listBinder: listBinder,
                    lightToggle: lightToggle,
                }
                List.editListBinder(listParameters)

                // Reset the form
                document.getElementById("editListForm").reset()

                // Reveal the edited node
                Render.renderEditListForm.hide()
                listBinder.node.querySelector(".listName").click()

                // Update the TopBar
                contentController.refreshTopBar(listHash)
            })

            const newTaskSubmitButton = document.getElementById("newItemSubmit")
            newTaskSubmitButton.addEventListener("click", function () {

                // TASK PARAMETERS
                // {
                //     name
                //     date
                //     completeBool
                //     flagged
                //     listHash
                // }

                // EXTRACT FORM DATA
                const name = document.getElementById("newItemTitle").value
                if (name == "") {
                    alert("Remember to give your task a title!")
                    return
                }
                const date = parseInt(document.getElementById("dateInput").dataset.date)
                let scheduled = false
                if (!isNaN(date)) {
                    scheduled = true
                }
                const completeBool = false
                const listHash = userContentContainer.dataset.activelist
                const flagButton = document.getElementById("newItemFlag")
                let flagged = false
                if (flagButton.dataset.flagged == "true") {
                    flagged = true
                }
                const taskParameters = {
                    name: name,
                    date: date,
                    completeBool: completeBool,
                    listHash: listHash,
                    flagged: flagged,
                    scheduled: scheduled,
                }

                // GENERATE NEW TASK
                TaskBinder.submitNewTask(taskParameters)

                // RESET THE FORM
                if (document.getElementById("dateDeleteButton")) {
                    document.getElementById("dateDeleteButton").remove()
                }
                document.getElementById("dateInput").value = ""
                document.getElementById("dateInput").setAttribute("placeholder", "Add Date")
                flagButton.removeAttribute("data-flagged")
                flagButton.classList.remove("flagActive")
                document.getElementById("dateInput").setAttribute("data-date", NaN)
                document.getElementById("dateInput").classList.remove("dateChosen")
                document.getElementById("newFormDateCheckBox").style.display = "none"
                Render.renderAddTaskForm.hide()
                const lowerAddButton = document.getElementById("lowerAddTask")
                lowerAddButton.style.display = "flex"
                document.getElementById("newTaskForm").reset()

                // UPDATE SIDE BAR AND TOP BAR
                List.updateTaskCounters()
                contentController.refreshTopBar(listHash)
                Listeners.sideBarToggles.updateSideBarToggleCounts()
            })

            const newListSubmitButton = document.getElementById("newListSubmit")
            newListSubmitButton.addEventListener("click", function () {
                const listTitle = document.getElementById("newListTitle").value
                const listColor = document.getElementById("newListColor").dataset.color
                const lightToggle = document.getElementById("newListColor").dataset.lighttoggle
                const listParameters = {
                    name: listTitle,
                    color: listColor,
                    lightToggle: lightToggle,
                }
                List.submitNewList(listParameters)
            })

        })()

        const sideBarToggles = (() => {

            const toggles = ["scheduled", "flagged", "today", "all"]

            toggles.forEach(toggle => {
                const button = document.getElementById(`${toggle}Toggle`)
                button.addEventListener("click", () => {
                    contentController.unloadLists()
                    Render.hideAllForms()
                    if (button.classList.contains(`${toggle}ToggleActive`)) {
                        button.classList.remove(`${toggle}ToggleActive`)
                        Search.toggles[`${toggle}`] = false

                    } else {
                        contentController.unloadLists()
                        button.classList.add(`${toggle}ToggleActive`)
                        document.getElementById("listTitle").textContent = "Search"
                        document.getElementById("listTitle").style.color = "black"
                        Search.toggles[`${toggle}`] = true
                    }

                    const searchResults = Search.runSearch("toggle", Search.toggles)
                    Search.publishSearchResults(searchResults)
                })
            })

            function updateSideBarToggleCounts() {

                toggles.forEach(toggle => {

                    function generateSearchParameters(toggle) {
                        let togglesRange = Object.assign({}, Search.toggles)
                        for (const tog in togglesRange) {
                            togglesRange[tog] = false
                        }
                        togglesRange[toggle] = true

                        return togglesRange
                    }

                    const countNode = document.querySelector(`.${toggle}Count`)
                    const searchParameters = generateSearchParameters(toggle)
                    const searchResults = Search.runSearch("toggle", searchParameters)
                    countNode.textContent = searchResults.length

                })
            }

            function deactivate() {

                toggles.forEach(toggle => {
                    const button = document.querySelector(`#${toggle}Toggle`)
                    if (button.classList.contains(`${toggle}ToggleActive`)) {
                        button.classList.remove(`${toggle}ToggleActive`)
                        Search.toggles[`${toggle}`] = false
                    }
                })
            }

            return { updateSideBarToggleCounts, deactivate }
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

        const completeCheckBoxEditForm = () => {

            const editTaskContainer = document.querySelector("#editTaskContainer")
            const checkbox = editTaskContainer.querySelector(".checkbox")

            let isComplete = (editTaskContainer.dataset.complete === 'true')
            if (isComplete) {
                checkbox.src = emptySquareIcon
                editTaskContainer.setAttribute("data-complete", "false")
            } else {
                checkbox.src = filledSquareIcon
                editTaskContainer.setAttribute("data-complete", "true")
            }
        }

        return { applyTaskListeners, applyListListeners, sideBarToggles, completeCheckBoxEditForm }

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
            topBarTitle.textContent = listContainer.name
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

        function generateHome() {
            const topBarTitle = document.getElementById("listTitle")
            topBarTitle.textContent = "Select or add a list to get started!"
            topBarTitle.style.color = "black"
            document.getElementById("lowerAddTask").style.display = "none"
        }

        return { loadList, unloadLists, loadListsIntoSideBar, refreshTopBar, generateHome }
    })()

    // Render loads/unloads interactable DOM elements such as forms and buttons.
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

            function show() {
                form.style.display = "flex"
                lowerAddButton.style.display = "none"
                inputFocus.focus()
            }

            function hide() {
                form.style.display = "none"
                // Move the 'Add Task' button to the end of the user content container, after the new task item
                const newItem = document.getElementById("userContentContainer").lastChild
                newItem.parentNode.insertBefore(lowerAddButton, newItem.nextSibling)
                // Do the same thing for the 'new task form', so it shows up at the bottom the next time it is opened
                newItem.parentNode.insertBefore(form, newItem.nextSibling)
            }

            return { show, hide }

        })()

        const renderEditListForm = (() => {

            const editListFormContainer = document.getElementById("editListContainer")

            function show(listBinder) {

                Render.renderEditListForm.editListFormActive = true
                editListFormContainer.style.display = "flex"

                document.getElementById("listsContainer").insertBefore(editListFormContainer, listBinder.node)

                // Title
                const titleSelector = editListFormContainer.querySelector("#editListTitle")
                const priorTitle = listBinder.container.name
                titleSelector.setAttribute("placeholder", priorTitle)

                // Colour
                const colourSelector = editListFormContainer.querySelector("#editListColor")
                const priorColour = listBinder.container.color
                if (priorColour) {
                    colourSelector.style.backgroundColor = priorColour
                    colourSelector.setAttribute("data-color", priorColour)
                }

                // Assigns list hash from original list to the form, so on submission the form can use the hash to 
                // identify and update the correct list object
                editListFormContainer.setAttribute("data-listHash", listBinder.container.hash)
                editListFormContainer.style.display = "flex"
            }

            function hide() {

                const listHash = editListFormContainer.dataset.listhash
                const listBinderInstance = List.ListBinderStorage.get(listHash)
                if (listBinderInstance) {
                    listBinderInstance.node.style.display = "grid"
                }

                editListFormContainer.style.display = "none"
                editListFormContainer.removeAttribute("data-listHash")

            }

            return { show, hide }
        })()

        const renderEditTaskForm = (() => {

            const editTaskContainer = document.querySelector("#editTaskContainer")

            function show(taskBinder) {

                userContentContainer.insertBefore(editTaskContainer, taskBinder.node)

                // Complete checkbox
                const checkbox = editTaskContainer.querySelector(".checkbox")
                if (taskBinder.obj.completeBool) {
                    checkbox.src = filledSquareIcon
                    editTaskContainer.setAttribute("data-complete", "true")
                } else if (!taskBinder.obj.completeBool) {
                    checkbox.src = emptySquareIcon
                    editTaskContainer.setAttribute("data-complete", "false")
                }
                checkbox.addEventListener("click", Listeners.completeCheckBoxEditForm)

                // Title
                const titleSelector = editTaskContainer.querySelector("#editItemTitle")
                const priorTitle = taskBinder.obj.name
                titleSelector.setAttribute("placeholder", priorTitle)

                // Date
                const dateSelector = editTaskContainer.querySelector("#editDateInput")
                if (!isNaN(taskBinder.obj.date)) {
                    const priorDate = format(taskBinder.obj.date, "eee d/M/yy")
                    dateSelector.setAttribute("placeholder", priorDate)
                    dateSelector.setAttribute("data-date", taskBinder.obj.date)
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

                const taskHash = editTaskContainer.dataset.taskhash
                const taskBinderInstance = TaskBinder.TaskBinderStorage.get(taskHash)
                // THIS IS THE PROBLEM
                if (taskBinderInstance) {
                    taskBinderInstance.node.style.display = "grid"
                }
                editTaskContainer.style.display = "none"
                editTaskContainer.removeAttribute("data-taskHash")
                editTaskContainer.removeAttribute("data-listHash")
            }

            return { show, hide }
        })()

        const hideAllForms = () => {
            renderAddListForm.hide()
            renderAddTaskForm.hide()
            renderEditListForm.hide()
            renderEditTaskForm.hide()
        }

        return { renderAddTaskForm, renderEditTaskForm, renderAddListForm, renderEditListForm, hideAllForms }
    })()

    const App = (() => {

        // Dev tools to be deleted when production ready.
        const devStuff = (() => {

            // Easy check
            document.getElementById("topBar").addEventListener("click", function () {
                console.log("LIST STORAGE")
                console.log(List.ListStorage)
                // console.log("SEARCH TOGGLES")
                // console.log(Search.toggles)
            })

        })()

        // DEMO CONTENT
        const demoContent = () => {

            const listOne = List.submitNewList({
                name: "Reminders",
                color: "#FFC285",
                lightToggle: true,
            })

            const listTwo = List.submitNewList({
                name: "Groceries",
                color: "#B8AFD5",
                lightToggle: true,
            })

            // const listThree = List.submitNewList({
            //     name: "Coding",
            //     color: "#ED96B3",
            //     lightToggle: true,
            // })

            const currentDate = new Date()

            const tasks = [
                {
                    name: "Get lo-fi playlist from Daniel",
                    listHash: `${listOne}`,
                    flagged: true,
                    scheduled: true,
                    completeBool: false,
                    date: add(currentDate, {
                        days: 4
                    })
                },
                {
                    name: "Pick up gels for peloton this weekend",
                    listHash: `${listOne}`,
                    flagged: false,
                    scheduled: true,
                    completeBool: false,
                    date: add(currentDate, {
                        days: 0
                    })
                },
                // {
                //     name: "Get timber to build new desk from Bunnings",
                //     listHash: `${listOne}`,
                //     flagged: false,
                //     scheduled: true,
                //     date: add(currentDate, {
                //         days: 1
                //     })
                // },
                // {
                //     name: "Stay late at work until jazz gig with Ebony",
                //     listHash: `${listOne}`,
                //     flagged: true,
                //     scheduled: true,
                //     date: add(currentDate, {
                //         days: 3
                //     })
                // },
                // {
                //     name: "Review CV and GitHub profile",
                //     listHash: `${listThree}`,
                //     flagged: true,
                // },
                {
                    name: "Bananas",
                    listHash: `${listTwo}`,
                    completeBool: false,
                },
                {
                    name: "Cereal",
                    listHash: `${listTwo}`,
                    completeBool: true,
                },
                // {
                //     name: "Bread",
                //     listHash: `${listTwo}`,
                // },
                // {
                //     name: "Avocado (2)",
                //     listHash: `${listTwo}`,
                // },
                // {
                //     name: "Greek Yoghurt",
                //     listHash: `${listTwo}`,
                // },
                // {
                //     name: "Roti Bread",
                //     listHash: `${listTwo}`,
                // },
                // {
                //     name: "Hummus",
                //     listHash: `${listTwo}`,
                // },
                // {
                //     name: "Carrots",
                //     listHash: `${listTwo}`,
                // },
                // {
                //     name: "Celery",
                //     listHash: `${listTwo}`,
                // },
                // {
                //     name: "Kombucha",
                //     listHash: `${listTwo}`,
                // },
                // {
                //     name: "Wine",
                //     listHash: `${listTwo}`,
                // },
                // {
                //     name: "Review code organisation best practice",
                //     listHash: `${listThree}`,
                //     flagged: false,
                //     scheduled: true,
                //     date: add(currentDate, {
                //         days: 2
                //     })
                // },
                // {
                //     name: "Follow up on that networking opportunity with Tristan",
                //     listHash: `${listThree}`,
                //     flagged: true,
                //     scheduled: true,
                //     date: add(currentDate, {
                //         days: 0
                //     })
                // },
                // {
                //     name: "Review Odin Project submissions for ways to improve this app",
                //     listHash: `${listThree}`,
                //     flagged: true,
                // },
                // {
                //     name: "Investigate colour design theory, CSS best practice",
                //     listHash: `${listThree}`,
                //     flagged: false,
                // },
            ]

            for (let i = 0; i < tasks.length; i++) {
                TaskBinder.submitNewTask(tasks[i])
            }

            List.updateTaskCounters()

        }

        demoContent()
        // LOCAL STORAGE
        // localStorage.clear()


        const listMap = List.ListStorage

        function generateStringableRecursive(data) {

            let object = {}

            let dataTypes = ['string', 'boolean', 'number', 'undefined']
            if (dataTypes.includes(typeof data) || data instanceof Date) {
                return data
            }
            else if (data instanceof Map) {
                for (let [key, value] of data) {
                    object[key] = generateStringableRecursive(value)
                }
            }
            else if (data instanceof Object) {
                for (let property in data) {
                    object[property] = generateStringableRecursive(data[property])
                }
            }

            return object
        }

        const stringified = JSON.stringify(generateStringableRecursive(listMap))

        const destringified = JSON.parse(stringified)

        function restoreListMap(jsonObject) {

            const restoredListMap = new Map()

            for (let property in jsonObject) {
                let listObject = jsonObject[property]
                let listHash = property

                let listOfTasks = listObject.list

                let newListMap = new Map()

                for (let task in listOfTasks) {
                    let taskObject = listOfTasks[task]
                    let taskHash = task

                    taskObject.date = new Date(taskObject.date)

                    newListMap.set(taskHash, taskObject)
                }

                listObject.list = newListMap
                restoredListMap.set(listHash, listObject)
            }
            return restoredListMap
        }

        contentController.generateHome()
        Listeners.sideBarToggles.updateSideBarToggleCounts()
    })()
}