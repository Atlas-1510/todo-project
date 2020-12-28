import { getDOMelements } from "./getDOMelements.js"
import { dimBackground } from "./dimBackground.js"

export const publishItem = (itemObject) => {
    console.log("publish item activated")
    const DOM = getDOMelements()

    // Creates the item in the list
    const createItemModule = () => {
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
        itemModuleTitle.textContent = itemObject.title
        itemModuleDueDate.textContent = itemObject.dueDate
        itemModulePriority.textContent = itemObject.priority


        DOM.contentWindow.appendChild(itemModule)

        return itemModule
    }

    // Applies the event listeners to the list item and item children
    const applyListeners = (itemNode) => {

        const expandModule = (() => {

            function _expandListItem() {

                // Modal - to hold expanded list item info
                const modal = document.createElement("div")
                modal.setAttribute("id", "modal")
                modal.classList.add("modal")
                DOM.contentWindow.appendChild(modal)
                modal.classList.add("active") // Figure out how to use this for transition effect

                const modalHeader = document.createElement("h1")
                modalHeader.classList.add("modalHeader")
                modalHeader.textContent = itemObject.title
                modal.appendChild(modalHeader)

                const modalDescription = document.createElement("div")
                modalDescription.classList.add("modalDescription")
                modalDescription.textContent = itemObject.description
                modal.appendChild(modalDescription)

                const modalDueDate = document.createElement("div")
                modalDescription.classList.add("modalDescription")
                modalDueDate.textContent = itemObject.dueDate
                modal.appendChild(modalDueDate)

                const modalPriority = document.createElement("div")
                modalDescription.classList.add("modalDescription")
                modalPriority.textContent = itemObject.priority
                modal.appendChild(modalPriority)

                const modalFlag = document.createElement("div")
                modalDescription.classList.add("modalDescription")
                modalFlag.textContent = itemObject.flag
                modal.appendChild(modalFlag)

                const modalLocation = document.createElement("div")
                modalDescription.classList.add("modalDescription")
                modalLocation.textContent = itemObject.location
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

            const expandableElements = []
            const nodeTitle = itemNode.querySelector(".itemModuleTitle")
            expandableElements.push(nodeTitle)
            const nodeDate = itemNode.querySelector(".itemModuleDueDate")
            expandableElements.push(nodeDate)
            const nodePriority = itemNode.querySelector(".itemModulePriority")
            expandableElements.push(nodePriority)

            for (let node = 0; node < expandableElements.length; node++) {
                expandableElements[node].addEventListener("click", _expandListItem)
            }
        })()


        const markAsComplete = (() => {

            const checkBox = itemNode.querySelector(".itemModuleCheckBox")

            const checkIfChecked = () => {
                if (checkBox.checked) {
                    itemNode.classList.add("complete")
                    itemObject.complete = true
                } else if (!checkBox.checked) {
                    itemNode.classList.remove("complete")
                    itemObject.complete = false
                }
            }
            checkBox.addEventListener("click", checkIfChecked)
        }
        )()
    }

    const newNode = createItemModule()
    applyListeners(newNode)
}