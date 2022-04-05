import { Node } from './types';

// text node
export const isTextNode = (node: Node) => node && node.type === 'text';

// text node with content
export const isFillTextNode = (node: Node) =>
  node && node.type === 'text' && node.content;
