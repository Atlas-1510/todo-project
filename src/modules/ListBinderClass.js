import publish from "./publishEvent"

export default class ListBinder {
    constructor(node, obj, hash) {

        this.node = node
        this.obj = obj
        this.listHash = listHash
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
        const objectName = this.obj.name
        this.node.querySelector(".listName").textContent = objectName
        console.log(this)
    }
}