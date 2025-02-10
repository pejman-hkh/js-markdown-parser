import { parseMarkdown } from "./jsmp"

const parser = new parseMarkdown(`## h2 *italic*
  _this_ is **easy** to \`use\`.
  ~~test~~
  `)

const doc = parser.parse()
console.log(doc)

const html = parser.getHtml(doc)
console.log(html)

const test = document.getElementById('app') as HTMLDivElement
test.innerHTML = html