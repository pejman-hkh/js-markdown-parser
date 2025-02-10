type NodeType = {
  type?: string
  text?: string,
  children?: Array<NodeType>
  parent?: NodeType
  attrs?: any
}

const isNumeric = (val: string): boolean => {
  return !isNaN(Number(val));
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

      if (tok == '*' || tok == '_' || tok == '`' || tok == '~' || tok == '>' || tok == "\n" || tok == "\n" || tok == '#' || tok == '[' || tok == ']' || tok == ')') {
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

  parseTag({ node, type, tempNode, pre }: { node: NodeType, type: string, tempNode?: NodeType, pre?: string }) {

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


    if (pre && tempNode) {
      node.type = 'text1'
      node.text = pre
      tempNode.type = 'text1'
      tempNode.children = nodes

    } else {
      node.type = 'text1'
      node.children = nodes
    }

  }

  getChildren({ parent, enode }: { parent: NodeType, enode: NodeType }) {
    const nodes: Array<NodeType> = []

    while (this.i < this.len) {
      const tok = this.text[this.i]
      const node: NodeType = {}
      let tempNode: NodeType = {}

      if (tok == '`') {

        this.i++
        let next = this.text[this.i]
        if (next == '`' && this.text[this.i + 1] == '`') {
          this.i += 2
          const code = this.getUntil('```')
          node.type = 'pre'
          node.text = code

          this.i += 3

          if (this.text[this.i] == "\n") {
            this.i++
          }

        } else {
          if (parent.type == "code") {
            enode.type = "code"
            break
          }

          this.parseTag({ node, type: "code", tempNode, pre: '`' })
        }

      } else if (tok == "\n") {
        this.i++
        let next = this.text[this.i]
        if (parent.type == "blockquote") {
          enode.type = "blockquote"
          break
        }

        if (parent.type == "li") {
          if (next != "\n")
            this.i--
          enode.type = "li"
          break
        }

        if (parent.type?.match(/h[1-6]+/ig)) {
          enode.type = parent.type
          break
        }

        if (next == '-') {
          this.i++
          const next = this.text[this.i]
          if (next == ' ') {
            this.i++
            node.attrs = { type: "ul" }
            this.parseTag({ node, type: "li" })
          } else {
            node.type = 'br'
          }
        } else if (next?.match(/[0-9]+/)) {

          let start = next
          while (this.i < this.len && isNumeric(next)) {
            this.i++
            next = this.text[this.i]
            if (next != '.')
              start += next
          }
          this.i--
          if (this.text[this.i + 1] == '.' && this.text[this.i + 2] == ' ') {
            this.i += 2
            node.attrs = { type: "ol", start: start }
            this.parseTag({ node, type: "li" })

          } else {
            node.type = 'br'
          }
        } else {
          node.type = 'br'
        }

      } else if (tok == ')') {
        this.i++
        if (parent.type == "link") {
          enode.type = "link"
          break
        }

        nodes.push({ type: 'text', text: ')' })

      } else if (tok == ']') {
        this.i++
        if (parent.type == "a") {
          enode.type = "a"
          break
        }

        nodes.push({ type: 'text', text: ']' })
      } else if (tok == '[') {
        this.i++
        node.attrs = { href: "#" }
        this.parseTag({ node, type: "a" })

        if (node.type == 'a') {

          if (this.text[this.i] == '(') {
            this.i++

            this.parseTag({ node: tempNode, type: "link" })

            if (tempNode?.type == 'link') {
              node.attrs = { href: tempNode?.children?.[0]?.text }
              tempNode = {}
            } else {
              if (tempNode?.children) {
                tempNode?.children.unshift({ type: 'text', text: '(' })
              }
            }
          }
        } else {
          nodes.push({ type: 'text', text: '[' })
        }
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

        for (let i = 2; i < 7; i++) {
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

          this.parseTag({ node, type: "del", tempNode, pre: '~~' })
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

            this.parseTag({ node, type: "bolditalic", tempNode, pre: '***' })

          } else {

            if (parent.type == "b") {
              enode.type = "b"
              break
            }

            this.parseTag({ node, type: "b", tempNode, pre: '**' })
          }
        } else {
          if (parent.type == "i") {
            enode.type = "i"
            break
          }

          this.parseTag({ node, type: "i", tempNode, pre: '*' })

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

      if (tempNode?.children && tempNode?.children?.length > 0) {
        tempNode?.children?.map((n: NodeType) => {
          nodes.push(n)
        })
      }
    }

    return nodes
  }

  parse() {
    const document: NodeType = { type: "document" }
    document.children = this.getChildren({ parent: document, enode: document })
    return document
  }

  makeAttrsText(attrs: any) {
    let ret = ''

    for (const key in attrs) {
      const value = attrs[key]
      ret += ' ' + key + '="' + value + '"'
    }
    return ret
  }

  getHtml(node: NodeType) {
    let html = ''
    let liStart = false
    let listType = "ol"

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

        if (node?.type != 'li') {
          if (liStart) {
            liStart = false
            html += `</` + listType + `>`
          }
        }

        if (node?.type == 'bolditalic') {
          html += '<b><i>' + content + '</i></b>'
        } else if (node?.type == 'li') {
          if (!liStart) {
            liStart = true
            listType = node?.attrs?.type
            html += `<` + node?.attrs?.type + `` + (node?.attrs?.type == 'ol' ? ' start="' + node?.attrs?.start + '"' : "") + `>`
          }

          html += `<li>` + content + `</li>`;
        } else if (node?.type == 'text1') {
          html += content
        } else if (node?.type == 'br') {
          html += '<br />'
        } else {
          html += '<' + node?.type + '' + this.makeAttrsText(node?.attrs) + '>' + content + '</' + node?.type + '>'
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