import { getDOMelements } from "./getDOMelements"
import { publishItem } from "./publishItem"


export const publishList = (list) => {

    const DOM = getDOMelements()

    const _updateHeader = (list) => {

        // Clear prior header info if present
        const priorHeader = document.getElementById("listHeader")
        if (document.contains(priorHeader)) {
            priorHeader.remove()
        }

        // Update List Header
        const listHeader = document.createElement("div")
        listHeader.setAttribute("id", "listHeader")

        // List Header
        const listTitle = document.createElement("h1")
        listTitle.textContent = list.name
        listTitle.style.color = list.color
        listHeader.appendChild(listTitle)

        // List Item Count
        const listItemCount = document.createElement("h1")
        listItemCount.textContent = list.listItems.length
        listItemCount.style.color = list.color
        listHeader.appendChild(listItemCount)


        DOM.topBar.appendChild(listHeader)
    }
    _updateHeader(list)

    // publish list content to main window
    for (let i = 0; i < list.listItems.length; i++) {
        publishItem(list.listItems[i])
    }
}