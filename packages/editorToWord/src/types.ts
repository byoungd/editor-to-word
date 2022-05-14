import {
  AlignmentType,
  BorderStyle,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableLayoutType,
  TableRow,
  VerticalAlign,
  WidthType,
} from 'docx';

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
  shape: string[];
  attrs: Attr;
  text: string;
  voidElement: boolean;
};

export type HtmlNode = string | (string | {});

export type StyleInterface = { key: string; val: string };

export type ValueField = string | number;

export interface UnderlineType {
  type: string;
  color: string;
}

export interface IndentType {
  left?: ValueField;
  right?: ValueField;
  firstLine?: ValueField;
  hanging?: ValueField;
  start?: ValueField;
  end?: ValueField;
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
  children: (Paragraph | Table)[];
  columnSpan?: number;
  rowSpan?: number;
  width?: CellWidth;
}

export interface SpacingType {
  line: number;
}

export interface Shading {
  fill?: string;
  color?: string;
  type?: ShadingType;
}

export interface StyleOption {
  size?: number;
  strike?: boolean;
  indent?: IndentType;
  underline?: UnderlineType;
  color?: string;
  highlight?: string;
  alignment?: AlignmentType;
  verticalAlign?: VerticalAlign;
  spacing?: SpacingType;
  font?: string;
  borderColor?: string;
  tWidth?: number;
  tHeight?: number;
  bold?: boolean;
  width?: string | number;
  italics?: boolean;
  superScript?: boolean;
  subScript?: boolean;
  shading?: Shading;
  break?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
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

export interface IExportDoc {
  name: string;
  html: string;
}
