# editor-to-docx

Export rich-text editor content as word file (.docx) by browser 🎉.

<p align='center'>
<b>English</b> | <a href="https://github.com/byoungd/editor-to-word/blob/main/README.zh-CN.md">简体中文</a>
</p>

## Demo

[online demo](https://editor-to-word.yu.team)

## Architecture

This project uses [`turborepo`](https://turborepo.org/) as repo management.

The `editor-to-word` package is located at `packages/htmlToDocx`

## Development Usage

clone the repo and:

```
# 1 install dependencies
yarn

# 2 build pkg
yarn build

# 3 start next-app and visit `http://localhost:3000/`
yarn dev
```

## TODO

- image
- optimize table converter
- list
- sub/pub script
