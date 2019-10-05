import {MathJax} from 'mathjax3';
import {TeX} from 'mathjax3/mathjax3/input/tex';
import {SVG} from 'mathjax3/mathjax3/output/svg';
import {RegisterHTMLHandler} from 'mathjax3/mathjax3/handlers/html';
import {LiteAdaptor} from 'mathjax3/mathjax3/adaptors/liteAdaptor';

function convertTeX2SVG(equation: string, isInline = false) {
  // MathJax bootstrap
  const adaptor = new LiteAdaptor();
  RegisterHTMLHandler(adaptor);
  const html = MathJax.document('', {
    InputJax: new TeX(),
    OutputJax: new SVG({fontCache: 'none'}),
  });
  return adaptor.innerHTML(html.convert(equation, {display: !isInline}));
}

function insertSVGToDocument(svgString: string): void {
  const nodes: SceneNode[] = [];
  const node = figma.createNodeFromSvg(svgString);
  nodes.push(node);
  figma.currentPage.appendChild(node);
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
}

function getSelection(): string | null {
  const sel: SceneNode = figma.currentPage.selection[0];
  if (sel && 'characters' in sel) {
    const text = sel.characters;
    return text;
  }
  return null;
}

function main() {
  const text = getSelection();
  if (!text) {
    return figma.notify(
      'Hint: select text layer containing LaTeX and invoke the plugin',
    );
  }

  const svgString = convertTeX2SVG(text);
  insertSVGToDocument(svgString);
}

main();
// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();
