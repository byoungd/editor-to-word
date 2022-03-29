import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const superScriptHandler: TokenHandler = (_, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.superScript = true;

  return styleOption;
};
