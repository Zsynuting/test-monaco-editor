import MonacoEditor, { Monaco } from '@monaco-editor/react'
import { editor, MarkerSeverity } from 'monaco-editor'
import { useRef } from 'react'
import { registerTernAutoCompletion } from './ternAutoCompletion'
import { registerJumpToSource } from './jumpToSource'
import { registerPeekValue } from './peekValue'
import { getContextData, setContextData } from '../context-data'
import ternUtil from '../worker/ternUtil'
import { registerRuntimeAutoCompletion } from './runtimeDataAutoCompletion'
import { registerTypeAutoCompletion } from './typeAutoCompletion'

const files: Record<string, string> = {
  jso1: `export default { 
  text: "1",
  setText(text) {
    this.text = text
  }
}
`,
  jso2: `export default { 
  data: undefined
}
`,
}

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
    text: '100',
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

    Object.keys(files).forEach(async (fileName) => {
      const script = files[fileName]
      monaco.editor.createModel(
        script,
        'javascript',
        new monaco.Uri().with({ path: `${fileName}.js` }),
      )
    })

    const currentModels = monaco.editor.getModels()
    editor.setModel(currentModels[0])
  }

  const onMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    const tsOptions = monaco.languages.typescript.typescriptDefaults.getCompilerOptions()
    console.log('%c Line:90 🍆 tsOptions', 'color:#33a5ff', tsOptions)
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      ...tsOptions,
      strictNullChecks: true,
      declaration: true,
    })
    const jsOptions = monaco.languages.typescript.javascriptDefaults.getCompilerOptions()
    console.log('%c Line:96 🥔 jsOptions', 'color:#465975', jsOptions)
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      ...jsOptions,
      strict: true,
      strictNullChecks: true,
      declaration: true,
    })
    editorRef.current = editor
    monacoRef.current = monaco
    registerFiles(editor, monaco)
    // registerAutoCompletion(monaco)
    // registerRuntimeAutoCompletion(monaco)
    registerTypeAutoCompletion(monaco)
    registerJumpToSource(monaco, editor)
    registerPeekValue(monaco)
    ternUtil.addDefs(getContextData())
  }

  const switchModel = (path: string) => {
    const targetModel = monacoRef.current?.editor
      .getModels()
      .find((model) => model.uri.path.includes(path))
    if (targetModel) {
      editorRef.current?.setModel(targetModel)
    }
  }

  const onChange = async (markers: editor.IMarker[]) => {
    if (!markers.some((marker) => marker.severity === MarkerSeverity.Error)) {
      const model = editorRef.current?.getModel()
      if (model) {
        const value = model?.getValue()
        const fileName = model?.uri.path.replace('/', '')
        if (value) {
          files[fileName] = value
        }
      }
    }
  }

  return (
    <div>
      <button onClick={() => switchModel('jso1')}>jso1</button>
      <button onClick={() => switchModel('jso2')}>jso2</button>
      <MonacoEditor
        width="1500px"
        theme="vs-dark"
        height="1200px"
        language="javascript" //注意此处language必须与 monaco 注册的代码提示里的保持一致
        onMount={onMount}
        onValidate={(markers) => onChange(markers)}
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
