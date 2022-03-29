import { VerticalAlign } from 'docx';
import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const verticalAlignHandler: TokenHandler = (_, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.verticalAlign = VerticalAlign.CENTER;

  return styleOption;
};
