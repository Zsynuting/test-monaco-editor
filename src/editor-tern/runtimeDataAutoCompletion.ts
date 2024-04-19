import { Monaco } from '@monaco-editor/react'
import { getWorker } from './helper'
import { getContextData } from '../context-data'
import { generateJSORuntimeDeclaration } from '../object-helper/content'
import { Uri, editor } from 'monaco-editor'

export const registerRuntimeAutoCompletion = async (monaco: Monaco) => {
  const contextData = getContextData()
  const contextDataModels: editor.ITextModel[] = []
  for (const prop in contextData) {
    if (['Props', 'State', 'DataSourceMap'].includes(prop)) {
    } else {
      const jsoRuntimeDeclaration = generateJSORuntimeDeclaration(contextData[prop], prop)
      const model = monaco.editor.createModel(
        jsoRuntimeDeclaration,
        'typescript',
        new Uri().with({ path: `${prop}_dts.ts` }),
      )
      contextDataModels.push(model)
    }
  }
  const libs: { content: string; filePath?: string }[] = []
  await Promise.all(
    contextDataModels.map(async (model) => {
      const worker = await getWorker(monaco, model.uri, 'typescript')
      const { outputFiles } = await worker.getEmitOutput(model.uri.toString())
      const dtsFile = outputFiles.find((item) => item.name.endsWith('.d.ts'))
      if (dtsFile) {
        const content = dtsFile.text.replace('export', '')
        console.log('%c Line:29 🥛 content', 'color:#ed9ec7', content)
        libs.push({
          content: content,
          filePath: dtsFile.name,
        })
      }
    }),
  )
  monaco.languages.typescript.javascriptDefaults.setExtraLibs(libs)
}
