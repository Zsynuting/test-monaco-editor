import { Monaco } from '@monaco-editor/react'
import { editor, Position, CancellationToken } from 'monaco-editor'
import { ExpressionIdentifier } from '../acorn-helper'
import { getContextDataOfExpression } from '../context-data'
import { getJsoName } from './helper'

export const registerPeekValue = (monaco: Monaco) => {
  monaco.languages.registerHoverProvider('javascript', {
    async provideHover(model: editor.ITextModel, position: Position, token: CancellationToken) {
      const script = model.getValue()
      const jsoName = getJsoName(model.uri)
      const ei = new ExpressionIdentifier(
        {
          sourceType: 'module',
          thisExpressionReplacement: jsoName,
        },
        script,
      )
      let expression: string = ''
      try {
        expression = await ei.extractExpressionAtPosition(model.getOffsetAt(position))
        console.log('%c Line:76 🌶 expression', 'color:#f5ce50', expression)
      } catch (ex) {
        console.log('%c Line:80 🍤 ex', 'color:#f5ce50', ex)
      }

      return {
        contents: [{ value: getContextDataOfExpression(expression) }],
      }
    },
  })
}
