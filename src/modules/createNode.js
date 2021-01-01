export default function createNode(type, parent, idName = "", className = "") {
    const node = document.createElement(type)
    if (parent == undefined) {
        document.querySelector("#projectContainer").appendChild(node)
    } else {
        parent.appendChild(node)
    }

    node.setAttribute("id", idName)
    node.classList.add(className)
    return node
}