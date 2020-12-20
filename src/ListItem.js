// list item using class syntax

export default class ListItem {
    constructor(title, dueDate, priority, description, flag) {
        this.title = title
        this.dueDate = dueDate
        this.priority = priority
        this.description = description
        this.flag = flag
        this.creationDate = "" // get current date here somehow
    }
}