import createNode from "./createNode"
import emptySquareIcon from "../img/square.svg"
import filledSquareIcon from "../img/square-fill.svg"
import pencilSquareIcon from "../img/pencil-square.svg"
import trashIcon from "../img/trash.svg"


export const runApp = () => {



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
    renderTask(false, "Test Title Here", "31/1/12")
}