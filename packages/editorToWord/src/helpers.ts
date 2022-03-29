import { SizeNumber } from './types';

/**
 * parse size
 */
export const handleSizeNumber = (val: string): SizeNumber => {
  const m = val.match(/\d+(.\d+)?/g);
  if (val.match(/\d+(.\d+)?/g) && m && Array.isArray(m) && m[0]) {
    const target = m[0];
    const type = target ? val.replace(new RegExp(target, 'g'), '') : '';
    return { value: parseFloat(target), type };
  }
  return { type: 'UNKNOWN', value: 0 };
};
