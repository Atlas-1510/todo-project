import ListItem from "./ListItemClass.js"
import { publishItem } from "./publishItem.js"
import { getDOMelements } from "./getDOMelements.js"
import { dimBackground } from "./dimBackground.js"

export function newItemForm() {

    const DOM = getDOMelements()

    const addItemFormDOM = (() => {

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

    const addItemFormFunctionality = (() => {
        function logSubmit(event) {

            // Getting the input from the form
            event.preventDefault()
            let title = document.getElementById("formTitle").value
            let dueDate = document.getElementById("formDueDate").value

            // Loading the input into a new ListItem, and attaching that item to the DOM and and the backend list object






            const newItem = new ListItem(title, dueDate)
            publishItem(newItem)
        }

        const form = document.getElementById('form');
        form.addEventListener('submit', logSubmit);
    })()

    dimBackground()
}