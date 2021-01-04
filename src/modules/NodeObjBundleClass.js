// This class produces objects that link together a node element, and a data storage object.
// The class methods enable two-way communication between the front-end DOM element, and the backend data object, when either is changed.


export default class NodeObjBundle {
    constructor(element, obj) {
        this.element = element
        this.obj = obj
        element.value = obj
        element.addEventListener("change", this)
    }

    handleEvent(event) {
        switch (event.type) {
            case "change": this.change(this.element.value)
        }
    }

    change(value) {
        this.element.value = value
        this.obj = value
    }
}