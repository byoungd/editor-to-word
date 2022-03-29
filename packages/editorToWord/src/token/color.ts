import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const colorHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.color = val.replace(/#/g, '');

  return styleOption;
};
