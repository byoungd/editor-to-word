import { CustomTagStyleMap, Node, StyleInterface, StyleOption } from '../types';
import {
  D_FontSizePT,
  PXbyPT,
  Splitter_Colon,
  Splitter_Semicolon,
} from '../default';
import { IRunOptions, ParagraphChild, TextRun } from 'docx';
import {
  getUniqueArrayByKey,
  isFilledArray,
  isValidColor,
  toHex,
  typeOf,
} from '../utils';

import { StyleMap } from '../token/styleMap';
import { handleSizeNumber } from '../helpers';
import { provideStyle } from '../token';

export const isFillTextNode = (node: Node) =>
  node && node.type === 'text' && node.content;

/**
 * convert styles to flat array
 */
export const toFlatStyleList = (
  styleStringList: string[]
): StyleInterface[] => {
  const inlined = styleStringList
    .filter(Boolean)
    .map((str) => str.split(`${Splitter_Semicolon}`))
    .flat()
    .filter((str) => str && str.indexOf(`${Splitter_Colon}`) > -1)
    .map((attr) => {
      const [key, val] = attr.trim().split(Splitter_Colon);
      const v = typeOf(val) === 'string' ? val.trim().replace(/;/i, '') : val;
      const value = isValidColor(v) ? toHex(v) : v;
      return {
        key: key.trim(),
        val: value,
      };
    });

  return getUniqueArrayByKey(inlined, 'key');
};

// text creator
export const calcTextRunStyle = (
  styleList: string[],
  tagStyleMap: CustomTagStyleMap
) => {
  const styleOption: Partial<StyleOption> = {};
  if (!styleList || styleList.length === 0) return styleOption;
  const tagList = Object.keys(tagStyleMap);

  // handle tag style like: em del strong...
  const tagStyleList: string[] = styleList.filter((str) =>
    tagList.includes(str)
  );

  const styles = tagStyleList
    .map((str) => tagStyleMap[str as keyof typeof tagStyleMap])
    .filter(Boolean) as string[];

  // flat inline styles
  const inlined = toFlatStyleList([...styleList, ...styles]);

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

  const inlinedStyleOption = provideStyle(inlined);

  return { ...styleOption, ...inlinedStyleOption };
};

// map children as ParagraphChild
export const getChildrenByTextRun = (
  nodeList: Node[],
  tagStyleMap: CustomTagStyleMap
): ParagraphChild[] => {
  const texts: ParagraphChild[] = [];
  const concatText = (list: Node[], arr: ParagraphChild[]) => {
    list.forEach((n) => {
      if (isFillTextNode(n)) {
        const { shape } = n;
        const textBuildParam = { text: n.content };

        const styleOption =
          shape && shape.length ? calcTextRunStyle(shape, tagStyleMap) : {};
        arr.push(
          new TextRun({ ...textBuildParam, ...styleOption } as IRunOptions)
        );
      } else if (isFilledArray(n.children)) {
        concatText(n.children, arr);
      }
    });
  };
  concatText(nodeList, texts);

  return texts;
};
