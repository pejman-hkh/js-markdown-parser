type NodeType = {
  type?: string
  text?: string,
  children?: Array<NodeType>
  parent?: NodeType
}

export class parseMarkdown {
  text: string;
  len: number;
  i: number;

  constructor(text: string) {
    this.text = text
    this.len = text.length
    this.i = 0
  }

  parseContent({ node }: { node: NodeType }) {
    const buffer: Array<string> = []
    while (this.i < this.len) {
      const tok = this.text[this.i]

      if (tok == '*' || tok == '_' || tok == '`' || tok == '~' || tok == '>' || tok == "\n" || tok == "\n" || tok == '#') {
        break
      }

      buffer.push(tok)
      this.i++
    }
    node.type = "text"
    node.text = buffer.join("")
  }

  isEqual(text: string) {
    const textLen = text.length
    if (this.i + textLen > this.len) {
      return false
    }

    return this.text.substring(this.i, this.i + textLen) == text
  }

  getUntil(until: string) {
    const buffer: Array<string> = []

    while (this.i < this.len) {

      const tok = this.text[this.i]

      if (tok == until[0] && this.isEqual(until)) {
        break
      }
      this.i++

      buffer.push(tok)
    }

    return buffer.join("")
  }

  parseTag({ node, type }: { node: NodeType, type: string }) {
    node.type = type

    const enode: NodeType = {}
    let nodes: Array<NodeType> = []
    while (this.i < this.len) {
      nodes = this.getChildren({ parent: node, enode })

      if (node.type == enode.type) {
        node.children = nodes
        return
      }
    }

    node.type = 'text1'
    node.children = nodes
  }

  getChildren({ parent, enode }: { parent: NodeType, enode: NodeType }) {
    const nodes: Array<NodeType> = []

    while (this.i < this.len) {
      const tok = this.text[this.i]
      const node: NodeType = {}

      if (tok == '`') {

        this.i++
        const next = this.text[this.i]
        if (next == '`' && this.text[this.i + 1] == '`') {
          this.i += 2
          const code = this.getUntil('```')
          node.type = 'code'
          node.text = code

          this.i += 3
        } else {
          if (parent.type == "code") {
            enode.type = "code"
            break
          }

          this.parseTag({ node, type: "code" })
        }

      } else if (tok == "\n") {
        this.i++
        if (parent.type == "blockquote") {
          enode.type = "blockquote"
          break
        }

        if (parent.type == "h1") {
          enode.type = "h1"
          break
        }

        node.type = 'br'
      } else if (tok == '>') {
        this.i++
        const next = this.text[this.i]
        if (next == ' ') {
          this.i++
          this.parseTag({ node, type: "blockquote" })
        } else {

          this.parseTag({ node, type: "text1" })
        }
      } else if (tok == '#') {
        this.i++
        const next = this.text[this.i]
        if (next == ' ') {
          this.i++
          this.parseTag({ node, type: "h1" })
        } else {
          nodes.push({ type: 'text', text: '#' })
          continue
        }

      } else if (tok == '~') {
        this.i++
        const next = this.text[this.i]
        if (next == '~') {
          this.i++
          if (parent.type == "del") {
            enode.type = "del"
            break
          }

          this.parseTag({ node, type: "del" })
        } else {
          nodes.push({ type: 'text', text: '~' })
          continue
        }
      } else if (tok == '*') {

        this.i++
        const next = this.text[this.i]
        if (next == '*') {
          this.i++
          const next = this.text[this.i]
          if (next == '*') {
            this.i++
            if (parent.type == "bolditalic") {
              enode.type = "bolditalic"
              break
            }

            this.parseTag({ node, type: "bolditalic" })

          } else {

            if (parent.type == "bold") {
              enode.type = "bold"
              break
            }

            this.parseTag({ node, type: "bold" })
          }
        } else {
          if (parent.type == "italic") {
            enode.type = "italic"
            break
          }

          this.parseTag({ node, type: "italic" })
        }
      } else if (tok == '_') {
        this.i++
        const next = this.text[this.i]
        if (next == '_') {
          this.i++
          if (parent.type == "bold") {
            enode.type = "bold"
            break
          }

          this.parseTag({ node, type: "bold" })
        } else {
          if (parent.type == "italic") {
            enode.type = "italic"
            break
          }
          this.parseTag({ node, type: "italic" })
        }

      } else {
        this.parseContent({ node })
      }
      nodes.push(node)
    }

    return nodes
  }

  parse() {
    const document: NodeType = { type: "document" }
    document.children = this.getChildren({ parent: document, enode: document })
    return document
  }

  getHtml(node: NodeType) {
    let html = ''
    node.children?.map((node: NodeType) => {
      if (node?.type == 'text') {
        html += node?.text
      } else {
        let content = ''
        if (node?.text) {
          content = node?.text
        } else {
          if (node?.children && node?.children?.length > 0) {
            content = this.getHtml(node)
          }
        }
        if (node?.type == 'bold') {
          html += '<b>' + content + '</b>'
        } else if (node?.type == 'italic') {
          html += '<i>' + content + '</i>'
        } else if (node?.type == 'br') {
          html += '<br />'
        } else if (node?.type == 'pre') {
          html += '<pre>' + content + '</pre>'
        } else if (node?.type == 'code') {
          html += '<code>' + content + '</code>'
        } else if (node?.type == 'del') {
          html += '<del>' + content + '</del>'
        } else if (node?.type == 'h1') {
          html += '<h1>' + content + '</h1>'
        } else if (node?.type == 'blockquote') {
          html += '<blockquote>' + content + '</blockquote>'
        } else if (node?.type == 'bolditalic') {
          html += '<b><i>' + content + '</i></b>'
        } else {
          html += '' + content + ''
        }
      }
    })
    return html
  }
}

export const markdownParser = (text: string) => {
  const parser = new parseMarkdown(text)
  const doc = parser.parse()
  return doc
}

export const markdowToHtml = (text: string) => {
  const parser = new parseMarkdown(text)
  const doc = parser.parse()
  return parser.getHtml(doc)
}