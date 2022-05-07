import { D_FontSizePX } from './../default';
import { D_FontSizePT, PXbyPT, PXbyTWIPS, Size } from '../default';
import { handleSizeNumber } from '../utils';
import { IndentType } from '../types';
import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const paddingHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);
  // type Dire = keyof typeof Direction;
  // const [, dire = Direction.firstLine] = key.split('-');
  const { value, type } = handleSizeNumber(val);

  const indent: IndentType = {};

  const size = styleOption.size || D_FontSizePX;

  const oneCharSizePT = (size / PXbyPT / 2) * PXbyTWIPS;

  const isEM = type.match(Size.em);
  const isPX = type.match(Size.px);
  const isPT = type.match(Size.pt);

  // handle text-indent
  let indentValue = 0;
  if (isEM) {
    indentValue = value * oneCharSizePT;
  } else if (isPX) {
    indentValue = (value / 20) * oneCharSizePT;
  } else if (isPT) {
    indentValue = (value / D_FontSizePT) * oneCharSizePT;
  }
  // FIXME: for now only support firstLine
  indent.firstLine = indentValue;
  styleOption.indent = indent;

  return styleOption;
};
