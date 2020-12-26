import List from "./modules/ListClass.js"
import ListItem from "./modules/ListItemClass.js"
import { publishList } from "./modules/publishList.js"
import { newItemForm } from "./modules/newItemForm.js"
import { getDOMelements } from "./modules/getDOMelements.js"

import "./index.css"

// ******************** Backend ********************

// List declarations
const listsArray = []

const firstList = new List("firstList", "#457b9d")
const secondList = new List("secondList", "#a73946")
listsArray.push(firstList, secondList)

const createListItem = (parentList, title, dueDate, priority, description, flag, location, parentItem) => {
    const newListItem = new ListItem(parentList, title, dueDate, priority, description, flag, location, parentItem)
    parentList.listItems.push(newListItem)
}

createListItem(firstList, "first item", "next June", "high", "this is the first item", "blue", "another element")
createListItem(firstList, "second item - first list", "other stuff", "more stuff", "you get the point")
createListItem(secondList, "first item - second list", "a due date")


// ******************** Frontend ********************
// layout setup
const renderFrontEndLayout = (() => {

    const mainContent = document.createElement("div")
    mainContent.setAttribute("id", "mainContent")
    document.body.append(mainContent)

    // Top bar
    const topBar = document.createElement("div")
    topBar.setAttribute("id", "topBar")
    mainContent.appendChild(topBar)

    const addNewItemButton = document.createElement("button")
    addNewItemButton.textContent = "+"
    addNewItemButton.setAttribute("id", "addNewItemButton")
    topBar.appendChild(addNewItemButton)

    // Side panel
    const sidePanel = document.createElement("div")
    sidePanel.setAttribute("id", "sidePanel")
    mainContent.appendChild(sidePanel)

    const listOfLists = document.createElement("div")
    listOfLists.setAttribute("id", "listOfLists")
    sidePanel.appendChild(listOfLists)

    const addNewListButton = document.createElement("button")
    addNewListButton.textContent = "+ Add List" // Replace with font awsome icon later
    addNewListButton.setAttribute("id", "addNewListButton")
    sidePanel.appendChild(addNewListButton)

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

    // Add new list contents
    publishList(list)
}

// Publish lists to sidepanel
const updateSidePanel = () => {

    const _renderSideBarListElement = (list) => {
        const sideBarList = document.createElement("div")
        sideBarList.classList.add("sideBarList")

        const sideBarColorIcon = document.createElement("div")
        sideBarColorIcon.classList.add("sideBarColorIcon")
        sideBarColorIcon.style.backgroundColor = list.color
        sideBarList.appendChild(sideBarColorIcon)

        // const listIcon = document.createElement("img") // Figure out how to use emoji-mart for this later
        // listIcon.classList.add("listIcon")
        // listElement.appendChild(listIcon)

        const sideBarListName = document.createElement("div")
        sideBarListName.classList.add("sideBarListName")
        sideBarList.appendChild(sideBarListName)

        const sideBarListItemsCount = document.createElement("div")
        sideBarListItemsCount.classList.add("sideBarListItemsCount")
        sideBarList.appendChild(sideBarListItemsCount)

        // listIcon.src = // Insert source image here from list object??

        sideBarListName.textContent = list.name

        sideBarListItemsCount.textContent = list.listItems.length

        return sideBarList
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