import { Monaco } from '@monaco-editor/react'
import { editor, Position, CancellationToken, languages } from 'monaco-editor'
import ternUtil from '../worker/ternUtil'
import { getCompletionKind } from './helper'

export const registerTernAutoCompletion = async (monaco: Monaco) => {
  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: async (
      model: editor.ITextModel,
      position: Position,
      context: languages.CompletionContext,
      token: CancellationToken,
    ) => {
      const code = model.getValue()
      const word = model.getWordAtPosition(position)
      const ternCompletions = await ternUtil.getCompletions(code, position)
      if (ternCompletions.length > 0) {
        console.log('%c Line:19 🌮 ternCompletions', 'color:#42b983', ternCompletions)
        return {
          suggestions: ternCompletions.map((item) => ({
            label: item.name,
            kind: getCompletionKind(item.type, item.isKeyword),
            detail: item.type,
            insertText: item.name,
            range: {
              startColumn: word ? word.startColumn : position.column,
              endColumn: word ? word.endColumn : position.column,
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
            },
          })),
        }
      }
    },
    triggerCharacters: ['', '.'], // 触发代码提示的关键字，ps：可以有多个
  })
}
