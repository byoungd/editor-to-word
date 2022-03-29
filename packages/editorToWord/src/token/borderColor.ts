import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const borderColorHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.borderColor = val.replace(/#/i, '');

  return styleOption;
};
