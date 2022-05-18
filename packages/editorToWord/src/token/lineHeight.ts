import { LineRuleType } from 'docx';
import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';
import { handleSizeNumber } from '../utils';
import { SpacingType } from '../types';

export const lineHeightHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  const spacing: SpacingType = {};
  const { value, type } = handleSizeNumber(val);

  const lineHeightToSpace = 240;

  const isPx = type.toLowerCase() === 'px';
  const isPr = type.toLowerCase() == '%';

  let lineHeightVal = value;

  if (isPx && value) {
    lineHeightVal = value / 16;
  } else if (isPr) {
    lineHeightVal = value / 100;
  }
  // when line-height is 1.0 these is no need to set spacing
  const isNoSpacing = lineHeightVal == 1;

  if (value && !isNoSpacing) {
    const s = lineHeightVal * lineHeightToSpace;
    spacing.line = s;
    spacing.lineRule = LineRuleType.AUTO;
  }
  styleOption.spacing = spacing;

  return styleOption;
};
