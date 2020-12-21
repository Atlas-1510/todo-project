export const getElements = () => {
    const mainContent = document.getElementById("mainContent")
    const sidePanel = document.getElementById("sidePanel")
    const contentWindow = document.getElementById("contentWindow")

    return { mainContent, sidePanel, contentWindow }
}