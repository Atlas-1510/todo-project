import List from "./modules/ListClass.js"
import ListItem from "./modules/ListItemClass.js"
import { publishList } from "./modules/publishList.js"
import { getDOMelements } from "./modules/getDOMelements.js"
import { createListItem } from "./modules/createListItem.js"
import { publishItem } from "./modules/publishItem.js"
import { dimBackground } from "./modules/dimBackground.js"

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
// Render main content window when new list is selected
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

// Module for adding new items to a list, activated by button

const newItemForm = () => {

    const createPopUpForm = (() => {

        // Pop-up module
        const modal = document.createElement("div")
        modal.setAttribute("id", "modal")
        modal.classList.add("modal")
        DOM.contentWindow.appendChild(modal)
        modal.classList.add("active") // Figure out how to use this for transition effect

        // Form to create list items
        const newListItemForm = document.createElement("form")
        newListItemForm.setAttribute("id", "form")
        // Title input
        const newListItemTitleLabel = document.createElement("label")
        newListItemTitleLabel.textContent = "Title"
        const newListItemTitleInput = document.createElement("input")
        newListItemTitleInput.setAttribute("id", "formTitle")
        // Due date
        const newListItemDueDateLabel = document.createElement("label")
        newListItemDueDateLabel.textContent = "Due Date"
        const newListItemDueDate = document.createElement("input")
        newListItemDueDate.setAttribute("id", "formDueDate")

        // Submit button
        const newListItemButton = document.createElement("button")
        newListItemButton.textContent = "Submit"
        newListItemButton.type = "submit"
        // Appending to DOM
        newListItemForm.appendChild(newListItemTitleLabel)
        newListItemForm.appendChild(newListItemTitleInput)
        newListItemForm.appendChild(newListItemDueDateLabel)
        newListItemForm.appendChild(newListItemDueDate)
        newListItemForm.appendChild(newListItemButton)

        modal.appendChild(newListItemForm)
        DOM.mainContent.appendChild(modal)
    })()

    const processFormInput = (() => {
        function logSubmit(event) {

            // Getting the input from the form
            event.preventDefault()
            let title = document.getElementById("formTitle").value
            let dueDate = document.getElementById("formDueDate").value

            // Loading form input into a new list item object, and storing that object within the list object that is currently active
            // Also loading the input into a new list item node, and attaching that node to the DOM
            let list;
            for (list in listsHolder) {
                let listObject = listsHolder[list]
                if (listObject.active) {
                    const newItem = createListItem(listObject, title, dueDate)
                    publishItem(newItem)
                }
            }
        }

        const form = document.getElementById('form');
        form.addEventListener('submit', logSubmit);
    })()

    dimBackground()
}

updateSidePanel()

