import { AlignmentType, BorderStyle } from 'docx';

// 分隔符 冒号
export const Splitter_Colon = ':';
// 分隔符 分号
export const Splitter_Semicolon = ';';

// 像素px和twips比率
export const PXbyTWIPS = 15;

// 像素px相对pt的比率
export const PXbyPT = 3 / 4;

// 默认字体大小 单位px
export const D_FontSizePX = 16;

// 默认字体大小 单位pt
export const D_FontSizePT = D_FontSizePX * PXbyPT;

// 默认行距
export const D_LineHeight = 1.5;

// 页面宽度 单位px
export const D_PageWithPX = 794;

// 页面高度 单位px
export const D_PageHeightPX = 1123;

// 默认边距 单位px
export const D_PagePaddingPX = 71;

// 页面表格默认最大宽度
export const D_PageTableFullWidth = 642;

// WPS表格的width
export const WPS_TABLE_WIDTH_TWIPS = 9035;

// a4纸张宽度，a4纸21cm 减去左右各3.18cm, 再转换成twips，但这里有个问题，这个3.18厘米是下载的时候参数传过来的，但3.18是默认值
export const A4MillimetersWidth = 145.4;

// 单元格边距
export const CELL_MARGIN = 80;

// 表格外边框默认尺寸
export const D_TableBorderSize = 2;

// 百分比的全宽基数
export const HP = 5000;

// 宋体
export const FontSongTi = ['SimSun', '宋体', 'Songti SC', 'NSimSun', 'STSong'];

// 样式表
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

// 对齐
export const AlignMap = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
};

// 标签样式
export const TagStyleMap = {
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

// 方向
export const Direction = {
  left: 'left',
  right: 'right',
};

// 尺寸
export const Size = {
  em: 'em',
  px: 'px',
  pt: 'pt',
};

// 单线
export const SingleLine = { type: 'single', color: '3d4757' };

export const Tag = {
  table: 'table',
  text: 'text',
};

// 默认边框
export const DefaultBorder = {
  style: BorderStyle.SINGLE,
  size: 0,
  color: '#fff',
};
