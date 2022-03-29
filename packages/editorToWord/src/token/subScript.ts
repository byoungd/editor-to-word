import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const subScriptHandler: TokenHandler = (_, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.subScript = true;

  return styleOption;
};
