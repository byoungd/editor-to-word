import {
  A4MillimetersWidth,
  CELL_MARGIN,
  D_FontSizePT,
  D_PageTableFullWidth,
  D_TableBorderSize,
  DefaultBorder,
  DocStyle_Default,
  PXbyPT,
  Splitter_Colon,
  Splitter_Semicolon,
  Tag,
  D_TagStyleMap,
  D_Layout,
} from './default';
import {
  BorderStyle,
  Document,
  Footer,
  Header,
  HeightRule,
  IParagraphOptions,
  Packer,
  Paragraph,
  ParagraphChild,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
  convertMillimetersToTwip,
} from 'docx';
import {
  CellParam,
  HTMLString,
  Node,
  StyleInterface,
  StyleOption,
  TableParam,
  CustomTagStyleMap,
  IExportOption,
  IExportDoc,
} from './types';
import {
  getUniqueArrayByKey,
  isFilledArray,
  typeOf,
  trimHtml,
  isValidColor,
  toHex,
} from './utils';
import { provideStyle } from './token';

import { parse } from 'html-to-ast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { handleSizeNumber } from './helpers';
import { StyleMap } from './token/styleMap';

// text node
export const isTextNode = (node: Node) => node && node.type === 'text';

export const isFillTextNode = (node: Node) =>
  node && node.type === 'text' && node.content;

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
  tagStyleMap: CustomTagStyleMap
) => {
  if (!nodeList || !isFilledArray(nodeList)) return;
  nodeList.forEach((node) => {
    const { attrs, children, name } = node;
    let STYLE: string[] =
      typeof attrs?.style === 'string' ? [attrs.style, ...style, name] : style;
    if (Object.keys(tagStyleMap).includes(name)) {
      STYLE = [name, ...STYLE];
    }
    node.style = STYLE;
    if (isFilledArray(children)) {
      chainStyle(children, STYLE, tagStyleMap);
    }
  });
};

// style builder
export const StyleBuilder = (list: Node[], tagStyleMap: CustomTagStyleMap) => {
  const nList = [...list];
  chainStyle(nList, [], tagStyleMap);
  return nList;
};

/**
 * convert styles to flat array
 */
export const toFlatStyleList = (
  styleStringList: string[]
): StyleInterface[] => {
  const inlined = styleStringList
    .map((str) => str.split(`${Splitter_Semicolon}`))
    .flat()
    .filter((str) => str && str.indexOf(`${Splitter_Colon}`) > -1)
    .map((attr) => {
      const [key, val] = attr.trim().split(Splitter_Colon);
      const v = typeOf(val) === 'string' ? val.trim().replace(/;/i, '') : val;
      const value = isValidColor(v) ? toHex(v) : v;
      return {
        key: key.trim(),
        val: value,
      };
    });

  return getUniqueArrayByKey(inlined, 'key');
};

// text creator
export const calcTextRunStyle = (
  styleList: string[],
  tagStyleMap: CustomTagStyleMap
) => {
  const styleOption: Partial<StyleOption> = {};
  if (!styleList || styleList.length === 0) return styleOption;
  const tagList = Object.keys(tagStyleMap);

  // handle tag style like: em del strong...
  const tagStyleList: string[] = styleList.filter((str) =>
    tagList.includes(str)
  );

  const styles = tagStyleList
    .map((str) => tagStyleMap[str as keyof typeof tagStyleMap])
    .filter((str) => str !== undefined) as string[];

  // flat inline styles
  const inlined = toFlatStyleList([...styleList, ...styles]);

  const fontSizeSty = inlined.find(
    (sty: StyleInterface) => sty.key === StyleMap.fontSize
  );

  const fontSize =
    fontSizeSty && fontSizeSty.val ? handleSizeNumber(fontSizeSty.val) : null;

  /**
   * size(halfPts): Set the font size, measured in half-points
   */
  if (fontSize) {
    const { value, type } = fontSize;
    const size = type === 'pt' ? value * 2 : value * PXbyPT * 2;
    styleOption.size = size;
  } else {
    styleOption.size = D_FontSizePT * 2;
  }

  const inlinedStyleOption = provideStyle(inlined);

  return { ...styleOption, ...inlinedStyleOption };
};

// map children as ParagraphChild
export const getChildrenByTextRun = (
  nodeList: Node[],
  tagStyleMap: CustomTagStyleMap
): ParagraphChild[] => {
  const texts: ParagraphChild[] = [];
  const concatText = (list: Node[], arr: ParagraphChild[]) => {
    list.forEach((n) => {
      if (isFillTextNode(n)) {
        const { style } = n;
        const textBuildParam = { text: n.content };

        const styleOption =
          style && style.length ? calcTextRunStyle(style, tagStyleMap) : {};
        // @ts-ignore
        arr.push(new TextRun({ ...textBuildParam, ...styleOption }));
      } else if (isFilledArray(n.children)) {
        concatText(n.children, arr);
      }
    });
  };
  concatText(nodeList, texts);

  return texts;
};

// element creator
export const ElementCreator = (
  astList: Node[],
  tagStyleMap: CustomTagStyleMap
): Paragraph[] => {
  if (!astList || astList.length === 0) return [];
  const tags = StyleBuilder(
    astList.filter((n: Node) => n.type === 'tag'),
    tagStyleMap
  );
  if (!tags) return [];
  const ps = tags.map((node: Node) => {
    const { type, name, children, content, style } = node;
    const para: { text: string; children: ParagraphChild[] } = {
      text: content,
      children: [],
    };
    if (type === Tag.text && content) {
      const paragraphOption = {
        ...para,
        ...calcTextRunStyle(style, tagStyleMap),
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
        ...calcTextRunStyle(style, tagStyleMap),
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

// table creator
export const tableCreator = (
  tableNode: Node,
  tagStyleMap: CustomTagStyleMap
) => {
  const { children: tc, attrs, style } = tableNode;

  const isTBody = (n: Node) => n.name === 'tbody';
  const tbody = tc.find(isTBody);
  if (!tbody) return null;

  const tableParam: TableParam = {
    layout: TableLayoutType.FIXED,
    borders: {
      top: DefaultBorder,
      left: DefaultBorder,
      right: DefaultBorder,
      bottom: DefaultBorder,
    },
    rows: [],
  };

  const styleOp = calcTextRunStyle(style, tagStyleMap);

  // take table width as 100% (1)
  let tableWidthPR = 1;
  const width = styleOp.width || '100%';
  if (width) {
    tableWidthPR = parseFloat((width as string).replace(/%/i, '')) / 100;
  }
  const { border } = attrs;
  const borderSize = border ? parseFloat(border as string) : D_TableBorderSize;
  const borderColor = styleOp.borderColor || '000000';

  const borders = {
    top: {
      style: BorderStyle.SINGLE,
      size: borderSize * 10,
      color: borderColor,
    },
    right: {
      style: BorderStyle.SINGLE,
      size: borderSize * 10,
      color: borderColor,
    },
    bottom: {
      style: BorderStyle.SINGLE,
      size: borderSize * 10,
      color: borderColor,
    },
    left: {
      style: BorderStyle.SINGLE,
      size: borderSize * 10,
      color: borderColor,
    },
  };

  tableParam.borders = borders;

  const isTr = (n: Node) => n.name === 'tr';
  const isTd = (n: Node) => n.name === 'td';

  const firstRowColumnSize: number[] = [];

  const trs = tbody.children.filter(isTr);
  const rows = trs.map((tr, idx) => {
    const { children } = tr;

    let trHeight = calcTextRunStyle(tr.style, tagStyleMap).tHeight;

    const tds = children.filter(isTd);
    const cellChildren = tds.map((td) => {
      const { attrs, style } = td;
      const texts = getChildrenByTextRun(td.children, tagStyleMap);

      const tdStyleOption = calcTextRunStyle(style, tagStyleMap);

      if (trHeight && tdStyleOption.tHeight) {
        trHeight = Math.max(trHeight, tdStyleOption.tHeight);
      } else {
        trHeight = 30;
      }

      const cellParam: CellParam = {
        children: [
          new Paragraph({
            children: texts,
            ...tdStyleOption,
          } as IParagraphOptions),
        ],
      };

      if (attrs.colspan && attrs.colspan !== '0') {
        cellParam.columnSpan = Number(attrs.colspan);
      }

      if (attrs.rowspan && attrs.rowspan !== '0') {
        cellParam.rowSpan = Number(attrs.rowspan);
      }

      const size = convertMillimetersToTwip(
        ((tdStyleOption.tWidth || 0 * tableWidthPR) / 100) * A4MillimetersWidth
      );

      cellParam.width = {
        size: tdStyleOption.tWidth || 0,
        type: WidthType.PERCENTAGE,
      };

      if (idx === 0) {
        if (cellParam.columnSpan) {
          for (let i = 0; i < cellParam.columnSpan; i++) {
            firstRowColumnSize.push(size / cellParam.columnSpan);
          }
        } else {
          firstRowColumnSize.push(size);
        }
      }

      const margins = {
        marginUnitType: WidthType.DXA,
        top: CELL_MARGIN,
        bottom: CELL_MARGIN,
        left: CELL_MARGIN,
        right: CELL_MARGIN,
      };

      const tableCells = {
        ...cellParam,
        ...calcTextRunStyle(style, tagStyleMap),
        margins,
      };
      // @ts-ignore
      return new TableCell(tableCells);
    });

    const para = {
      children: cellChildren,
    };

    const h =
      convertMillimetersToTwip(
        (trHeight || 0 * A4MillimetersWidth) / D_PageTableFullWidth
      ) +
      CELL_MARGIN * 2;
    // @ts-ignore
    para.height = { value: h, rule: HeightRule.ATLEAST };

    return new TableRow(para);
  });

  function calcTableWidth(colsArr: number[]) {
    return colsArr.reduce((prev, cur) => prev + cur, 0);
  }

  tableParam.columnWidths = firstRowColumnSize;

  tableParam.width = {
    size: calcTableWidth(firstRowColumnSize),
    type: WidthType.DXA,
  };
  tableParam.rows = rows;

  const table = new Table(tableParam);
  return table;
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
      default: DocStyle_Default,
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
  docList.forEach((docFile, idx: number) => {
    const { html, name } = docFile;
    const file = genDocument(trimHtml(html));
    Packer.toBlob(file).then((blob) => {
      zip.file(`${name}.docx`, blob, { binary: true });
      if (idx === len - 1) {
        zip.generateAsync({ type: 'blob' }).then((content) => {
          saveAs(content, `${fileName}.zip`);
        });
      }
    });
  });
};

export const exportAsZip = exportMultiDocsAsZip;

export { IExportDoc, IExportOption };
