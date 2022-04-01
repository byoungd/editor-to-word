import {
  CustomTagStyleMap,
  HTMLString,
  IExportDoc,
  IExportOption,
  Node,
} from './types';
import { D_Layout, D_TagStyleMap, Tag } from './default';
import {
  Document,
  Footer,
  Header,
  Packer,
  Paragraph,
  ParagraphChild,
  Table,
  convertMillimetersToTwip,
} from 'docx';
import { calcTextRunStyle, getChildrenByTextRun } from './builder/text';
import { isFilledArray, trimHtml } from './utils';
import { tableCreator, tableNodeToITableOptions } from './builder/table';

import JSZip from 'jszip';
import { parse } from 'html-to-ast';
import { saveAs } from 'file-saver';

// text node
export const isTextNode = (node: Node) => node && node.type === 'text';

export const getInnerTextNode = (node: Node) => {
  let inner = node;
  while (inner && inner.children && inner.children.length === 1) {
    inner = inner.children[0];
  }
  return inner;
};

// recursion chain style
export const chainStyle = (
  nodeList: Node[],
  style: string[] = [],
  tagStyleMap: CustomTagStyleMap = D_TagStyleMap
) => {
  if (!nodeList || !isFilledArray(nodeList)) return;

  nodeList.forEach((node) => {
    const { attrs, children, name } = node;
    let STYLE: string[] =
      typeof attrs?.style === 'string' ? [attrs.style, ...style] : style;

    const shape = name ? [name, ...STYLE] : [...STYLE];
    node.shape = shape;

    if (isFilledArray(children)) {
      chainStyle(children, shape, tagStyleMap);
    }
  });
};

// style builder
export const StyleBuilder = (
  list: Node[],
  tagStyleMap: CustomTagStyleMap = D_TagStyleMap
) => {
  const nList = [...list];
  chainStyle(nList, [], tagStyleMap);
  return nList;
};

// element creator
export const ElementCreator = (
  astList: Node[],
  tagStyleMap: CustomTagStyleMap = D_TagStyleMap
): Paragraph[] => {
  if (!astList || astList.length === 0) return [];
  const tags = StyleBuilder(
    astList.filter((n: Node) => n.type === 'tag'),
    tagStyleMap
  );
  if (!tags) return [];
  const ps = tags.map((node: Node) => {
    const { type, name, children, content, shape } = node;
    const para: { text: string; children: ParagraphChild[] } = {
      text: content,
      children: [],
    };
    if (type === Tag.text && content) {
      const paragraphOption = {
        ...para,
        ...calcTextRunStyle(shape, tagStyleMap),
      };
      return new Paragraph(paragraphOption);
    } else if (
      name !== Tag.table &&
      children &&
      isFilledArray(children) &&
      children.length > 0
    ) {
      para.children = getChildrenByTextRun(children, tagStyleMap);
      const paragraphOption = {
        ...para,
        ...calcTextRunStyle(shape, tagStyleMap),
      };
      return new Paragraph(paragraphOption);
    } else if (name === Tag.table) {
      return tableCreator(node, tagStyleMap);
    } else {
      return null;
    }
  });
  // @ts-ignore
  return ps.filter((p) => p instanceof Paragraph || p instanceof Table);
};

// parse '2.54cm' to 2.54
export const numberCM = (size: string) =>
  parseFloat(size?.toUpperCase().replace(/CM/i, ''));

export const htmlToAST = (html: string): Node[] => {
  return parse(html) as Node[];
};

// generate Document
export const genDocument = (html: HTMLString, options?: IExportOption) => {
  const layout = options?.layout || D_Layout;
  const styleMap = options?.tagStyleMap || D_TagStyleMap;

  const ast: Node[] = htmlToAST(html);

  const paragraphs = ElementCreator(ast, styleMap);
  const {
    orientation,
    topMargin,
    leftMargin,
    rightMargin,
    bottomMargin,
    header,
    footer,
  } = layout;

  const margin = {
    top: convertMillimetersToTwip(10 * numberCM(topMargin)),
    left: convertMillimetersToTwip(10 * numberCM(leftMargin)),
    right: convertMillimetersToTwip(10 * numberCM(rightMargin)),
    bottom: convertMillimetersToTwip(10 * numberCM(bottomMargin)),
  };

  const page = {
    margin,
    size: {
      orientation,
    },
  };

  const section = {
    properties: {
      page,
    },
    children: paragraphs,
    headers: {},
    footers: {},
  };

  if (header) {
    const ast = parse(header) as Node[];

    section.headers = {
      default: new Header({
        children: ElementCreator(ast, styleMap),
      }),
    };
  }

  if (footer) {
    const ast = parse(footer) as Node[];
    section.footers = {
      default: new Footer({
        children: ElementCreator(ast, styleMap),
      }),
    };
  }

  const doc = new Document({
    styles: {
      paragraphStyles: [],
    },
    sections: [section],
  });
  return doc;
};

// export html as docx file
export const exportAsDocx = async (doc: Document, docName = '') => {
  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `${docName}.docx`);
  });
};

// html -> docx
export const exportHtmlToDocx = async (
  html: HTMLString,
  docName = 'doc',
  options?: IExportOption
) => {
  const doc = genDocument(trimHtml(html), options);
  exportAsDocx(doc, docName);
  return doc;
};

// export multi files as .zip
export const exportMultiDocsAsZip = async (
  docList: IExportDoc[],
  fileName = 'docs',
  options?: IExportOption
) => {
  const zip = new JSZip();
  const len = docList.length;
  if (len === 1) {
    const d = docList[0];
    const { html, name } = d;
    const file = genDocument(trimHtml(html), options);
    exportAsDocx(file, name);
    return;
  }
  for (let docFile of docList) {
    const { html, name } = docFile;
    const doc = genDocument(trimHtml(html), options);
    const file = await Packer.toBlob(doc);
    zip.file(`${name}.docx`, file);
  }

  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, `${fileName}.zip`);
  });
};

export const exportAsZip = exportMultiDocsAsZip;

export { IExportDoc, IExportOption };

export { parse, tableNodeToITableOptions, D_Layout, D_TagStyleMap };
