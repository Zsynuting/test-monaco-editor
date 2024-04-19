import MonacoEditor, { Monaco } from '@monaco-editor/react'
import { editor, MarkerSeverity, Uri } from 'monaco-editor'
import { useRef } from 'react'
import { registerTernAutoCompletion } from './ternAutoCompletion'
import { registerJumpToSource } from './jumpToSource'
import { registerPeekValue } from './peekValue'
import { getContextData, setContextData } from '../context-data'
import ternUtil from '../worker/ternUtil'
import { code } from '../code'

function setText() {}
setText.data = {
  test: 'setText function data',
}
async function asyncSetText() {}
asyncSetText.data = {
  loading: false,
  test: 'async setText function data',
}

setContextData('JSO', {
  jso1: {
    text: 100,
    setText,
    asyncSetText,
  },
  jso2: {
    data: {
      array: [{ name: 'zsy' }],
      nullProp: null,
      undefinedProp: undefined,
      x: {
        y: {
          z: 1,
        },
      },
    },
  },
  aaa: {
    xxx: true,
  },
})

setContextData('Props', {
  visible: true,
})

setContextData('State', {
  dataSource: [],
})

function Editor() {
  const editorRef = useRef<editor.IStandaloneCodeEditor>()
  const monacoRef = useRef<Monaco>()

  const registerFiles = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    const models = monaco.editor.getModels()
    models[0]?.dispose()
    monaco.editor.createModel(code, 'javascript', new monaco.Uri().with({ path: `jso1.js` }))
    const currentModels = monaco.editor.getModels()
    editor.setModel(currentModels[0])
  }

  const onMount = async (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    const isMac = navigator.userAgent.includes('Macintosh')
    editor.onMouseDown((e) => {
      if ((isMac && e.event.metaKey) || (!isMac && e.event.ctrlKey)) {
      }
    })

    // monaco.languages.typescript.javascriptDefaults.setExtraLibs([
    //   {
    //     content: `
    //     type IOption = { obj?: {x: number } }
    //     declare const Opt: IOption | undefined
    //     `,
    //     filePath: 'fn.d.ts',
    //   },
    // ])

    editorRef.current = editor
    monacoRef.current = monaco
    registerFiles(editor, monaco)
    registerTernAutoCompletion(monaco)
    registerJumpToSource(monaco, editor)
    registerPeekValue(monaco)
    ternUtil.addDefs(getContextData())
  }

  return (
    <div>
      <MonacoEditor
        width="1500px"
        theme="vs-dark"
        height="1200px"
        language="javascript" //注意此处language必须与 monaco 注册的代码提示里的保持一致
        onMount={onMount}
        options={{
          suggest: {
            showFiles: false,
          },
          wordBasedSuggestions: false,
        }}
      />
    </div>
  )
}

export default Editor
