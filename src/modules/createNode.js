export default function createNode(type, parent, idName = "", className = []) {
    const node = document.createElement(type)
    if (parent == undefined) {
        document.querySelector("#projectContainer").appendChild(node)
    } else {
        parent.appendChild(node)
    }

    if (idName) {
        node.setAttribute("id", idName)
    }

    if (className) {
        if (Array.isArray(className)) {
            for (let i = 0; i < className.length; i++) {
                node.classList.add(className[i])
            }
        } else if (typeof className == "string") {
            node.classList.add(className)
        }
    }


    return node
}