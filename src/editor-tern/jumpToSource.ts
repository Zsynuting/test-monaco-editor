import { Monaco } from '@monaco-editor/react'
import { ExpressionIdentifier, getJSPropertyLineFromName } from '../acorn-helper'
import { getContextDataTypeOfExpression } from '../context-data'
import { editor } from 'monaco-editor'
import { getJsoName } from './helper'

export const registerJumpToSource = (monaco: Monaco, editor: editor.IStandaloneCodeEditor) => {
  monaco.languages.registerDefinitionProvider('javascript', {
    async provideDefinition(model, position) {
      const script = model.getValue()
      const jsoName = getJsoName(model.uri)
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
        console.log('emit:', { contextDataType, targetJso, targetProperty })
      }
      return null
    },
  })
}
