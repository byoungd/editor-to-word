import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const heightHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  const h = parseFloat(val.replace(/px/i, ''));
  styleOption.tHeight = h;

  return styleOption;
};
