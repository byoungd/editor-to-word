import { handleSizeNumber } from '../src/helpers';

test('parse string 100px into number', () => {
  expect(handleSizeNumber('100px')).toEqual({ type: 'px', value: 100 });
});

test('parse string 50em into number', () => {
  expect(handleSizeNumber('50em')).toEqual({ type: 'em', value: 50 });
});
