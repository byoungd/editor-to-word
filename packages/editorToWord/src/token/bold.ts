import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const boldHandler: TokenHandler = (_, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.bold = true;

  return styleOption;
};
