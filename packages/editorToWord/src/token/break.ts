import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const breakHandler: TokenHandler = (_, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.break = 1;

  return styleOption;
};
