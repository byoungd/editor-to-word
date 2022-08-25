import { TagType } from './../default';
import { CustomTagStyleMap, Node, StyleInterface, StyleOption } from '../types';
import {
  D_FontSizePT,
  D_TagStyleMap,
  PXbyPT,
  Splitter_Colon,
  Splitter_Semicolon,
} from '../default';
import {
  ExternalHyperlink,
  ImageRun,
  IRunOptions,
  ParagraphChild,
  TextRun,
} from 'docx';
import {
  getImageBlob,
  getUniqueArrayByKey,
  isFilledArray,
  isValidColor,
  optimizeBlankSpace,
  toHex,
  typeOf,
} from '../utils';

import { StyleMap } from '../token/styleMap';
import { handleSizeNumber } from '../utils';
import { provideStyle } from '../token';
import { isFillTextNode } from '../isNodeType';

// convert styles to flat array
export const toFlatStyleList = (
  styleStringList: string[]
): StyleInterface[] => {
  const inlined = styleStringList
    .filter(Boolean)
    .map((str) => str.split(`${Splitter_Semicolon}`))
    .flat()
    .filter((str) => str.indexOf(`${Splitter_Colon}`) > -1)
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
  tagStyleMap: CustomTagStyleMap = D_TagStyleMap
) => {
  const styleOption: Partial<StyleOption> = {};
  if (!styleList || styleList.length === 0) return styleOption;
  const tagList = Object.keys(tagStyleMap);

  // handle tag style like: em del strong...
  const tagStyleList: string[] = styleList.filter((str) =>
    tagList.includes(str)
  );

  const inlined = tagStyleList
    .map((str) => tagStyleMap[str as keyof typeof tagStyleMap])
    .filter(Boolean) as string[];

  // flat inline styles
  const styles = toFlatStyleList([...styleList, ...inlined]);

  const fontSizeSty = styles.find(
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

  const inlinedStyleOption = provideStyle(styles);

  return { ...styleOption, ...inlinedStyleOption };
};

export const textCreator = (
  node: Node,
  tagStyleMap: CustomTagStyleMap = D_TagStyleMap
) => {
  const { shape, content } = node;

  const textBuildParam = { text: optimizeBlankSpace(content) };

  const styleOption =
    shape && shape.length ? calcTextRunStyle(shape, tagStyleMap) : {};

  return new TextRun({ ...textBuildParam, ...styleOption } as IRunOptions);
};

// map children as ParagraphChild
export const getChildrenByTextRun = async (
  nodeList: Node[],
  tagStyleMap: CustomTagStyleMap = D_TagStyleMap
): Promise<ParagraphChild[]> => {
  const texts: ParagraphChild[] = [];
  const concatText = async (list: Node[], arr: ParagraphChild[]) => {
    for (let node of list) {
      if (isFillTextNode(node)) {
        arr.push(textCreator(node, tagStyleMap));
      } else if (node.name === TagType.img) {
        const { attrs } = node;
        const { src, width = 100, height = 100 } = attrs;
        if (src) {
          try {
            const imgBlob = await getImageBlob(String(src));
            const image = new ImageRun({
              data: imgBlob as unknown as ArrayBuffer,
              transformation: {
                width: Number(width),
                height: Number(height),
              },
            });
            arr.push(image);
          } catch (e) {
            console.log('download image error', e);
          }
        }
      } else if (isFilledArray(node.children)) {
        // deal with hyperlink
        if (node.name === TagType.link) {
          const { attrs } = node;
          const text = new ExternalHyperlink({
            children: await getChildrenByTextRun(node.children, tagStyleMap),
            link: attrs.href ? String(attrs.href) : '',
          });
          arr.push(text);
        } else {
          await concatText(node.children, arr);
        }
      }
    }
  };
  await concatText(nodeList, texts);

  return texts;
};
