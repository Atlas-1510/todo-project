export const renderFrontEndLayout = () => {

    const mainContent = document.createElement("div")
    mainContent.setAttribute("id", "mainContent")
    document.body.append(mainContent)

    // Side panel
    const sidePanel = document.createElement("div")
    sidePanel.setAttribute("id", "sidePanel")
    mainContent.appendChild(sidePanel)

    const listOfLists = document.createElement("ul")
    listOfLists.setAttribute("id", "listOfLists")
    sidePanel.appendChild(listOfLists)

    // Main content
    const contentWindow = document.createElement("div")
    contentWindow.setAttribute("id", "contentWindow")
    mainContent.appendChild(contentWindow)
}