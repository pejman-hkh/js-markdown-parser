import { parseMarkdown } from "./jsmp"

const parser = new parseMarkdown(`
[link1] [link2]

# H1
## H2
### H3
#### H4
##### H5
###### H6

#Not H1

12. list with number
2. list with number

Text sample

- **bold:**  list
- **bold:**  list [link] ***bold italic***

> blockquote

This is \`code\` sample

\`\`\`go
pre sample
\`\`\`

Sample text
[link](https://www.telegram.org)
`)

const doc = parser.parse()
console.log(doc)

const html = parser.getHtml(doc)
console.log(html)

const test = document.getElementById('app') as HTMLDivElement
test.innerHTML = html