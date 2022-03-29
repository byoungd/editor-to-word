import { VerticalAlign, AlignmentType } from 'docx';
import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';
import { AlignMap } from '../default';

export const alignHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.alignment =
    AlignMap[val as keyof typeof AlignMap] || AlignmentType.CENTER;
  styleOption.verticalAlign = VerticalAlign.CENTER;

  return styleOption;
};
