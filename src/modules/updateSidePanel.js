import { getElements } from "./elementsDOM.js"

export const updateSidePanel = (listsArray) => {
    // publish list name to side panel
    const DOM = getElements()
    for (let i = 0; i < listsArray.length; i++) {
        // Add list to side bar
        let listNameElement = document.createElement("li")
        listNameElement.textContent = listsArray[i].name
        DOM.listOfLists.appendChild(listNameElement)
        // Add event listener to list
        listNameElement.addEventListener("click", () => {

        })
    }

}
