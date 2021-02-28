import publish from "./publishEvent"

export default class ListBinder {
    constructor(node, container, hash) {

        this.node = node
        this.container = container
        this.obj = container.list
        this.listHash = hash
        node.addEventListener("publish", this)

    }

    // PUBLISH Handles transfer of data from node dataset to object
    handleEvent(thing) {
        const nodeName = this.node.dataset.name
        this.obj.name = nodeName
        console.log(this)
    }

    // CHANGE handles transfer of data from object to node
    change() {
        const listObjectName = this.container.name
        this.node.querySelector(".listName").textContent = listObjectName
        const listObjectColor = this.container.color
        this.node.querySelector(".listPointer").style.backgroundColor = listObjectColor
        console.log(this)
        const listCounter = this.node.querySelector(".listCount")
        if (this.container.lightToggle === false || this.container.lightToggle === "false") {
            listCounter.style.color = "white"
        } else {
            listCounter.style.color = "black"
        }
    }
}