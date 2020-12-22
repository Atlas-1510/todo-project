import List from "./modules/ListClass.js"
import ListItem from "./modules/ListItemClass.js"
import { publishList } from "./modules/publishList.js"
import { newItemForm } from "./modules/newItemForm.js"
import { getDOMelements } from "./modules/getDOMelements.js"

import "./index.css"

// ******************** Backend ********************

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


// ******************** Frontend ********************
// layout setup
const renderFrontEndLayout = (() => {

    const mainContent = document.createElement("div")
    mainContent.setAttribute("id", "mainContent")
    document.body.append(mainContent)

    // Side panel
    const sidePanel = document.createElement("div")
    sidePanel.setAttribute("id", "sidePanel")
    mainContent.appendChild(sidePanel)

    const listOfLists = document.createElement("div")
    listOfLists.setAttribute("id", "listOfLists")
    sidePanel.appendChild(listOfLists)

    // Main content
    const contentWindow = document.createElement("div")
    contentWindow.setAttribute("id", "contentWindow")
    mainContent.appendChild(contentWindow)
})()
// Assign DOM elements to object for easy reference
const DOM = getDOMelements()
// Function to refresh main content window when new list is loaded
const updateMainWindow = (list) => {
    // Remove existing list
    while (DOM.contentWindow.firstChild) {
        DOM.contentWindow.removeChild(DOM.contentWindow.childNodes[0])
    }
    // Update List Title Header
    const listHeader = document.createElement("h1")
    listHeader.textContent = list.name
    DOM.contentWindow.appendChild(listHeader)
    // Add new list contents
    publishList(list)
}

// Publish lists to sidepanel
const updateSidePanel = () => {

    const _renderSideBarListElement = (list) => {
        const listElement = document.createElement("div")
        listElement.classList.add("sideBarList")

        const listIcon = document.createElement("img")
        listIcon.classList.add("listIcon")
        listElement.appendChild(listIcon)

        const listName = document.createElement("div")
        listName.classList.add("listName")
        listElement.appendChild(listName)

        const listItemsCount = document.createElement("div")
        listItemsCount.classList.add("listItemsCount")
        listElement.appendChild(listItemsCount)

        // listIcon.src = // Insert source image here from list object??

        listName.textContent = list.name

        listItemsCount.textContent = list.listItems.length

        return listElement
    }

    // publish list name to side panel
    for (let i = 0; i < listsArray.length; i++) {
        // Add list to side bar
        let listNameElement = _renderSideBarListElement(listsArray[i])
        DOM.listOfLists.appendChild(listNameElement)
        // Add event listener to list
        listNameElement.addEventListener("click", () => {
            updateMainWindow(listsArray[i])
        })
    }
}

updateSidePanel(listsArray)

// newItemForm()