export const renderFrontEndLayout = () => {

    const trialDIV = document.createElement("div")
    trialDIV.setAttribute("id", "trialDIV")
    document.body.append(trialDIV)

    const mainContent = document.createElement("div")
    mainContent.setAttribute("id", "mainContent")
    document.body.append(mainContent)

    const sidePanel = document.createElement("div")
    sidePanel.setAttribute("id", "sidePanel")
    mainContent.appendChild(sidePanel)

    const contentWindow = document.createElement("div")
    contentWindow.setAttribute("id", "contentWindow")
    mainContent.appendChild(contentWindow)
}