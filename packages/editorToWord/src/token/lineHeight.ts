import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';
import { handleSizeNumber } from '../helpers';
import { D_LineHeight } from '../default';

export const lineHeightHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  const spacing = { before: 0, after: 0, line: 240 * D_LineHeight };
  const { value, type } = handleSizeNumber(val);
  if (value) {
    spacing.line = type === '%' ? (value / 100) * 240 : value * 240;
  }
  styleOption.spacing = spacing;

  return styleOption;
};
