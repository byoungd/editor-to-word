## Introduction

[`Editor-to-Word`](https://www.npmjs.com/package/editor-to-word) is a tool to export rich-text editor content as word file (.docx) by browser 🎉.

## Usage

```bash
npm i editor-to-word

# or pnpm add editor-to-word
# or yarn add editor-to-word
```

In web project:

```typescript
import { exportHtmlToDocx } from 'editor-to-word';

const html = '<p>hello <span style="color: #999">world</span></p>';

exportHtmlToDocx(html, 'testFileName');
```

## Options

For different default style set you can provider the custom paper layout and styleMap like:

```typescript
// default paper layout
export const D_Layout: IPageLayout = {
  bottomMargin: '2.54cm',
  leftMargin: '3.18cm',
  rightMargin: '3.18cm',
  topMargin: '2.54cm',
  orientation: PageOrientation.PORTRAIT,
};

// style with tag
export const D_TagStyleMap = {
  p: 'line-height: 1.5;',
  strong: 'font-weight: bold;',
  em: 'font-style: italic;',
  u: 'text-decoration: underline;',
  del: 'text-decoration: line-through;',
  h1: 'font-weight: bold; font-size: 40px; line-height: 1.5;',
  h2: 'font-weight: bold; font-size: 36px; line-height: 1.5;',
  h3: 'font-weight: bold; font-size: 24px; line-height: 1.5;',
  h4: 'font-weight: bold; font-size: 18px; line-height: 1.5;',
  h5: 'font-weight: bold; font-size: 15px; line-height: 1.5;',
  h6: 'font-weight: bold; font-size: 13px; line-height: 1.5;',
};

const options = {
  layout: D_Layout,
  tagStyleMap: D_TagStyleMap,
};

exportHtmlToDocx = ('<p>Hi there!</p>', 'doc', options);
```

And if you don't provider the options it will use the default preset.
