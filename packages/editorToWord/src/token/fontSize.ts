const fontSizeSty = inlined.find(
  (sty: StyleInterface) => sty.key === StyleMap.fontSize
);
const fontSize =
  fontSizeSty && fontSizeSty.val ? handleSizeNumber(fontSizeSty.val) : null;

/**
 * size(halfPts): Set the font size, measured in half-points
 */
if (fontSize) {
  const { value, type } = fontSize;
  const size = type === 'pt' ? value * 2 : value * PXbyPT * 2;
  styleOption.size = size;
} else {
  styleOption.size = D_FontSizePT * 2;
}
