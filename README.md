# JSMP
JSMP is tiny Javascript Markdown Parser

This markdown parser is not line-based and will parse markdown anywhere in the text.

For example, it parses heading tags even in the middle of a text and applies them in a nested manner. It also processes bold text and similar formatting across multiple lines.

```
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

```