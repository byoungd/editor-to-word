import {
  BorderStyle,
  PageOrientation,
  Paragraph,
  TableLayoutType,
  TableRow,
  VerticalAlign,
  WidthType,
} from 'docx';
import { string } from 'yargs';

export interface IPageLayout {
  orientation: PageOrientation;
  paperRotation?: 0 | 1;
  topMargin: string;
  rightMargin: string;
  bottomMargin: string;
  leftMargin: string;
  width?: string;
  height?: string;
  header?: string;
  footer?: string;
}

export type HTMLString = string;

export type Heading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type SizeNumber = {
  value: number;
  type: string;
};

export type Attr = Record<string, string | boolean | number>;

export type Node = {
  type: string;
  content: string;
  children: Node[];
  name: string;
  style: string[];
  attrs: Attr;
  text: string;
  voidElement: boolean;
};

export type HtmlNode = string | (string | {});

export type StyleInterface = { key: string; val: string };

export interface UnderlineType {
  type: string;
  color: string;
}

export interface IndentType {
  left?: number;
  right?: number;
}

export interface TableBorder {
  style: BorderStyle;
  size: number;
  color: string;
}

export interface TableParam {
  layout: TableLayoutType;
  borders: {
    top: TableBorder;
    left: TableBorder;
    right: TableBorder;
    bottom: TableBorder;
  };
  columnWidths?: number[];
  width?: CellWidth;
  rows: TableRow[];
}

export type CellWidth = {
  size: number;
  type: WidthType;
};

export interface CellParam {
  children: Paragraph[];
  columnSpan?: number;
  rowSpan?: number;
  width?: CellWidth;
}

export interface SpacingType {
  line: number;
}

export interface StyleOption {
  size: number;
  strike: boolean;
  indent: IndentType;
  underline: UnderlineType;
  color: string;
  alignment: string;
  verticalAlign: VerticalAlign;
  spacing: SpacingType;
  font: string;
  borderColor: string;
  tWidth: number;
  tHeight: number;
  bold: boolean;
  width: string | number;
  italics: boolean;
}

export type AcceptedStyleTag =
  | Heading
  | 'p'
  | 'span'
  | 'div'
  | 'table'
  | 'tr'
  | 'td'
  | 'th'
  | 'img'
  | 'br'
  | 'hr'
  | 'em'
  | 'strong'
  | 'b'
  | 'i'
  | 'u'
  | 'strike'
  | 'sub'
  | 'sup'
  | 'code'
  | 'pre'
  | 'address'
  | 'ol'
  | 'ul'
  | 'li'
  | 'a'
  | 'del'
  | 'cite'
  | 'time';

export type CustomTagStyleMap = Partial<{
  [k in AcceptedStyleTag]: string;
}>;

export interface IExportOption {
  tagStyleMap?: CustomTagStyleMap;
  layout?: IPageLayout;
}
