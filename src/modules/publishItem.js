import { getDOMelements } from "./getDOMelements.js"

export const publishItem = (item) => {
    console.log("publish item activated")
    const DOM = getDOMelements()

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

        const itemModuleExpandIcon = document.createElement("div")
        itemModuleExpandIcon.textContent = "ⓘ"; // Convert this to blue "i" icon later with fontawesome
        itemModuleExpandIcon.classList.add("itemModuleExpandIcon")

        itemModule.appendChild(itemModuleCheckBox)
        itemModule.appendChild(itemModuleTitle)
        itemModule.appendChild(itemModuleDueDate)
        itemModule.appendChild(itemModulePriority)
        itemModule.appendChild(itemModuleExpandIcon)


        // Filling in module details
        itemModuleTitle.textContent = item.title
        itemModuleDueDate.textContent = item.dueDate
        itemModulePriority.textContent = item.priority


        DOM.contentWindow.appendChild(itemModule)

        return itemModule
    }

    const applyListener = (item) => {
        const expandButton = item.querySelector(".itemModuleExpandIcon")
        expandButton.addEventListener("click", () => {
            item.classList.add("activeItemModule")
            const expandedModule = item.nextElementSibling;
            if (expandedModule.style.display == "block") {
                expandedModule.style.display = "none"
                item.classList.remove("activeItemModule")
            } else {
                expandedModule.style.display = "block"
            }
        })
    }

    const newModule = createItemModule(item)

    applyListener(newModule)

    const _createExpandedModule = (item) => {
        // Expanded module set up <-- When the list item is clicked to expand

        const ExpItemModule = document.createElement("div")
        ExpItemModule.classList.add("expandedItemModule")

        const ExpItemDescription = document.createElement("div")
        ExpItemDescription.classList.add("ExpItemDescription")
        ExpItemModule.appendChild(ExpItemDescription)

        const ExpItemDetails = document.createElement("div")
        ExpItemDetails.classList.add("ExpItemDetails")
        ExpItemModule.appendChild(ExpItemDetails)

        const ExpItemDate = document.createElement("div")
        ExpItemDate.textContent = item.dueDate
        const ExpItemPriority = document.createElement("div")
        ExpItemPriority.textContent = item.priority
        const ExpItemLocation = document.createElement("div")
        ExpItemLocation.textContent = item.location
        const expandedItemFlag = document.createElement("div")
        ExpItemLocation.textContent = item.flag

        ExpItemDetails.append(ExpItemDate, ExpItemPriority, ExpItemLocation, expandedItemFlag)

        DOM.contentWindow.appendChild(ExpItemModule)
    }
    _createExpandedModule(item)
}