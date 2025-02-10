import { parseMarkdown } from "./jsmp"

const parser = new parseMarkdown(`
[clear everything as **b**](https://www.google.com) test
  `)

const doc = parser.parse()
console.log(doc)

const html = parser.getHtml(doc)
console.log(html)

const test = document.getElementById('app') as HTMLDivElement
test.innerHTML = html