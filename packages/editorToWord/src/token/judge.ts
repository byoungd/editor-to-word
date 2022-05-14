import { StyleMap } from './styleMap';

import { StyleInterface } from '../types';

export const isColor = ({ key }: StyleInterface) => key === StyleMap.color;

export const isBackgroundColor = ({ key }: StyleInterface) =>
  key === StyleMap.backgroundColor;

export const isTextDecoration = ({ key }: StyleInterface) =>
  key === StyleMap.textDecoration;

export const isPadding = ({ key }: StyleInterface) =>
  key.indexOf('padding-') > -1;

export const isTextAlign = ({ key }: StyleInterface) =>
  key.indexOf(StyleMap.textAlign) > -1;

export const isLineHeight = ({ key }: StyleInterface) =>
  key === StyleMap.lineHeight;

export const isFontFamily = ({ key }: StyleInterface) =>
  key === StyleMap.fontFamily;

export const isVerticalAlign = ({ key }: StyleInterface) =>
  key === StyleMap.verticalAlign;

export const isBorderColor = ({ key }: StyleInterface) =>
  key === StyleMap.borderColor;

export const isWidth = ({ key }: StyleInterface) => key === StyleMap.width;

export const isHeight = ({ key }: StyleInterface) => key === StyleMap.height;

export const isTextIndent = ({ key }: StyleInterface) =>
  key === StyleMap.textIndent;

export const isFontWeight = ({ key }: StyleInterface) =>
  key === StyleMap.fontWeight;

export const isBold = ({ key, val }: StyleInterface) =>
  key === StyleMap.fontWeight && val.toLowerCase() === 'bold';

export const isFontStyle = ({ key }: StyleInterface) =>
  key === StyleMap.fontStyle;

export const isFontStyleItalic = ({ key, val }: StyleInterface) =>
  key === StyleMap.fontStyle && val.toLowerCase() === 'italic';

export const isSubScript = ({ key, val }: StyleInterface) =>
  key === StyleMap.subScript && val.toLowerCase() === 'true';

export const isSuperScript = ({ key, val }: StyleInterface) =>
  key === StyleMap.superScript && val.toLowerCase() === 'true';
