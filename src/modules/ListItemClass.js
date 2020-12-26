// list item using class syntax

export default class ListItem {
    constructor(parentList, title, dueDate, priority, description, flag, location, parentItem) {
        this.parentList = parentList
        this.title = title
        this.dueDate = dueDate
        this.priority = priority
        this.description = description
        this.flag = flag
        this.location = location
        this.parentItem = parentItem
        this.creationDate = "" // get current date here somehow
        this.complete = false
    }
}