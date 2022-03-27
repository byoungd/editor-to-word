## Introduction

[`Editor-to-Word`](https://www.npmjs.com/package/editor-to-word) is a tool to export rich-text editor content as word file (.docx) by browser 🎉.

## Usage

```bash
npm i editor-to-word

# or pnpm i editor-to-word
# or yarn add editor-to-word
```

In web project:

```typescript
import { exportHtmlToDocx } from 'editor-to-word';

const html = '<p>hello <span style="color: #999">world</span></p>';

exportHtmlToDocx(html, 'testFileName');
```
