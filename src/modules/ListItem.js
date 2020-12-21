// list item using class syntax

export default class ListItem {
    constructor(title, dueDate, priority, description, flag, parentItem) {
        this.title = title
        this.dueDate = dueDate
        this.priority = priority
        this.description = description
        this.flag = flag
        this.parentItem = parentItem
        this.creationDate = "" // get current date here somehow
    }
}