import { StyleMap } from './default';
import tinycolor from 'tinycolor2';

export const removeTagDIV = (str: string) => {
  const reg = /<div[^>]*?>|<\/div>/gi;
  return str.replace(reg, '');
};

export const isTextDecoration = (key: string) =>
  key === StyleMap.textDecoration;
export const isPadding = (key: string) => key.indexOf('padding-') > -1;
export const isAlign = (key: string) => key.indexOf(StyleMap.textAlign) > -1;
export const isLineHeight = (key: string) => key === StyleMap.lineHeight;
export const isFontFamily = (key: string) => key === StyleMap.fontFamily;
export const isVerticalAlign = (key: string) => key === StyleMap.verticalAlign;
export const isBorderColor = (key: string) => key === StyleMap.borderColor;
export const isWidth = (key: string) => key === StyleMap.width;
export const isHeight = (key: string) => key === StyleMap.height;
export const isTextIndent = (key: string) => key === StyleMap.textIndent;
export const isBold = (key: string) => key === StyleMap.fontWeight;
export const isFontStyle = (key: string) => key === StyleMap.fontStyle;

export const isValidColor = (color: string) => tinycolor(color).isValid();
export const toHex = (color: string) => tinycolor(color).toHexString();
