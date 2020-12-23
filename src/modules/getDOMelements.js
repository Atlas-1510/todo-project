export const getDOMelements = () => {
    const mainContent = document.getElementById("mainContent")
    const sidePanel = document.getElementById("sidePanel")
    const listOfLists = document.getElementById("listOfLists")
    const contentWindow = document.getElementById("contentWindow")
    const topBar = document.getElementById("topBar")

    return { mainContent, sidePanel, listOfLists, contentWindow, topBar }
}