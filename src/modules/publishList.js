import { publishItem } from "./publishItem"

export const publishList = (list) => {
    for (let i = 0; i < list.listItems.length; i++) {
        publishItem(list.listItems[i])
    }
}