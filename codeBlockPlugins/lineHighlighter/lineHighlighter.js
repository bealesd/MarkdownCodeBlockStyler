LineHighlighter = function() {
    class LineHighlighter {
        constructor() {
            return (async() => {
                this.id = 'lineHighlighter';
                this.position = 'afterLineBreaks';
                this.nodeTypeEnum = { 'text': 3, 'element': 1 };

                const fetchLineParserCode = (await (await fetch('https://cdn.jsdelivr.net/gh/bealesd/MarkdownCodeBlockStyler/codeBlockPlugins/lineHighlighter/lineParser.js')).text());
                console.log(fetchLineParserCode);

                const lineParserUrl = 'https://cdn.jsdelivr.net/gh/bealesd/MarkdownCodeBlockStyler/codeBlockPlugins/lineHighlighter/lineParser.js';
                this.lineParser = await this.loadScript(lineParserUrl);

                const href = 'https://cdn.jsdelivr.net/gh/bealesd/MarkdownCodeBlockStyler/codeBlockPlugins/lineHighlighter/lineHighlighter.css';
                this.loadCss(href);
            })();
        }

        // constructor() {
        //     this.id = 'lineHighlighter';
        //     this.position = 'afterLineBreaks';
        //     this.nodeTypeEnum = { 'text': 3, 'element': 1 };

        //     const lineParserUrl = 'https://cdn.jsdelivr.net/gh/bealesd/MarkdownCodeBlockStyler/codeBlockPlugins/lineParser/lineParser.js';
        //     this.lineParser = await loadScript(lineParserUrl);

        //     const href = 'https://cdn.jsdelivr.net/gh/bealesd/MarkdownCodeBlockStyler/codeBlockPlugins/lineHighlighter/lineHighlighter.css';
        //     this.loadCss(href);
        // }

        loadScript(url) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'text/javascript'
                script.onload = () => { resolve(script); };
                script.src = url;
                document.querySelector('head').appendChild(script);
            });
        }

        loadCss(href) {
            const link = document.createElement("link");

            link.type = "text/css";
            link.rel = "stylesheet";
            link.media = "screen,print";
            link.href = href;

            document.querySelector("head").appendChild(link);
        }

        getSettings() {
            return (codeTokens) => {
                return this.getCodeBlockHiglights(codeTokens)
            };
        }

        updateBlock() {
            return (codeBlockHighlights, htmlString) => {
                return this.setCodeBlockHighlights(codeBlockHighlights, htmlString)
            };
        }

        getCodeBlockHiglights(tokens) {
            const codeBlockHiglights = {};
            tokens.forEach((token, index) => {
                const rowCount = token.text.split('\n').length;

                const pluginOptions = token['lang'];
                const rowString = pluginOptions.split(' ').filter(opt => opt.includes('row:'))[0];
                const rawRows = rowString !== undefined ? rowString.split(':')[1].toLocaleLowerCase() : null;

                let rows = null;
                if (rawRows !== null) {
                    let lexemes = this.lineParser.lexer(rawRows);
                    let groups = this.lineParser.syntaxer(lexemes)
                    rows = this.lineParser.codeGeneration(groups, rowCount);
                }

                codeBlockHiglights[`${index}`] = { 'rows': rows };
            });
            return codeBlockHiglights;
        }

        setCodeBlockHighlights(codeBlockHighlights, htmlString) {
            const div = document.createElement('div');
            div.innerHTML = htmlString;

            div.querySelectorAll('pre').forEach((pre, index) => {
                this.convertTextNodesToElementNodes(pre, 0);
            });

            div.querySelectorAll('pre code').forEach((code, index) => {
                const lineNumber = { value: 1 };
                this.addLineNumbersToNodes(code, lineNumber);

            });

            div.querySelectorAll('pre code').forEach((code, index) => {
                const rows = codeBlockHighlights[index].rows;
                if (rows === null) return;

                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    let matchingElems = code.querySelectorAll(`[data-line="${row}"]`);
                    matchingElems.forEach((elem) => {
                        elem.classList.add('highlightedCode');
                    });
                }
            });

            return div.innerHTML;
        }

        convertTextNodeToElementNode(node) {
            const nodeElementsInOrder = [];
            const nodeValue = node.nodeValue;
            for (let j = 0; j < nodeValue.length; j++) {
                const char = nodeValue[j];
                if (char === "\n") {
                    nodeElementsInOrder.push(document.createElement('br'));
                } else {
                    const textDiv = document.createElement('span');
                    textDiv.innerHTML = char;
                    textDiv.class = 'text';
                    nodeElementsInOrder.push(textDiv);
                }
            }

            const elementTextNode = document.createElement('span')
            elementTextNode.append(...nodeElementsInOrder);
            return elementTextNode;
        }

        replaceElement(oldElement, newElement) {
            oldElement.parentNode.replaceChild(newElement, oldElement);
        }

        convertTextNodesToElementNodes(current) {
            const children = current.childNodes;
            for (let i = 0, len = children.length; i < len; i++) {
                const childNode = children[i];
                if (childNode.nodeType === this.nodeTypeEnum.text) {
                    const newNode = this.convertTextNodeToElementNode(childNode);
                    this.replaceElement(childNode, newNode);
                }
                if (childNode.nodeType === this.nodeTypeEnum.element && !childNode.classList.contains('line-numbers-rows'))
                    this.convertTextNodesToElementNodes(children[i]);
            }
        }

        addLineNumbersToNodes(current, lineNumber) {
            const children = current.childNodes;
            for (let i = 0, len = children.length; i < len; i++) {
                const childNode = children[i];
                if (childNode.nodeType !== this.nodeTypeEnum.element) return;

                if (childNode.nodeName === 'BR')
                    lineNumber.value++;
                else if (!childNode.classList.contains('line-numbers-rows')) {
                    if (childNode.children.length > 0) {
                        this.addLineNumbersToNodes(childNode, lineNumber);
                    } else {
                        childNode.dataset.line = lineNumber.value;
                    }
                }
            }
        }
    }
    return new LineHighlighter();
}()