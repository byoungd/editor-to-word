import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const fontFamilyHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  if (val.indexOf(',') === -1 && val.indexOf(' ') === -1) {
    styleOption.font = val;
  }

  return styleOption;
};
