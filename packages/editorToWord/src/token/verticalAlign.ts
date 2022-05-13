import { verticalAlignMap } from '../default';
import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const verticalAlignHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.verticalAlign =
    verticalAlignMap[val as keyof typeof verticalAlignMap];

  return styleOption;
};
