import publish from "./publishEvent"
import format from 'date-fns/format'
import createNode from "./createNode"
import flagIcon from "../img/flag.svg"
import emptySquareIcon from "../img/square.svg"
import filledSquareIcon from "../img/square-fill.svg"

export default class TaskBinder {
    constructor(node, obj, listHash, taskHash) {

        this.node = node
        this.obj = obj
        this.listHash = listHash
        this.taskHash = taskHash
        node.addEventListener("publish", this)

        // DEMO THING
        // node.addEventListener("click", function () { node.dispatchEvent(publish) })

    }

    // PUBLISH Handles transfer of data from node dataset to object
    handleEvent(thing) {
        const nodeTitle = this.node.dataset.name
        const nodeDueDate = this.node.dataset.duedate

        this.obj.name = nodeTitle
        this.obj.date = nodeDueDate

        console.log(this)
    }

    // CHANGE handles transfer of data from object to node
    change() {
        // Title
        const objectTitle = this.obj.name

        // Date
        let objectDueDate
        if (this.obj.date) {
            objectDueDate = format(this.obj.date, "dd/MM/yy")
        }

        // Flag
        if (this.obj.flagged) {
            this.node.querySelector(".taskFlagIcon").src = flagIcon
        } else {
            this.node.querySelector(".taskFlagIcon").src = ""
        }

        // Complete checkbox
        const taskNodeCheckbox = this.node.querySelector(".checkbox")
        if (this.obj.completeBool) {
            taskNodeCheckbox.src = filledSquareIcon
        } else {
            taskNodeCheckbox.src = emptySquareIcon
        }

        this.node.querySelector(".taskDescription").textContent = objectTitle
        this.node.querySelector(".taskDueDate").textContent = objectDueDate
    }
}