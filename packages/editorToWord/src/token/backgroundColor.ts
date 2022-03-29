import { ShadingType } from 'docx';
import { deepCopyByJSON } from './../utils';
import { TokenHandler } from './types';

export const backgroundHandler: TokenHandler = ({ val }, styleOp) => {
  const styleOption = deepCopyByJSON(styleOp);

  styleOption.shading = {
    type: ShadingType.CLEAR,
    fill: val.replace(/#/g, ''),
  };

  return styleOption;
};
