import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const fontStyleHandler: TokenHandler = (_, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.italics = true;

  return styleOption;
};
