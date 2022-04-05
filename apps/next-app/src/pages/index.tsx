import { demo, demo1 } from '../demo'
import {
  exportHtmlToDocx,
  exportMultiDocsAsZip,
  htmlToAST,
  tableNodeToITableOptions,
} from 'editor-to-word'
import { useRef, useState } from 'react'

import { Editor } from '@tinymce/tinymce-react'
import Head from 'next/head'

const Home = () => {
  const [html, setHtml] = useState(demo)

  const switchToDemoEnglish = () => {
    setHtml(demo)
  }

  const switchToDemoChinese = () => {
    setHtml(demo1)
  }

  const handleDownloadMulti = () => {
    if (editorRef.current) {
      const html = editorRef.current.getContent()
      const doc = {
        html,
        name: 'd1',
      }
      const doc2 = {
        html,
        name: 'd2',
      }
      const docs = [doc, doc2]
      exportMultiDocsAsZip(docs, 'multi')
    }
  }

  const editorRef = useRef<Editor['editor'] | null>(null)

  const handleDownload = () => {
    if (editorRef.current) {
      const html = editorRef.current.getContent()
      exportHtmlToDocx(html, 'test')
    }
  }

  const tableNode = {
    type: 'tag',
    name: 'table',
    voidElement: false,
    attrs: {
      style: 'border-collapse: collapse; width: 100%; height: 72.1876px;',
      border: '1',
    },
    children: [
      {
        type: 'text',
        content: '\n',
      },
      {
        type: 'tag',
        name: 'tbody',
        voidElement: false,
        attrs: {},
        children: [
          {
            type: 'text',
            content: '\n',
          },
          {
            type: 'tag',
            name: 'tr',
            voidElement: false,
            attrs: {
              style: 'height: 52.5938px;',
            },
            children: [
              {
                type: 'text',
                content: '\n',
              },
              {
                type: 'tag',
                name: 'td',
                voidElement: false,
                attrs: {
                  style: 'width: 23.0508%; height: 52.5938px;',
                },
                children: [
                  {
                    type: 'text',
                    content: '1',
                  },
                ],
              },
              {
                type: 'text',
                content: ' ',
              },
              {
                type: 'tag',
                name: 'td',
                voidElement: false,
                attrs: {
                  style: 'width: 23.0508%; height: 52.5938px;',
                },
                children: [
                  {
                    type: 'text',
                    content: '&nbsp;',
                  },
                ],
              },
              {
                type: 'text',
                content: ' ',
              },
              {
                type: 'tag',
                name: 'td',
                voidElement: false,
                attrs: {
                  style: 'width: 23.0508%; height: 52.5938px;',
                },
                children: [
                  {
                    type: 'text',
                    content: '&nbsp;',
                  },
                ],
              },
              {
                type: 'text',
                content: ' ',
              },
              {
                type: 'tag',
                name: 'td',
                voidElement: false,
                attrs: {
                  style: 'width: 23.0508%; height: 52.5938px;',
                },
                children: [
                  {
                    type: 'text',
                    content: '&nbsp;',
                  },
                ],
              },
              {
                type: 'text',
                content: ' ',
              },
            ],
          },
          {
            type: 'text',
            content: ' ',
          },
          {
            type: 'tag',
            name: 'tr',
            voidElement: false,
            attrs: {
              style: 'height: 19.5938px;',
            },
            children: [
              {
                type: 'text',
                content: '\n',
              },
              {
                type: 'tag',
                name: 'td',
                voidElement: false,
                attrs: {
                  style: 'width: 23.0508%; height: 19.5938px;',
                },
                children: [
                  {
                    type: 'text',
                    content: '&nbsp;',
                  },
                ],
              },
              {
                type: 'text',
                content: ' ',
              },
              {
                type: 'tag',
                name: 'td',
                voidElement: false,
                attrs: {
                  style: 'width: 23.0508%; height: 19.5938px;',
                },
                children: [
                  {
                    type: 'text',
                    content: '&nbsp;',
                  },
                ],
              },
              {
                type: 'text',
                content: ' ',
              },
              {
                type: 'tag',
                name: 'td',
                voidElement: false,
                attrs: {
                  style: 'width: 23.0508%; height: 19.5938px;',
                },
                children: [
                  {
                    type: 'text',
                    content: '&nbsp;',
                  },
                ],
              },
              {
                type: 'text',
                content: ' ',
              },
              {
                type: 'tag',
                name: 'td',
                voidElement: false,
                attrs: {
                  style: 'width: 23.0508%; height: 19.5938px;',
                },
                children: [
                  {
                    type: 'text',
                    content: '&nbsp;',
                  },
                ],
              },
              {
                type: 'text',
                content: ' ',
              },
            ],
          },
          {
            type: 'text',
            content: ' ',
          },
        ],
      },
      {
        type: 'text',
        content: ' ',
      },
    ],
  }

  const testElement = () => {
    if (editorRef.current) {
      const html = editorRef.current.getContent()
      const ast = htmlToAST(html)
      console.log('ast: ', ast)
      // @ts-ignore
      console.log(tableNodeToITableOptions(tableNode, {}))
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Export content to docx from rich-text editor</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full">
        <div className="mb-5">TinyMce example:</div>
        <div className="flex justify-around w-full mb-5">
          <button
            className="px-5 border-2 border-solid rounded-sm cursor-pointer "
            onClick={switchToDemoEnglish}
          >
            use demo english
          </button>
          <button
            className="px-5 border-2 border-solid rounded-sm cursor-pointer "
            onClick={switchToDemoChinese}
          >
            use demo chinese
          </button>
        </div>

        <Editor
          apiKey="eatopd5mesqmfb7nto2utkbaf84mlgatef2df4h8nab4az89"
          onInit={(_, editor) => (editorRef.current = editor)}
          initialValue={html}
          init={{
            height: 500,
            menubar: false,
            plugins: [
              'advlist autolink lists link image charmap print preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table paste code help wordcount table',
            ],
            toolbar:
              'undo redo | formatselect | ' +
              'bold italic forecolor backcolor underline strikethrough | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'link | code | table',
            content_style:
              'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          }}
        />
        <div className="flex justify-around w-full mt-5">
          <button
            className="px-5 text-white bg-blue-400 border-2 border-solid rounded-sm cursor-pointer"
            onClick={handleDownload}
          >
            download single file
          </button>
          <button
            className="px-5 border-2 border-solid rounded-sm cursor-pointer "
            onClick={handleDownloadMulti}
          >
            download two copy
          </button>
        </div>
        <button onClick={testElement}>test</button>
      </main>
    </div>
  )
}

export default Home
