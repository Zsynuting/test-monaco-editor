import { Monaco } from '@monaco-editor/react'
import { Uri, languages } from 'monaco-editor'

export const getWorker = async (
  monaco: Monaco,
  uri: Uri,
  language: 'typescript' | 'javascript' = 'javascript',
): Promise<languages.typescript.TypeScriptWorker> => {
  if (language === 'typescript') {
    const getter = await monaco.languages.typescript.getTypeScriptWorker()
    const worker = await getter()
    return worker
  } else {
    const getter = await monaco.languages.typescript.getJavaScriptWorker()
    const worker = await getter()
    return worker
  }
}

export const getDts = async (monaco: Monaco, uri: Uri, language: 'typescript' | 'javascript') => {
  const worker = await getWorker(monaco, uri, language)
  const { outputFiles } = await worker.getEmitOutput(uri.toString())
  const dtsFile = outputFiles.find((f) => f.name.endsWith('.d.ts'))
  return dtsFile?.text
}

export const generateDts = async (
  monaco: Monaco,
  script: string,
  language: 'typescript' | 'javascript',
) => {
  const model = monaco.editor.createModel(script, language)
  const dts = await getDts(monaco, model.uri, language)
  return dts
}

export const getCompletionKind = (type: string | undefined, isKeyword: boolean | undefined) => {
  if (isKeyword) return languages.CompletionItemKind.Keyword
  switch (type) {
    case 'string':
    case 'bool':
      return languages.CompletionItemKind.Variable
    default:
      return languages.CompletionItemKind.Constant
  }
}

export const getJsoName = (uri: Uri) => uri.path.replace('/', '').replace('.js', '')
