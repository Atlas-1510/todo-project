import List from "./modules/ListClass.js"
import ListItem from "./modules/ListItemClass.js"
import { publishList } from "./modules/publishList.js"
import { updateSidePanel } from "./modules/updateSidePanel"
import { newItemForm } from "./modules/newItemForm.js"
import { renderFrontEndLayout } from "./modules/renderFrontEndLayout.js"
import { getElements } from "./modules/elementsDOM.js"

import "./index.css"

// ********** Backend **********

// List declarations
const listsArray = []

const firstList = new List("firstList")
const secondList = new List("secondList")
listsArray.push(firstList, secondList)

const createListItem = (parentList, title, dueDate, priority, description, flag, location, parentItem) => {
    const newListItem = new ListItem(parentList, title, dueDate, priority, description, flag, location, parentItem)
    parentList.listItems.push(newListItem)
}

createListItem(firstList, "first item", "next June", "high", "this is the first item", "blue", "another element")
createListItem(firstList, "second item - first list")
createListItem(secondList, "first item - second list", "a due date")


// ********** Frontend **********

const DOM = getElements()

// layout setup
renderFrontEndLayout()

// Publish lists to sidepanel
updateSidePanel(listsArray)

const renderMainWindow = (list) => {
    while (list.firstChild) {
        list.removeChild(list.childNodes[0])
    }
    publishList(list)
}

renderMainWindow(secondList)