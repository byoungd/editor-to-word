import { backgroundHandler } from './backgroundColor';
import { superScriptHandler } from './superScript';
import { subScriptHandler } from './subScript';
import { colorHandler } from './color';
import { StyleInterface, StyleOption } from './../types';
import { widthHandler } from './width';
import { verticalAlignHandler } from './verticalAlign';
import { textDecorationHandler } from './textDecoration';
import { paddingHandler } from './padding';
import { lineHeightHandler } from './lineHeight';
import { heightHandler } from './height';
import { alignHandler } from './textAlign';
import { boldHandler } from './bold';
import { borderColorHandler } from './borderColor';
import { fontFamilyHandler } from './fontFamily';
import { fontStyleHandler } from './fontStyle';
import { textIndentHandler } from './textIndent';

import {
  isTextAlign,
  isBold,
  isColor,
  isBorderColor,
  isFontFamily,
  isFontStyle,
  isHeight,
  isLineHeight,
  isPadding,
  isTextDecoration,
  isTextIndent,
  isVerticalAlign,
  isWidth,
  isBackgroundColor,
  isSubScript,
  isSuperScript,
} from '../judge';

export const tokens = [
  {
    name: 'color',
    judge: isColor,
    handler: colorHandler,
  },
  {
    name: 'backgroundColor',
    judge: isBackgroundColor,
    handler: backgroundHandler,
  },
  {
    name: 'bold',
    judge: isBold,
    handler: boldHandler,
  },
  {
    name: 'align',
    judge: isTextAlign,
    handler: alignHandler,
  },
  {
    name: 'borderColor',
    judge: isBorderColor,
    handler: borderColorHandler,
  },
  {
    name: 'fontFamily',
    judge: isFontFamily,
    handler: fontFamilyHandler,
  },
  {
    name: 'fontStyle',
    judge: isFontStyle,
    handler: fontStyleHandler,
  },
  {
    name: 'height',
    judge: isHeight,
    handler: heightHandler,
  },
  {
    name: 'lineHeight',
    judge: isLineHeight,
    handler: lineHeightHandler,
  },
  {
    name: 'padding',
    judge: isPadding,
    handler: paddingHandler,
  },
  {
    name: 'textDecoration',
    judge: isTextDecoration,
    handler: textDecorationHandler,
  },
  {
    name: 'textIndent',
    judge: isTextIndent,
    handler: textIndentHandler,
  },
  {
    name: 'verticalAlign',
    judge: isVerticalAlign,
    handler: verticalAlignHandler,
  },
  {
    name: 'width',
    judge: isWidth,
    handler: widthHandler,
  },
  {
    name: 'subScript',
    judge: isSubScript,
    handler: subScriptHandler,
  },
  {
    name: 'superScript',
    judge: isSuperScript,
    handler: superScriptHandler,
  },
];

export const provideStyle = (styles: StyleInterface[]) => {
  let styleOption: StyleOption = {};

  styles.forEach((style) => {
    const token = tokens.find((token) => token.judge(style));
    if (token) {
      styleOption = token.handler(style, styleOption);
    }
  });

  return styleOption;
};
