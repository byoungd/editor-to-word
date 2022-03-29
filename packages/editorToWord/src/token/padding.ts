import { D_FontSizePX } from './../default';
import { Direction, D_FontSizePT, PXbyPT, PXbyTWIPS, Size } from '../default';
import { handleSizeNumber } from '../helpers';
import { IndentType } from '../types';
import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const paddingHandler: TokenHandler = ({ key, val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);
  type Dire = keyof typeof Direction;
  const [, dire = Direction.left] = key.split('-');
  const { value, type } = handleSizeNumber(val);

  // handle indent
  const indent: IndentType = {};

  const size = styleOption.size || D_FontSizePX;

  const oneCharSizePT = (size / PXbyPT / 2) * PXbyTWIPS;

  const isEM = type.match(Size.em);
  const isPX = type.match(Size.px);
  const isPT = type.match(Size.pt);

  if (isEM) {
    indent.left = value * oneCharSizePT;
    styleOption.indent = indent;
  } else if (isPX) {
    indent[dire as Dire] = (value / 20) * oneCharSizePT;
    styleOption.indent = indent;
  } else if (isPT) {
    indent[dire as Dire] = (value / D_FontSizePT) * oneCharSizePT;
    styleOption.indent = indent;
  }
  return styleOption;
};
