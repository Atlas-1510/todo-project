// import ListItem from "./ListItem.js"


const mainDOM = document.getElementById("mainDOM")

class ListItem {
    constructor(title, dueDate, priority, description, flag) {
        this.title = title
        this.dueDate = dueDate
        this.priority = priority
        this.description = description
        this.flag = flag
        this.creationDate = "" // get current date here somehow
    }
}

const firstList = {
    listName: "firstList",
    listItems: [],
}

const createListItem = (list, title, dueDate, priority, description, flag) => {
    const newListItem = new ListItem(title, dueDate, priority, description, flag)
    list.listItems.push(newListItem)
}

createListItem(firstList, "first item", "next June")
createListItem(firstList, "second item")
createListItem(firstList, "third item")

const publishList = (list) => {
    for (let i = 0; i < list.listItems.length; i++) {
        publishItem(list.listItems[i])
    }
}

const publishItem = (item) => {
    // Basic item module set up
    const itemModule = document.createElement("div")
    const itemModuleTitle = document.createElement("h1")
    const itemModuleDetails = document.createElement("ul")
    itemModule.appendChild(itemModuleTitle)
    itemModule.appendChild(itemModuleDetails)
    // Filling in module details
    itemModuleTitle.textContent = item.title
    console.log(item)
    for (property in item) {
        console.log(item[property])
        if (item[property] != undefined) {
            let dotpoint = document.createElement("li")
            dotpoint.textContent = `${property}: ${item[property]}`
            itemModuleDetails.appendChild(dotpoint)
        }
    }
    mainDOM.appendChild(itemModule)
}

publishList(firstList)


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
mainDOM.appendChild(newListItemForm)

function logSubmit(event) {
    let title = document.getElementById("formTitle").value
    let dueDate = document.getElementById("formDueDate").value
    console.log(title);
    console.log(dueDate);
    const newItem = new ListItem(title, dueDate)
    publishItem(newItem, firstList)



    event.preventDefault()
}

const form = document.getElementById('form');
const log = document.getElementById('log');
form.addEventListener('submit', logSubmit);