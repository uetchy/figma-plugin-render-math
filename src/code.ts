import { MathJax } from "mathjax3";
import { TeX } from "mathjax3/mathjax3/input/tex";
import { SVG } from "mathjax3/mathjax3/output/svg";
import { RegisterHTMLHandler } from "mathjax3/mathjax3/handlers/html";
import { LiteAdaptor } from "mathjax3/mathjax3/adaptors/liteAdaptor";

function convertTeX2SVG(equation: string, isInline = false) {
  // MathJax bootstrap
  const adaptor = new LiteAdaptor();
  RegisterHTMLHandler(adaptor);
  const html = MathJax.document("", {
    InputJax: new TeX(),
    OutputJax: new SVG({ fontCache: "none" }),
  });
  const svg = adaptor.innerHTML(html.convert(equation, { display: !isInline }));
  if (svg.includes("merror")) {
    return svg.replace(/<rect.+?><\/rect>/, "");
  }
  return svg;
}

function insertSVGToDocument(
  svgString: string,
  x: number,
  y: number,
  width: number,
  height: number
): FrameNode {
  const node = figma.createNodeFromSvg(svgString);
  node.x = x;
  node.y = y + height;
  node.resize(width, (node.height / node.width) * width);
  figma.currentPage.appendChild(node);
  return node;
}

function getSelectionTextNodes(): TextNode[] | null {
  const textNodes: TextNode[] = figma.currentPage.selection.filter(
    (node): node is TextNode => node.type === "TEXT"
  );
  return textNodes.length > 0 ? textNodes : null;
}

function main() {
  const textNodes = getSelectionTextNodes();
  if (!textNodes) {
    return figma.notify(
      "Hint: select text layer containing LaTeX and invoke the plugin"
    );
  }

  const nodes: SceneNode[] = [];
  for (const textNode of textNodes) {
    const svgString = convertTeX2SVG(textNode.characters);
    const node = insertSVGToDocument(
      svgString,
      textNode.x,
      textNode.y,
      textNode.width,
      textNode.height
    );
    nodes.push(node);
  }
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
}

main();
// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();
