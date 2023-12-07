import { Monaco } from '@monaco-editor/react'
import { getWorker } from './helper'
import { ExpressionIdentifier, getJSPropertyLineFromName } from '../acorn-helper'
import { getContextDataTypeOfExpression } from '../context-data'
import { editor } from 'monaco-editor'

export const registerJumpToSource = (monaco: Monaco, editor: editor.IStandaloneCodeEditor) => {
  monaco.languages.registerDefinitionProvider('javascript', {
    async provideDefinition(model, position, token) {
      const worker = await getWorker(monaco, model.uri, 'javascript')
      const definition = await worker.getDefinitionAtPosition(
        model.uri.toString(),
        model.getOffsetAt(position),
      )

      // should always have definition
      if (definition) {
        const script = model.getValue()
        const jsoName = model.uri.path.replace('/', '')
        const ei = new ExpressionIdentifier(
          { sourceType: 'module', thisExpressionReplacement: jsoName },
          script,
        )
        let expression: string = ''
        try {
          expression = await ei.extractExpressionAtPosition(model.getOffsetAt(position))
          console.log('%c Line:76 🌶 expression', 'color:#f5ce50', expression)
        } catch (ex) {}
        if (expression) {
          const contextDataType = getContextDataTypeOfExpression(expression)
          const [targetJso, targetProperty] = expression.split('.')
          const targetModel = monaco.editor
            .getModels()
            .find((model) => model.uri.path.includes(targetJso))
          if (targetModel && contextDataType === 'JSO') {
            const position = getJSPropertyLineFromName(targetModel.getValue(), targetProperty)
            editor.setModel(targetModel)
            if (position) {
              return {
                uri: model.uri,
                range: {
                  startLineNumber: position.startLine,
                  endLineNumber: position.endLine,
                  startColumn: position.startColumn + 1,
                  endColumn: position.endColumn + 1,
                },
              }
            }
          }
          console.log('emit', contextDataType)
        }
      }
      return null
    },
  })
}
