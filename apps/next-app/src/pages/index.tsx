import { Editor } from '@tinymce/tinymce-react'
import Head from 'next/head'
import { exportHtmlToDocx } from 'editor-to-word'
import { useRef } from 'react'

const Home = () => {
  const editorRef = useRef<Editor['editor'] | null>(null)
  const handleDownload = () => {
    if (editorRef.current) {
      const html = editorRef.current.getContent()
      exportHtmlToDocx(html, 'test')
    }
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Export content to docx from rich-text editor</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center flex-1 w-full">
        <div>TinyMce example:</div>
        <Editor
          apiKey="eatopd5mesqmfb7nto2utkbaf84mlgatef2df4h8nab4az89"
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue="<p>Paste <span style='color: rgb(224, 62, 45);' data-mce-style='color: #e03e2d;'>text</span> here or write them...</p>"
          init={{
            height: 500,
            menubar: false,
            plugins: [
              'advlist autolink lists link image charmap print preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table paste code help wordcount',
            ],
            toolbar:
              'undo redo | formatselect | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
            content_style:
              'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          }}
        />
        <button
          className="border-2 border-solid cursor-pointer"
          onClick={handleDownload}
        >
          click here to download
        </button>{' '}
      </main>
    </div>
  )
}

export default Home
