import List from "./modules/ListClass.js"
import ListItem from "./modules/ListItemClass.js"
import { publishList } from "./modules/publishList.js"
import { newItemForm } from "./modules/newItemForm.js"
import { getDOMelements } from "./modules/getDOMelements.js"
import { createListItem } from "./modules/createListItem.js"

import "./index.css"

// ******************** Backend ********************

const listsHolder = {}

const demoLists = (() => {
    const firstList = new List("firstList", "#457b9d")
    const secondList = new List("secondList", "#a73946")
    listsHolder.firstList = firstList
    listsHolder.secondList = secondList

    createListItem(firstList, "first item", "next June", "high", "this is the first item", "blue", "another element")
    createListItem(firstList, "second item - first list", "other stuff", "more stuff", "you get the point")
    createListItem(secondList, "first item - second list", "a due date")
})()

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
    addNewItemButton.addEventListener("click", () => {
        newItemForm()
    })
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
// Function to render main content window when new list is loaded
const renderContentWindow = (list) => {
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
        sideBarList.setAttribute("data-list-object-name", list.name)

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

    // publish list name to side panel, add listeners to list elements
    let list;
    for (list in listsHolder) {
        let listObject = listsHolder[list]
        let listNameElement = _renderSideBarListElement(listObject)
        listNameElement.addEventListener("click", () => {
            renderContentWindow(listObject)
            // Set 'active' to false on all lists, then set 'active' to true for this list.
            // Using 'active' property to link list displayed in DOM to backend object.
            let i;
            for (i in listsHolder) {
                listsHolder[i].active = false
            }
            listObject.active = true
        })
        DOM.listOfLists.appendChild(listNameElement)
    }
}

updateSidePanel()

// newItemForm()