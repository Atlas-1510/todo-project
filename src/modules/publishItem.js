import { getDOMelements } from "./getDOMelements.js"

export const publishItem = (item) => {
    console.log("publish item activated")
    const DOM = getDOMelements()

    // Creates the item in the list
    const createItemModule = (item) => {
        // Basic item module set up
        const itemModule = document.createElement("div")
        itemModule.classList.add("itemModule")

        const itemModuleCheckBox = document.createElement("button")
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

    // Applies the event listeners to the list item
    const applyListeners = (itemModule, listItemData) => {

        const _expandListItem = (listItemData) => {

            console.log("double active")

            // Modal - to hold expanded list item info
            const modal = document.createElement("div")
            modal.setAttribute("id", "modal")
            modal.classList.add("modal")
            DOM.contentWindow.appendChild(modal)

            const modalHeader = document.createElement("h1")
            modal.appendChild(modalHeader)
            modalHeader.textContent = listItemData.title


            // Overlay - to darken background
            const overlay = document.createElement("div")
            overlay.setAttribute("id", "overlay")
            DOM.contentWindow.appendChild(overlay)

            modal.classList.add("active")
        }

        itemModule.addEventListener("click", () => {
            console.log("active")
            _expandListItem(listItemData)
        })
    }

    const newModule = createItemModule(item)

    applyListeners(newModule, item)
}