import publish from "./publishEvent"
import format from 'date-fns/format'
import createNode from "./createNode"
import flagIcon from "../img/flag.svg"

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
        const nodeTitle = this.node.dataset.title
        const nodeDueDate = this.node.dataset.duedate

        this.obj.title = nodeTitle
        this.obj.dueDate = nodeDueDate

        console.log(this)
    }

    // CHANGE handles transfer of data from object to node
    change() {
        // Title
        const objectTitle = this.obj.title

        // Date
        let objectDueDate
        if (this.obj.dueDate) {
            objectDueDate = format(this.obj.dueDate, "dd/MM/yy")
        }

        // Flag
        if (this.obj.flagged) {
            if (!this.node.querySelector(".taskFlagIcon")) {
                // Create a flag icon on the task here
                const flagNode = createNode("img", this.node, "", "taskFlagIcon")
                flagNode.src = flagIcon
                this.node.insertBefore(flagNode, this.node.querySelector(".editTaskIcon"))
            }
        } else {
            const flagNode = this.node.querySelector(".taskFlagIcon")
            if (flagNode) {
                flagNode.remove()
            }
        }

        this.node.querySelector(".taskDescription").textContent = objectTitle
        this.node.querySelector(".taskDueDate").textContent = objectDueDate

        console.log(this)
    }
}