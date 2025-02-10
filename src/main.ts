import { parseMarkdown } from "./jsmp"

const parser = new parseMarkdown(`
[link1] [link2]

# H1
## H2
### H3
#### H4
##### H5
###### H6

1. list with number
2. list with number

That's it.  Pretty simple.  There's also a drop-down option above to switch between various views:

- **bold:**  list
- **bold:**  list [link] ***bold italic***

> blockquote

sample text
[link](https://www.telegram.org)
`)

const doc = parser.parse()
console.log(doc)

const html = parser.getHtml(doc)
console.log(html)

const test = document.getElementById('app') as HTMLDivElement
test.innerHTML = html