import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  PageOrientation,
} from 'docx';

import { getHeadingRunStyle } from './helpers';
import { IPageLayout } from './types';

export const Splitter_Colon = ':';

export const Splitter_Semicolon = ';';

// px by twips
export const PXbyTWIPS = 15;

// px by pt
export const PXbyPT = 3 / 4;

// default font size in px
export const D_FontSizePX = 16;

// default font size in pt
export const D_FontSizePT = D_FontSizePX * PXbyPT;

// default line height
export const D_LineHeight = 1.5;

// default page width in px
export const D_PageWidthPX = 794;

// default page height in px
export const D_PageHeightPX = 1123;

// default page padding width in px
export const D_PagePaddingPX = 71;

// default page table full width in px
export const D_PageTableFullWidth = 642;

// WPS table full width in twips
export const WPS_TABLE_WIDTH_TWIPS = 9035;

// a4 paper size
export const A4MillimetersWidth = 145.4;

// table cell margin in px
export const CELL_MARGIN = 80;

//table border width in px
export const D_TableBorderSize = 2;

// full width in twips
export const HP = 5000;

// font family songti
export const FontSongTi = ['SimSun', '宋体', 'Songti SC', 'NSimSun', 'STSong'];

// style map
export const StyleMap = {
  fontFamily: 'font-family',
  textAlign: 'text-align',
  paddingRight: 'padding-right',
  paddingLeft: 'padding-left',
  lineHeight: 'line-height',
  fontSize: 'font-size',
  color: 'color',
  textDecoration: 'text-decoration',
  textIndent: 'text-indent',
  borderColor: 'border-color',
  height: 'height',
  width: 'width',
  fontWeight: 'font-weight',
  verticalAlign: 'vertical-align',
  lineThrough: 'line-through',
  underline: 'underline',
  fontStyle: 'font-style',
};

// align
export const AlignMap = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
};

// style with tag
export const D_TagStyleMap = {
  p: 'line-height: 1.5;',
  strong: 'font-weight: bold;',
  em: 'font-style: italic;',
  u: 'text-decoration: underline;',
  del: 'text-decoration: line-through;',
  h1: 'font-weight: bold; font-size: 40px; line-height: 1.5;',
  h2: 'font-weight: bold; font-size: 36px; line-height: 1.5;',
  h3: 'font-weight: bold; font-size: 24px; line-height: 1.5;',
  h4: 'font-weight: bold; font-size: 18px; line-height: 1.5;',
  h5: 'font-weight: bold; font-size: 15px; line-height: 1.5;',
  h6: 'font-weight: bold; font-size: 13px; line-height: 1.5;',
};

// default paper layout
export const D_Layout: IPageLayout = {
  bottomMargin: '2.54cm',
  leftMargin: '3.18cm',
  rightMargin: '3.18cm',
  topMargin: '2.54cm',
  orientation: PageOrientation.PORTRAIT,
};

// Direction
export const Direction = {
  left: 'left',
  right: 'right',
};

// Size
export const Size = {
  em: 'em',
  px: 'px',
  pt: 'pt',
};

// single line
export const SingleLine = { type: 'single', color: '3d4757' };

export const Tag = {
  table: 'table',
  text: 'text',
};

// default border style
export const DefaultBorder = {
  style: BorderStyle.SINGLE,
  size: 0,
  color: '#fff',
};

// heading dict
export const headingMap = {
  h1: { level: HeadingLevel.HEADING_1, size: 48, color: '00000b' },
  h2: { level: HeadingLevel.HEADING_2, size: 36, color: '00000b' },
  h3: { level: HeadingLevel.HEADING_3, size: 24, color: '00000b' },
  h4: { level: HeadingLevel.HEADING_4, size: 18, color: '00000b' },
  h5: { level: HeadingLevel.HEADING_5, size: 15, color: '00000b' },
  h6: { level: HeadingLevel.HEADING_6, size: 13, color: '00000b' },
};

export const DocStyle_Default = {
  heading1: getHeadingRunStyle('h1'),
  heading2: getHeadingRunStyle('h2'),
  heading3: getHeadingRunStyle('h3'),
  heading4: getHeadingRunStyle('h4'),
  heading5: getHeadingRunStyle('h5'),
  heading6: getHeadingRunStyle('h6'),
};
