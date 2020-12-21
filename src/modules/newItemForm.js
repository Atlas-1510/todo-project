import ListItem from "./ListItemClass.js"
import { publishItem } from "./publishItem.js"

export function newItemForm() {
    const addItemFormDOM = (() => {
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
    })()

    const addItemFormFunctionality = (() => {
        function logSubmit(event) {
            event.preventDefault()
            let title = document.getElementById("formTitle").value
            let dueDate = document.getElementById("formDueDate").value
            const newItem = new ListItem(title, dueDate)
            publishItem(newItem)
        }

        const form = document.getElementById('form');
        form.addEventListener('submit', logSubmit);
    })()
}