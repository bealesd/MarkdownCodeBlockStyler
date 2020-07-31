LineNumberer = function() {
    class LineNumberer {
        constructor() {
            this.id = 'lineNumber';
            this.position = 'beforeLineBreaks';

            const href = 'https://cdn.jsdelivr.net/gh/bealesd/MarkdownCodeBlockStyler/codeBlockPlugins/lineNumberer/lineNumberer.css';
            this.loadCss(href);
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
            return null;
        }

        updateBlock() {
            return (htmlString) => {
                return this.setCodeBlockLineNumbers(htmlString)
            };
        }

        setCodeBlockLineNumbers(htmlString) {
            const div = document.createElement('div');
            div.innerHTML = htmlString;

            div.querySelectorAll('pre').forEach((pre) => {
                const language = [...pre.querySelector('code[class*=language]').classList].find((className) => { return className.includes('language'); });
                pre.classList.add(['line-numbers']);
                pre.classList.add([`${language}`]);

                const lineCount = pre.innerText.split('\n').length;

                let linesHtml = '<span aria-hidden="true" class="line-numbers-rows">'
                for (let i = 0; i < lineCount; i++)
                    linesHtml += '<span></span>';
                linesHtml += '</span>';

                pre.querySelector('code').lastElementChild.insertAdjacentHTML('afterEnd', linesHtml);
            });

            return div.innerHTML;
        }
    }
    return new LineNumberer();
}()