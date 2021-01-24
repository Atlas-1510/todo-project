export default class NodeObjectBinder {
    constructor(node, obj, hash) {

        this.node = node
        this.obj = obj
        this.hash = hash
        node.addEventListener("publish", this)

        // The publish listener sits on the parent, and will be fired when any children are changed.
        // Note: may need to define publish event in the main app.
    }

    handleEvent() {
        // When children are changed, they will need to first update the dataset properties before firing "publish"
        // The object specified by the binder will update its values to match those within the node specified by the binder
        this.obj.completeBool = this.node.dataset.completeBool
        obj.title = this.node.dataset.title
        obj.dueDate = this.node.dataset.dueDate
    }

}



// When the child changes, update the data-attribute on the parent, and then call "publish" on the parent