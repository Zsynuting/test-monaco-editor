import type { Node } from 'acorn'
import { parse } from 'acorn'
import { ancestor, simple } from 'acorn-walk'
import {
  getExpressionStringAtPos,
  isLiteralNode,
  isPositionWithinNode,
  isPropertyNode,
} from './utils'
import { NodeTypes, PropertyNode } from './typing'

export type SourceType = 'script' | 'module'

export class ExpressionIdentifier {
  private parsedScript?: Node
  private options: ExpressionIdentifierOptions

  constructor(options: ExpressionIdentifierOptions, script?: string) {
    this.options = options
    if (script) this.updateScript(script)
  }

  hasParsedScript() {
    return !!this.parsedScript
  }

  updateScript(script: string) {
    try {
      this.parsedScript = parse(script, {
        ecmaVersion: 'latest',
        sourceType: this.options.sourceType,
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  clearScript() {
    this.parsedScript = undefined
  }

  extractExpressionAtPosition(pos: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.parsedScript) {
        throw new Error('No valid script found')
      }

      let nodeFound: Node | undefined

      simple(this.parsedScript, {
        MemberExpression(node: Node) {
          if (!nodeFound && isPositionWithinNode(node, pos)) {
            nodeFound = node
          }
        },
        ExpressionStatement(node: Node) {
          if (!nodeFound && isPositionWithinNode(node, pos)) {
            nodeFound = node
          }
        },
      })

      if (nodeFound) {
        const expressionFound = getExpressionStringAtPos(nodeFound, pos, this.options)
        if (expressionFound) {
          resolve(expressionFound)
        } else {
          reject('ExpressionIdentifier - No expression found at position')
        }
      }
      reject('ExpressionIdentifier - No node found')
    })
  }
}

export type ExpressionIdentifierOptions = {
  sourceType: SourceType
  thisExpressionReplacement?: string
}

export const getJSPropertyLineFromName = (
  code: string,
  functionName: string,
): { startLine: number; endLine: number; startColumn: number; endColumn: number } | undefined => {
  let ast: Node = { end: 0, start: 0, type: '' }
  let result:
    | { startLine: number; endLine: number; startColumn: number; endColumn: number }
    | undefined = undefined
  try {
    ast = ast = parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
    })
  } catch (e) {
    return result
  }

  ancestor(ast, {
    Property(node, ancestors: Node[]) {
      // We are only interested in identifiers at this depth (exported object keys)
      const depth = ancestors.length - 3
      if (
        isPropertyNode(node) &&
        // @ts-ignore
        node.key.loc &&
        getNameFromPropertyNode(node) === functionName &&
        ancestors[depth] &&
        ancestors[depth].type === NodeTypes.ExportDefaultDeclaration
      ) {
        // 1 is subtracted because codeMirror's line is zero-indexed, this isn't
        result = {
          // @ts-ignore
          startLine: node.key.loc.start.line,
          // @ts-ignore
          endLine: node.key.loc.end.line,
          // @ts-ignore
          startColumn: node.key.loc.start.column,
          // @ts-ignore
          endColumn: node.key.loc.end.column,
        }
      }
    },
  })
  return result
}

const getNameFromPropertyNode = (node: PropertyNode): string =>
  isLiteralNode(node.key) ? String(node.key.value) : node.key.name
