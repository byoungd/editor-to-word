import {
  A4MillimetersWidth,
  AlignMap,
  CELL_MARGIN,
  D_FontSizePT,
  D_LineHeight,
  D_PageTableFullWidth,
  D_TableBorderSize,
  DefaultBorder,
  Direction,
  DocStyle_Default,
  PXbyPT,
  PXbyTWIPS,
  SingleLine,
  Size,
  Splitter_Colon,
  Splitter_Semicolon,
  StyleMap,
  Tag,
  TagStyleMap,
} from './default';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeightRule,
  IParagraphOptions,
  ISectionOptions,
  Packer,
  PageOrientation,
  Paragraph,
  ParagraphChild,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  convertMillimetersToTwip,
} from 'docx';
import {
  CellParam,
  HTMLString,
  IPageLayout,
  IndentType,
  Node,
  SizeNumber,
  StyleInterface,
  StyleOption,
  TableParam,
} from './types';
import { getUniqueArrayByKey, isFilledArray, typeOf } from './utils';
import {
  isAlign,
  isBold,
  isBorderColor,
  isFontFamily,
  isFontStyle,
  isHeight,
  isLineHeight,
  isPadding,
  isTextDecoration,
  isTextIndent,
  isValidColor,
  isVerticalAlign,
  isWidth,
  removeTagDIV,
  toHex,
} from './helpers';

import HTMLPS from 'html-parse-stringify';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const WPS_TABLE_WIDTH_TWIPS = 9035;

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
export const chainStyle = (nodeList: Node[], style: string[] = []) => {
  if (!nodeList || !isFilledArray(nodeList)) return;
  nodeList.forEach((node) => {
    const { attrs, children, name } = node;
    let STYLE: string[] =
      typeof attrs?.style === 'string' ? [attrs.style, ...style] : style;
    if (Object.keys(TagStyleMap).includes(name)) {
      STYLE = [name, ...STYLE];
    }
    node.style = STYLE;
    if (isFilledArray(children)) {
      chainStyle(children, STYLE);
    }
  });
};

// style builder
export const StyleBuilder = (list: Node[]) => {
  const nList = [...list];
  chainStyle(nList, []);
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

/**
 * parse size
 */
export const handleSizeNumber = (val: string): SizeNumber => {
  const m = val.match(/\d+(.\d+)?/g);
  if (val.match(/\d+(.\d+)?/g) && m && Array.isArray(m) && m[0]) {
    const target = m[0];
    const type = target ? val.replace(new RegExp(target, 'g'), '') : '';
    return { value: parseFloat(target), type };
  }
  return { type: 'UNKNOWN', value: 0 };
};

// text creator
export const calcTextRunStyle = (styleList: string[]) => {
  const styleOption: Partial<StyleOption> = {};
  if (!styleList || styleList.length === 0) return styleOption;
  const tagList = Object.keys(TagStyleMap);
  // handle tag style like: em del strong...
  const tagStyleList: string[] = styleList.filter((str) =>
    tagList.includes(str)
  );

  const styles = tagStyleList.map(
    (str) => TagStyleMap[str as keyof typeof TagStyleMap]
  );

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

  inlined.forEach(({ key, val }: StyleInterface) => {
    if (Object.values(StyleMap).includes(key)) {
      if (!key || !val) return;

      if (isTextDecoration(key)) {
        if (val === StyleMap.lineThrough) {
          styleOption.strike = true;
        } else if (val === StyleMap.underline) {
          styleOption.underline = SingleLine;
        }
      } else if (key === StyleMap.color) {
        styleOption.color = val.replace(/#/g, '');
      } else if (isPadding(key) || isTextIndent(key)) {
        const [, dire = Direction.left] = key.split('-');
        const { value, type } = handleSizeNumber(val);

        // handle indent
        const indent: Partial<IndentType> = {};

        // @ts-ignore
        const oneCharSizePT = (styleOption.size / PXbyPT / 2) * PXbyTWIPS;

        const isEM = type.match(Size.em);
        const isPX = type.match(Size.px);
        const isPT = type.match(Size.pt);
        if (isEM) {
          indent.left = value * oneCharSizePT;
          styleOption.indent = indent;
        } else if (isPX) {
          // @ts-ignore
          indent[dire] = (value / 20) * oneCharSizePT;
          styleOption.indent = indent;
        } else if (isPT) {
          // @ts-ignore
          indent[dire] = (value / D_FontSizePT) * oneCharSizePT;
          styleOption.indent = indent;
        }
      } else if (isAlign(key)) {
        styleOption.alignment =
          AlignMap[val as keyof typeof AlignMap] || AlignmentType.CENTER;
        styleOption.verticalAlign = VerticalAlign.CENTER;
      } else if (isLineHeight(key)) {
        const spacing = { before: 0, after: 0, line: 240 * D_LineHeight };
        const { value, type } = handleSizeNumber(val);
        if (value) {
          spacing.line = type === '%' ? (value / 100) * 240 : value * 240;
        }
        styleOption.spacing = spacing;
      } else if (isFontFamily(key)) {
        if (val.indexOf(',') === -1 && val.indexOf(' ') === -1) {
          styleOption.font = val;
        }
      } else if (isVerticalAlign(key)) {
        styleOption.verticalAlign = VerticalAlign.CENTER;
      } else if (isBorderColor(key)) {
        styleOption.borderColor = val.replace(/#/i, '');
      } else if (isWidth(key)) {
        const w = parseFloat(val.replace(/%/i, ''));
        styleOption.tWidth = w;
      } else if (isHeight(key)) {
        const h = parseFloat(val.replace(/px/i, ''));
        styleOption.tHeight = h;
      } else if (isBold(key)) {
        if (val.toLowerCase() === 'bold') {
          styleOption.bold = true;
        }
      } else if (isFontStyle(key)) {
        if (val.toLowerCase() === 'italic') {
          styleOption.italics = true;
        }
      }
    }
  });

  return styleOption;
};

// map children as ParagraphChild
export const getChildrenByTextRun = (nodeList: Node[]): ParagraphChild[] => {
  const texts: ParagraphChild[] = [];
  const concatText = (list: Node[], arr: ParagraphChild[]) => {
    list.forEach((n) => {
      if (isFillTextNode(n)) {
        const { style } = n;
        const textBuildParam = { text: n.content };

        const styleOption =
          style && style.length ? calcTextRunStyle(style) : {};
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
export const ElementCreator = (astList: Node[]): Paragraph[] => {
  if (!astList || astList.length === 0) return [];
  const tags = StyleBuilder(astList.filter((n: Node) => n.type === 'tag'));
  if (!tags) return [];
  const ps = tags.map((node: Node) => {
    const { type, name, children, content, style } = node;
    const para: { text: string; children: ParagraphChild[] } = {
      text: content,
      children: [],
    };
    if (type === Tag.text && content) {
      // @ts-ignore
      return new Paragraph({ ...para, ...calcTextRunStyle(style) });
    } else if (
      name !== Tag.table &&
      children &&
      isFilledArray(children) &&
      children.length > 0
    ) {
      para.children = getChildrenByTextRun(children);
      const options = {
        ...para,
        ...calcTextRunStyle(style),
      } as IParagraphOptions;
      return new Paragraph(options);
    } else if (name === Tag.table) {
      return tableCreator(node);
    } else {
      return null;
    }
  });
  // @ts-ignore
  return ps.filter((p) => p instanceof Paragraph || p instanceof Table);
};

// table creator
export const tableCreator = (tableNode: Node) => {
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

  const styleOp = calcTextRunStyle(style);

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

    let trHeight = calcTextRunStyle(tr.style).tHeight;

    const tds = children.filter(isTd);
    const cellChildren = tds.map((td) => {
      const { attrs, style } = td;
      const texts = getChildrenByTextRun(td.children);

      const tdStyleOption = calcTextRunStyle(style);

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
        ...calcTextRunStyle(style),
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

export const htmlToAST = (html: string) => {
  return HTMLPS.parse(html);
};

// default paper layout
const defaultLayout: IPageLayout = {
  bottomMargin: '2.54cm',
  leftMargin: '3.18cm',
  paperRotation: 0,
  rightMargin: '3.18cm',
  topMargin: '2.54cm',
  orientation: PageOrientation.PORTRAIT,
};

// generate Document
export const genDocument = (
  html: HTMLString,
  layout: IPageLayout = defaultLayout
) => {
  const ast: Node[] = htmlToAST(html);

  const paragraphs = ElementCreator(ast);
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
    const ast = HTMLPS.parse(header);

    section.headers = {
      default: new Header({
        children: ElementCreator(ast),
      }),
    };
  }

  if (footer) {
    const ast = HTMLPS.parse(footer);
    section.footers = {
      default: new Footer({
        children: ElementCreator(ast),
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
export const exportAsDocx = (doc: Document, docName = '') => {
  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `${docName}.docx`);
  });
};

// html -> docx
export const exportHtmlToDocx = (
  html: HTMLString,
  docName = 'doc',
  layout: IPageLayout = defaultLayout
) => {
  const doc = genDocument(removeTagDIV(html), layout);
  exportAsDocx(doc, docName);
  return doc;
};

export interface IExportDoc {
  id: string;
  name: string;
  html: string;
  documentId: number;
}

// export multi files as .zip
export const exportMultiDocsAsZip = (
  docList: IExportDoc[],
  fileName = 'docs'
) => {
  const zip = new JSZip();
  const len = docList.length;
  if (len === 1) {
    const d = docList[0];
    const { html, name } = d;
    const file = genDocument(removeTagDIV(html));
    exportAsDocx(file, name);
    return;
  }
  docList.forEach((docFile, idx: number) => {
    const { html, name } = docFile;
    const file = genDocument(removeTagDIV(html));
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
