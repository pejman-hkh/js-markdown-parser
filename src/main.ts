import { parseMarkdown } from "./jsmp"

const parser = new parseMarkdown(`
test url https://www.google.com

||spoiler||

- test
test 1. test
test > test


[link1] [link2]
test\`\`\`code\`\`\`
~~test

**boldi 

test
**

test # H1
## H2
### H3
#### H4
##### H5
###### H6

#Not H1

12. list with number
2. list with number

\` *code* **bold** \`
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
