import ListItem from "./ListItemClass.js"

export const createListItem = (parentList, title, dueDate, priority, description, flag, location, parentItem) => {
    const newListItem = new ListItem(parentList, title, dueDate, priority, description, flag, location, parentItem)
    parentList.listItems.push(newListItem)
}