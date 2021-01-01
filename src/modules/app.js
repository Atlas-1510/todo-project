import createNode from "./createNode"
import emptySquareIcon from "../img/square.svg"
import filledSquareIcon from "../img/square-fill.svg"
import pencilSquareIcon from "../img/pencil-square.svg"
import trashIcon from "../img/trash.svg"


export const runApp = () => {

    const main = (() => {
        // Renders a task object to the DOM
        function renderTask(completeBool, title, dueDate) {
            const taskNode = createNode("li", userContentContainer, "", "task")
            const checkbox = createNode("img", taskNode, "", "checkbox")
            if (!completeBool) {
                checkbox.src = emptySquareIcon
            } else {
                checkbox.src = filledSquareIcon
            }
            const taskDescription = createNode("div", taskNode, "", "taskDescription")
            taskDescription.textContent = title
            const taskDueDate = createNode("div", taskNode, "", "taskDueDate")
            taskDueDate.textContent = dueDate
            const editTaskIcon = createNode("img", taskNode, "", "editTaskIcon")
            editTaskIcon.src = pencilSquareIcon
            const deleteTaskIcon = createNode("img", taskNode, "", "deleteTaskIcon")
            deleteTaskIcon.src = trashIcon

            return taskNode
        }

        // At the moment can add tasks, but only to DOM. Not actually saving in the backend anywhere.
        // So the next thing to add is an ability to store task information, and then retrieve that info for display in DOM.
        // To store task info, I can use a MAP object.

        // Creates a task object
        function createTask(completeBool, title, dueDate) {
            const task = {
                completeBool,
                title,
                dueDate,
            }
            return task
        }

        // Stores user tasks
        const userData = new Map()

        userData.set('1', createTask(false, "testTitle3", "testDueDate3"))

        // Renders userData Map to DOM
        function renderUserContent(map) {
            for (const entry of map) {
                const task = entry[1]
                renderTask(task.completeBool, task.title, task.dueDate)
            }
        }

        return { renderTask, createTask, renderUserContent, userData }
    })()


    main.renderUserContent(main.userData)
}