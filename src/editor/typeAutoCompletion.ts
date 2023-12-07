import { Monaco } from '@monaco-editor/react'
import { editor, Uri } from 'monaco-editor'
import { getContextData } from '../context-data'
import { generateJSORuntimeDeclaration } from '../context-data/util'
import { getJsoName, getWorker } from './helper'

const generateDts = async (model: editor.ITextModel, jsoName: string, monaco: Monaco) => {
  const contextData = getContextData()
  const code = model.getValue()
  console.log('%c Line:7 🍐 code', 'color:#33a5ff', code)

  let originalTypeShadowModel = monaco.editor
    .getModels()
    .find((item) => item.uri.path.endsWith(`${jsoName}.ts`))
  if (!originalTypeShadowModel) {
    originalTypeShadowModel = monaco.editor.createModel(
      '',
      'typescript',
      new Uri().with({ path: `${jsoName}.ts` }),
    )
  }
  originalTypeShadowModel.setValue(code.replace('export default', `const ${jsoName}Original = `))

  let runtimeTypeShadowModel = monaco.editor
    .getModels()
    .find((item) => item.uri.path.endsWith(`${jsoName}-runtime.ts`))
  if (!runtimeTypeShadowModel) {
    runtimeTypeShadowModel = monaco.editor.createModel(
      '',
      'typescript',
      new Uri().with({ path: `${jsoName}-runtime.ts` }),
    )
  }
  const runtimeDataDeclaration = `const ${jsoName}RunTimeData = ${generateJSORuntimeDeclaration(
    contextData[jsoName],
    jsoName,
  )}`
  console.log('%c Line:39 🍊 runtimeCode', 'color:#ed9ec7', runtimeDataDeclaration)
  runtimeTypeShadowModel.setValue(runtimeDataDeclaration)

  const worker = await getWorker(monaco, originalTypeShadowModel.uri, 'typescript')
  const originalTypeEmit = await worker.getEmitOutput(originalTypeShadowModel.uri.toString())
  const originalDtsFile = originalTypeEmit.outputFiles.find((item) => item.name.endsWith('.d.ts'))

  const runtimeTypeEmit = await worker.getEmitOutput(runtimeTypeShadowModel.uri.toString())
  const runtimeDtsFile = runtimeTypeEmit.outputFiles.find((item) => item.name.endsWith('.d.ts'))

  if (originalDtsFile) {
    const originalDts = originalDtsFile?.text
    console.log('%c Line:19 🥒 originalDts', 'color:#ffdd4d', originalDts)
    const dts = `
type AnyFunction = (...args: any) => any
type AsyncFunction = (...args: any) => Promise<any>

type EnhanceJSOFunction<F> = F extends AnyFunction
  ? F & (F extends AsyncFunction
    ? Awaited<ReturnType<F>> extends void ? { loading: boolean, error?: Error } : { data?: Awaited<ReturnType<F>>, loading: boolean, error?: Error }
    : ReturnType<F> extends void ? F : { data?: ReturnType<F> })
  : F

type EnhanceJSO<T extends Record<string, any>> = {
  [K in keyof T]: EnhanceJSOFunction<T[K]>
}

type PickJSOFunctionRuntimeData<T extends any, K extends string> = {
  [key in K]: key extends keyof T ? T[key] : never
}

type MergeJSOFunction<A extends AnyFunction, B extends any> = A extends AsyncFunction
  ? Awaited<ReturnType<A>> extends void
  ? A & PickJSOFunctionRuntimeData<B, 'loading' | 'error'> : A & PickJSOFunctionRuntimeData<B, 'loading' | 'data' | 'error'>
  : ReturnType<A> extends void
  ? A : A & PickJSOFunctionRuntimeData<B, 'data'>


type MergeJSOType<A extends Record<string, unknown>, B extends Record<string, unknown>> = {
  [K in keyof A]: K extends keyof B
  ? A[K] extends AnyFunction
  ? MergeJSOFunction<A[K], B[K]>
  : A[K] | B[K]
  : A[K]
}

${originalDts.replace(`declare const ${jsoName}Original:`, `type ${jsoName}OriginalType =`)}

${
  runtimeDtsFile
    ? runtimeDtsFile.text.replace(
        `declare const ${jsoName}RunTimeData:`,
        `type ${jsoName}RuntimeType =`,
      )
    : `type ${jsoName}RuntimeType = never`
}

type ${jsoName}Type = MergeJSOType<EnhanceJSO<${jsoName}OriginalType>, ${jsoName}RuntimeType>
declare const ${jsoName}: ${jsoName}Type
`
    console.log('%c Line:45 🥒 dts', 'color:#ffdd4d', dts)
    return dts
  }
}

export const registerTypeAutoCompletion = async (monaco: Monaco) => {
  const models = monaco.editor.getModels()
  models.forEach((model) => {
    model.onDidChangeContent(async () => {
      const jsoName = getJsoName(model.uri)
      console.log('%c Line:110 🍷 jso:', 'color:#4fff4B', jsoName)
      const dts = await generateDts(model, jsoName, monaco)
      if (dts) {
        const existingLibs = monaco.languages.typescript.javascriptDefaults.getExtraLibs()
        const libs = Object.entries(existingLibs)
          .filter(([key]) => !key.includes(jsoName))
          .map(([key, value]) => ({
            content: value.content,
            filePath: key,
          }))
        libs.push({
          content: dts,
          filePath: `${jsoName}.d.ts`,
        })
        console.log('%c Line:66 🥕 libs', 'color:#e41a6a', libs)
        monaco.languages.typescript.javascriptDefaults.setExtraLibs(libs)
      }
    })
  })

  const libs: any[] = []
  await Promise.all(
    models.map(async (model) => {
      const jsoName = getJsoName(model.uri)
      const dts = await generateDts(model, jsoName, monaco)
      libs.push({
        content: dts,
        filePath: `${jsoName}.d.ts`,
      })
    }),
  )
  console.log('%c Line:82 🧀 libs', 'color:#fca650', libs)
  monaco.languages.typescript.javascriptDefaults.setExtraLibs(libs)
}
