import { getDOMelements } from "./getDOMelements.js"

// Note that the CSS for this background element is in the top of index.css

export const dimBackground = () => {

    const DOM = getDOMelements()

    // Overlay - to darken background
    const overlay = document.createElement("div")
    overlay.setAttribute("id", "overlay")

    overlay.addEventListener("click", () => {
        overlay.remove()
        let modal = document.querySelector("#modal")
        modal.remove()
    })

    DOM.contentWindow.appendChild(overlay)
}

