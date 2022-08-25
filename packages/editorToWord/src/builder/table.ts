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
} from 'docx';
import { CellParam, CustomTagStyleMap, Node, TableParam } from '../types';
import {
  D_CELL_MARGIN,
  D_TableBorderColor,
  D_TableBorderSize,
  D_TableFullWidth,
  DefaultBorder,
} from '../default';
import { D_TableCellHeightPx, D_TagStyleMap } from './../default';
import { calcTextRunStyle, getChildrenByTextRun } from './text';

import { handleSizeNumber } from '../utils';

export const calcTableWidth = (colsArr: number[]) => {
  return colsArr.reduce((prev, cur) => prev + cur, 0);
};

export const getTableBorderStyleSingle = (size: number, color: string) => {
  return { style: BorderStyle.SINGLE, size: size * 10, color: color };
};

const tablePxByXDA = D_TableFullWidth / 553;

export const getColGroupWidth = (cols: Node[]) => {
  const count = cols.length;
  const defaultWidth = count ? D_TableFullWidth / tablePxByXDA / count : 0;
  return cols
    .filter((c) => c.name === 'col')
    .map((col) => {
      const { attrs } = col;
      return (
        tablePxByXDA *
        (handleSizeNumber(String(attrs.width))?.value || defaultWidth)
      );
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

export const getCellWidthInDXA = (size: number) => {
  return size * tablePxByXDA;
};

// table node to docx ITableOptions
export const tableNodeToITableOptions = async (
  tableNode: Node,
  tagStyleMap: CustomTagStyleMap = D_TagStyleMap
): Promise<ITableOptions | null> => {
  const { children: tc, attrs, shape } = tableNode;

  const isTBody = (n: Node) => n.name === 'tbody';
  const tbody = tc.find(isTBody);
  if (!tbody) return null;

  // deal colgroup for cell width
  const colGroup = tc.find((n) => n.name === 'colgroup');
  const cols = colGroup ? getColGroupWidth(colGroup.children) : [];
  // const colsTotalWidth = cols.reduce((prev, cur) => prev + cur, 0);

  // Google DOCS does not support start and end borders, instead they use left and right borders.
  // So to set left and right borders for Google DOCS you should use
  // see https://docx.js.org/#/usage/tables
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

  const { border } = attrs;
  const borderSize = border ? parseFloat(border as string) : D_TableBorderSize;
  const borderColor = styleOp.borderColor || D_TableBorderColor;

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
  let hasColGroup = false;
  const trs = tbody.children.filter(isTr);

  const rows = [];

  for (let { tr, idx } of trs.map((tr, idx) => ({ tr, idx }))) {
    const { children, attrs } = tr;

    let trHeight = attrs?.style
      ? calcTextRunStyle([attrs?.style as string], tagStyleMap)?.tHeight ||
        D_TableCellHeightPx
      : D_TableCellHeightPx;

    const tds = children.filter(isTd);

    const cellChildren = [];

    for (let tdObj of tds.map((item, index) => ({ item, index }))) {
      const { item: td, index } = tdObj;
      const { attrs, shape } = td;

      // table paragraph use line-height 1.0 for default
      const styles = { ...tagStyleMap };
      delete styles.p;

      const tdStyleOption = calcTextRunStyle(shape, styles);

      // TODO: support Nested Tables and other elements
      // use `contentBuilder` maybe better

      const texts = [];
      for (let t of td.children) {
        const { shape, content, children } = t;
        if (children?.length) {
          const c = await getChildrenByTextRun(children || [], styles);
          texts.push(
            new Paragraph({
              children: c,
              ...calcTextRunStyle(shape, styles),
            })
          );
        }
        texts.push(
          new Paragraph({
            text: content,
            ...calcTextRunStyle(shape, styles),
          })
        );
      }

      const cellParam: CellParam = {
        children: texts,
      };

      const { colspan, rowspan } = attrs;
      if (colspan && Number(colspan) !== 0) {
        cellParam.columnSpan = Number(colspan);
      }

      if (rowspan && Number(rowspan) !== 0) {
        cellParam.rowSpan = Number(rowspan);
      }

      hasColGroup = !!cols.length && cols.every((c) => c !== 0);

      if (hasColGroup) {
        const width = handleCellWidthFromColgroup(
          cols,
          index,
          cellParam.columnSpan || 1
        );
        tdStyleOption.tWidth = width;
      }

      const cellWidth = hasColGroup
        ? tdStyleOption.tWidth || D_TableFullWidth / cols.length
        : getCellWidthInDXA(tdStyleOption.tWidth || 185);

      cellParam.width = {
        size: cellWidth,
        type: WidthType.DXA,
      };

      if (idx === 0) {
        if (cellParam.columnSpan) {
          for (let i = 0; i < cellParam.columnSpan; i++) {
            firstRowColumnSize.push(cellWidth / cellParam.columnSpan);
          }
        } else {
          firstRowColumnSize.push(cellWidth);
        }
      }

      const margins = {
        marginUnitType: WidthType.DXA,
        top: D_CELL_MARGIN,
        bottom: D_CELL_MARGIN,
        left: D_CELL_MARGIN,
        right: D_CELL_MARGIN,
      };

      const tableCellOptions = {
        ...cellParam,
        ...calcTextRunStyle(shape, styles),
        margins,
      };

      cellChildren.push(new TableCell(tableCellOptions as ITableCellOptions));
    }

    const para = {
      children: cellChildren,
      height: { value: 0, rule: HeightRule.EXACT },
    };

    const h = (trHeight ?? D_TableCellHeightPx) * tablePxByXDA;

    para.height = { value: h, rule: HeightRule.EXACT };

    rows.push(new TableRow(para));
  }

  const tableWidths = hasColGroup ? cols : firstRowColumnSize;
  tableParam.columnWidths = tableWidths;

  tableParam.width = {
    size: calcTableWidth(tableWidths),
    type: WidthType.DXA,
  };
  tableParam.rows = rows;
  return tableParam;
};

// create docx table from table node
export const tableCreator = async (
  tableNode: Node,
  tagStyleMap: CustomTagStyleMap = D_TagStyleMap
) => {
  const tableParam = await tableNodeToITableOptions(tableNode, tagStyleMap);
  if (!tableParam) return null;
  return new Table(tableParam);
};
