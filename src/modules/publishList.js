import { publishItem } from "./publishItem"


export const publishList = (list) => {
    // publish list content to main window
    for (let i = 0; i < list.listItems.length; i++) {
        publishItem(list.listItems[i])
    }
}