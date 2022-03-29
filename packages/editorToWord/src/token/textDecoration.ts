import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';
import { StyleMap } from './styleMap';
import { SingleLine } from '../default';

export const textDecorationHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);
  if (val === StyleMap.lineThrough) {
    styleOption.strike = true;
  } else if (val === StyleMap.underline) {
    styleOption.underline = SingleLine;
  }
  return styleOption;
};
