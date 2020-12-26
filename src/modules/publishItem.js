import { getDOMelements } from "./getDOMelements.js"
import { dimBackground } from "./dimBackground.js"

export const publishItem = (item) => {
    console.log("publish item activated")
    const DOM = getDOMelements()

    // Creates the item in the list
    const createItemModule = (item) => {
        // Basic item module set up
        const itemModule = document.createElement("div")
        itemModule.classList.add("itemModule")

        const itemModuleCheckBox = document.createElement("input")
        itemModuleCheckBox.type = "checkbox"
        itemModuleCheckBox.classList.add("itemModuleCheckBox")

        const itemModuleTitle = document.createElement("div")
        itemModuleTitle.classList.add("itemModuleTitle")

        const itemModuleDueDate = document.createElement("div")
        itemModuleDueDate.classList.add("itemModuleDueDate")

        const itemModulePriority = document.createElement("div")
        itemModulePriority.classList.add("itemModulePriority")

        const itemModuleEditButton = document.createElement("div")
        itemModuleEditButton.textContent = "Edit"
        itemModuleEditButton.classList.add("itemModuleEditButton")

        const itemModuleDeleteButton = document.createElement("div")
        itemModuleDeleteButton.textContent = "Delete"
        itemModuleDeleteButton.classList.add("itemModuleDeleteButton")

        itemModule.appendChild(itemModuleCheckBox)
        itemModule.appendChild(itemModuleTitle)
        itemModule.appendChild(itemModuleDueDate)
        itemModule.appendChild(itemModulePriority)
        itemModule.appendChild(itemModuleEditButton)
        itemModule.appendChild(itemModuleDeleteButton)

        // Filling in module details
        itemModuleTitle.textContent = item.title
        itemModuleDueDate.textContent = item.dueDate
        itemModulePriority.textContent = item.priority


        DOM.contentWindow.appendChild(itemModule)

        return itemModule
    }

    // Applies the event listeners to the list item and item children
    const applyListeners = (itemNode, listItemObject) => {

        function _expandListItem() {

            // Modal - to hold expanded list item info
            const modal = document.createElement("div")
            modal.setAttribute("id", "modal")
            modal.classList.add("modal")
            DOM.contentWindow.appendChild(modal)
            modal.classList.add("active") // Figure out how to use this for transition effect

            const modalHeader = document.createElement("h1")
            modalHeader.classList.add("modalHeader")
            modalHeader.textContent = listItemObject.title
            modal.appendChild(modalHeader)

            const modalDescription = document.createElement("div")
            modalDescription.classList.add("modalDescription")
            modalDescription.textContent = listItemObject.description
            modal.appendChild(modalDescription)

            const modalDueDate = document.createElement("div")
            modalDescription.classList.add("modalDescription")
            modalDueDate.textContent = listItemObject.dueDate
            modal.appendChild(modalDueDate)

            const modalPriority = document.createElement("div")
            modalDescription.classList.add("modalDescription")
            modalPriority.textContent = listItemObject.priority
            modal.appendChild(modalPriority)

            const modalFlag = document.createElement("div")
            modalDescription.classList.add("modalDescription")
            modalFlag.textContent = listItemObject.flag
            modal.appendChild(modalFlag)

            const modalLocation = document.createElement("div")
            modalDescription.classList.add("modalDescription")
            modalLocation.textContent = listItemObject.location
            modal.appendChild(modalLocation)

            // Buttons

            const modalCompleteButton = document.createElement("button")
            modalCompleteButton.textContent = "Complete"
            modal.appendChild(modalCompleteButton)

            const modalEditButton = document.createElement("button")
            modalEditButton.textContent = "Edit"
            modal.appendChild(modalEditButton)

            const modalDeleteButton = document.createElement("button")
            modalDeleteButton.textContent = "Delete"
            modal.appendChild(modalDeleteButton)

            // Overlay to dim background
            dimBackground()
        }

        function _markAsComplete() {
            itemNode.classList.add("complete")
            listItemObject.complete = true
        }

        itemNode.addEventListener("click", _expandListItem)


        const completeToggle = itemNode.querySelector(".itemModuleCheckBox")

        completeToggle.addEventListener("click", _markAsComplete)

        // Need to remove the '_expandListItem' event listener from the checkbox
        // otherwise, when ticking the box, the module will expand
        const checkBox = itemNode.querySelector(".itemModuleCheckBox")
        console.log(checkBox)
        checkBox.removeEventListener("click", _expandListItem)


    }
    const newNode = createItemModule(item)
    applyListeners(newNode, item)
}