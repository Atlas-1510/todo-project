import ListItem from "./modules/ListItem.js"
import { publishList } from "./modules/publishList.js"
import { newItemForm } from "./modules/newItemForm.js"

const mainDOM = document.getElementById("mainDOM")

newItemForm()

class List {
    constructor(name) {
        this.name = name
        this.listItems = []
    }
}



const firstList = {
    listName: "firstList",
    listItems: [],
}

const secondList = {
    listName: "secondList",
    listItems: [],
}

const createListItem = (list, title, dueDate, priority, description, flag, parentItem) => {
    const newListItem = new ListItem(title, dueDate, priority, description, flag, parentItem)
    list.listItems.push(newListItem)
}

createListItem(firstList, "first item", "next June", "high", "this is the first item", "blue", "another element")
createListItem(firstList, "second item - first list")


createListItem(secondList, "first item - second list", "a due date")

publishList(firstList)
publishList(secondList)

console.log("active")