import {
  A4MillimetersWidth,
  CELL_MARGIN,
  D_TableBorderSize,
  DefaultBorder,
} from '../default';
import {
  BorderStyle,
  HeightRule,
  ITableCellOptions,
  ITableOptions,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  WidthType,
  convertMillimetersToTwip,
  // IParagraphOptions,
} from 'docx';
import { CellParam, CustomTagStyleMap, Node, TableParam } from '../types';
import { D_TableCellHeightPx, D_TagStyleMap, PXbyTWIPS } from './../default';
import { calcTextRunStyle, getChildrenByTextRun } from './text';

import { handleSizeNumber } from '../utils';

export const calcTableWidth = (colsArr: number[]) => {
  return colsArr.reduce((prev, cur) => prev + cur, 0);
};

export const getTableBorderStyleSingle = (size: number, color: string) => {
  return { style: BorderStyle.SINGLE, size: size * 10, color: color };
};

export const getColGroupWidth = (cols: Node[]) => {
  return cols.map((col) => {
    const { attrs } = col;
    return handleSizeNumber(String(attrs.width)).value;
  });
};

export const handleCellWidthFromColgroup = (
  cols: number[],
  index: number,
  colspan: number
) => {
  return cols
    .slice(index, index + colspan)
    .reduce((prev, cur) => prev + cur, 0);
};

export const getCellWidthInTwips = (size: number, pr: number) => {
  return convertMillimetersToTwip(((size * pr) / 100) * A4MillimetersWidth);
};

// table node to docx ITableOptions
export const tableNodeToITableOptions = (
  tableNode: Node,
  tagStyleMap: CustomTagStyleMap = D_TagStyleMap
): ITableOptions | null => {
  const { children: tc, attrs, shape } = tableNode;

  const isTBody = (n: Node) => n.name === 'tbody';
  const tbody = tc.find(isTBody);
  if (!tbody) return null;

  // deal colgroup for cell width
  const colGroup = tc.find((n) => n.name === 'colgroup');
  const cols = colGroup ? getColGroupWidth(colGroup.children) : [];
  const colsTotalWidth = cols.reduce((prev, cur) => prev + cur, 0);

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

  const styleOp = calcTextRunStyle(shape, tagStyleMap);

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
    top: getTableBorderStyleSingle(borderSize, borderColor),
    right: getTableBorderStyleSingle(borderSize, borderColor),
    bottom: getTableBorderStyleSingle(borderSize, borderColor),
    left: getTableBorderStyleSingle(borderSize, borderColor),
  };

  tableParam.borders = borders;

  const isTr = (n: Node) => n.name === 'tr';
  const isTd = (n: Node) => n.name === 'td';

  const firstRowColumnSize: number[] = [];

  const trs = tbody.children.filter(isTr);
  const rows = trs.map((tr, idx) => {
    const { children } = tr;

    let trHeight = calcTextRunStyle(tr.shape, tagStyleMap).tHeight;

    const tds = children.filter(isTd);
    const cellChildren = tds.map((td, index) => {
      const { attrs, shape } = td;

      const tdStyleOption = calcTextRunStyle(shape, tagStyleMap);

      if (trHeight && tdStyleOption.tHeight) {
        trHeight = Math.max(trHeight, tdStyleOption.tHeight);
      } else {
        trHeight = D_TableCellHeightPx;
      }

      const texts = td.children.map((t) => {
        const { shape, content, children } = t;
        if (children?.length) {
          const c = getChildrenByTextRun(children || [], tagStyleMap);
          return new Paragraph({
            children: c,
            ...calcTextRunStyle(shape, tagStyleMap),
          });
        }
        return new Paragraph({
          text: content,
          ...calcTextRunStyle(shape, tagStyleMap),
        });
      });

      const cellParam: CellParam = {
        children: texts,
      };

      if (attrs.colspan && attrs.colspan !== '0') {
        cellParam.columnSpan = Number(attrs.colspan);
      }

      if (attrs.rowspan && attrs.rowspan !== '0') {
        cellParam.rowSpan = Number(attrs.rowspan);
      }

      if (cols.length) {
        const pr =
          handleCellWidthFromColgroup(cols, index, cellParam.columnSpan || 1) /
          colsTotalWidth;
        tdStyleOption.tWidth = pr * 100;
      }

      const size = tdStyleOption.tWidth
        ? getCellWidthInTwips(tdStyleOption.tWidth, tableWidthPR)
        : getCellWidthInTwips(33.33, tableWidthPR);

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
        ...calcTextRunStyle(shape, tagStyleMap),
        margins,
      };
      return new TableCell(tableCells as ITableCellOptions);
    });

    const para = {
      children: cellChildren,
      height: { value: 0, rule: HeightRule.EXACT },
    };

    const h = (trHeight ?? D_TableCellHeightPx) * PXbyTWIPS + CELL_MARGIN * 2;

    para.height = { value: h, rule: HeightRule.EXACT };

    return new TableRow(para);
  });

  tableParam.columnWidths = firstRowColumnSize;

  tableParam.width = {
    size: calcTableWidth(firstRowColumnSize),
    type: WidthType.DXA,
  };
  tableParam.rows = rows;
  return tableParam;
};

// create docx table from table node
export const tableCreator = (
  tableNode: Node,
  tagStyleMap: CustomTagStyleMap = D_TagStyleMap
) => {
  const tableParam = tableNodeToITableOptions(tableNode, tagStyleMap);
  if (!tableParam) return null;
  return new Table(tableParam);
};
