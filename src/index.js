import List from "./modules/ListClass.js"
import ListItem from "./modules/ListItemClass.js"
import { publishList } from "./modules/publishList.js"
import { newItemForm } from "./modules/newItemForm.js"
import { renderFrontEndLayout } from "./modules/renderFrontEndLayout.js"

import "./index.css"

// Front-end layout setup
renderFrontEndLayout()

// Collect 



// Form for adding new list items
// newItemForm()

// List declarations
const firstList = new List("firstList")
const secondList = new List("secondList")

const createListItem = (parentList, title, dueDate, priority, description, flag, location, parentItem) => {
    const newListItem = new ListItem(parentList, title, dueDate, priority, description, flag, location, parentItem)
    parentList.listItems.push(newListItem)
}

createListItem(firstList, "first item", "next June", "high", "this is the first item", "blue", "another element")
createListItem(firstList, "second item - first list")

createListItem(secondList, "first item - second list", "a due date")

publishList(firstList)
// publishList(secondList)

console.log("active")