import { parseMarkdown } from "./jsmp"

const parser = new parseMarkdown(`**bold1**

  test
  
  > test blockquote
  
  \`\`\` go
  package main
  
  func main() {
  
  }
  
  \`\`\`
  test
  
  `)
  
  const doc = parser.parse()
  console.log(doc)
  
  const html = parser.getHtml(doc)
  console.log(html)
  
  const test = document.getElementById('app') as HTMLDivElement
  test.innerHTML = html