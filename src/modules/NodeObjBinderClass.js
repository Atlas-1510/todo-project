// Custom event for NodeObjectBinder class.
const publish = new Event('publish');

export default class NodeObjectBinder {
    constructor(node, obj, listHash, taskHash) {

        this.node = node
        this.obj = obj
        this.listHash = listHash
        this.taskHash = taskHash
        node.addEventListener("publish", this)

        // DEMO THING
        node.addEventListener("click", function () { node.dispatchEvent(publish) })

    }

    handleEvent(thing) {

        console.log(this)
        const nodeTitle = this.node.dataset.title
        const nodeDueDate = this.node.dataset.duedate

        this.obj.title = nodeTitle
        this.obj.dueDate = nodeDueDate

    }
}



// When the child changes, update the data-attribute on the parent, and then call "publish" on the parent