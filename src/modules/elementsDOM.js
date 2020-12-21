export const getElements = () => {
    const mainContent = document.getElementById("mainContent")
    const sidePanel = document.getElementById("sidePanel")
    const listOfLists = document.getElementById("listOfLists")
    const contentWindow = document.getElementById("contentWindow")

    return { mainContent, sidePanel, listOfLists, contentWindow }
}