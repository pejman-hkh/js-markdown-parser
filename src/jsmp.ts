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

        if (parent.type?.match(/h[1-6]+/ig)) {
          enode.type = parent.type
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
        let next = this.text[this.i]
        let type = "h1"
        let text = '#'

        for (let i = 2; i < 6; i++) {
          if (next == '#') {
            this.i++
            next = this.text[this.i]
            type = "h" + i
            text += '#'
          } else {
            break
          }
        }

        if (next == ' ') {
          this.i++
          this.parseTag({ node, type: type })
        } else {
          nodes.push({ type: 'text', text: text })
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

            if (parent.type == "b") {
              enode.type = "b"
              break
            }

            this.parseTag({ node, type: "b" })
          }
        } else {
          if (parent.type == "i") {
            enode.type = "i"
            break
          }

          this.parseTag({ node, type: "i" })
        }
      } else if (tok == '_') {
        this.i++
        const next = this.text[this.i]
        if (next == '_') {
          this.i++
          if (parent.type == "b") {
            enode.type = "b"
            break
          }

          this.parseTag({ node, type: "b" })
        } else {
          if (parent.type == "i") {
            enode.type = "i"
            break
          }
          this.parseTag({ node, type: "i" })
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
        if (node?.type == 'bolditalic') {
          html += '<b><i>' + content + '</i></b>'
        } else if (node?.type == 'br') {
          html += '<br />'
        } else {
          html += '<' + node?.type + '>' + content + '</' + node?.type + '>'
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