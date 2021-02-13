import publish from "./publishEvent"
import format from 'date-fns/format'

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
        const objectTitle = this.obj.title
        let objectDueDate
        if (this.obj.dueDate) {
            objectDueDate = format(this.obj.dueDate, "dd/MM/yy")
        }


        this.node.querySelector(".taskDescription").textContent = objectTitle
        this.node.querySelector(".taskDueDate").textContent = objectDueDate

        console.log(this)
    }
}