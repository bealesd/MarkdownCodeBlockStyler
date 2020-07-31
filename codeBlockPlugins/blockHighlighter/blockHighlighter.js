BlockHighlighter = function() {
    class BlockHighlighter {
        constructor() {
            if (!MarkdownCodeBlockStyler.instance) {
                this.id = 'blockHighlighter';
                this.position = 'afterLineBreaks';
                this.exampleType = ['example-good', 'example-bad', 'example-neutral'];

                const href = 'https://cdn.jsdelivr.net/gh/bealesd/MarkdownCodeBlockStyler/codeBlockPlugins/blockHighlighter/blockHighlighter.css';
                this.loadCss(href);

                BlockHighlighter.instance = this;
            }

            return BlockHighlighter.instance;
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
                return this.getCodeBlockExampleType(codeTokens)
            };
        }

        updateBlock() {
            return (codeBlockExampleType, htmlString) => {
                return this.setCodeBlockExampleType(codeBlockExampleType, htmlString)
            };
        }
        getCodeBlockExampleType(tokens) {
            let codeBlockExampleType = {};
            tokens.forEach((token, index) => {
                const pluginOptions = token['lang'];
                const exampleTypeString = pluginOptions.split(' ').filter(opt => opt.includes('exampleType:'))[0];
                let exampleType = exampleTypeString !== undefined ? `example-${exampleTypeString.split(':')[1].toLocaleLowerCase()}` : null;

                if (!this.exampleType.includes(exampleType))
                    exampleType = 'example-neutral';

                codeBlockExampleType[`${index}`] = { 'exampleType': exampleType };
            });
            return codeBlockExampleType;
        }

        setCodeBlockExampleType(codeBlockExampleType, htmlString) {
            const div = document.createElement('div');
            div.innerHTML = htmlString;

            div.querySelectorAll('pre').forEach((pre, index) => {
                const exampleType = codeBlockExampleType[`${index}`]['exampleType'];
                pre.classList.add(exampleType);
            });
            return div.innerHTML;
        }
    }
    return new BlockHighlighter();
}()