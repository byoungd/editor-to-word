import { Direction, Size } from '../default';
import { handleSizeNumber } from '../helpers';
import { IndentType } from '../types';
import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const paddingHandler: TokenHandler = ({ key, val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);
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
  return styleOption;
};
