import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const widthHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  const w = parseFloat(val.replace(/%/i, ''));
  styleOption.tWidth = w;

  return styleOption;
};
