import { Position } from 'monaco-editor'
import ternService from './workerService'
import { generateTypeDef } from './ternDefUtil'

interface ITernRequestQuery {
  type: string
  types?: boolean
  docs?: boolean
  urls?: boolean
  origins?: boolean
  caseInsensitive?: boolean
  preferFunction?: boolean
  end?: {
    ch: number
    line: number
  }
  guess?: boolean
  inLiteral?: boolean
  fullDocs?: any
  lineCharPositions?: any
  start?: any
  file?: any
  includeKeywords?: boolean
  depth?: number
  sort?: boolean
  expandWordForward?: boolean
}

type Suggestions = Array<{
  name: string
  isKeyword?: boolean
  type?: string | undefined
  depth?: number | undefined
  doc?: string | undefined
  url?: string | undefined
  origin?: string | undefined
}>

interface ITernRequestFile {
  type: string
  name: string
  text: String
}

interface ITernRequest {
  query: ITernRequestQuery
  files: ITernRequestFile[]
}

const buildRequest = (code: string, position: Position): ITernRequest => {
  return {
    query: {
      file: '[doc]',
      type: 'completions',
      types: true,
      lineCharPositions: true,
      includeKeywords: false,
      caseInsensitive: true,
      sort: true,
      end: {
        ch: position.column - 1,
        line: position.lineNumber - 1,
      },
    },
    files: [
      {
        type: 'full',
        name: '[doc]',
        text: code,
      },
    ],
  }
}

const ternUtil = {
  getCompletions: (code: string, position: Position) => {
    return new Promise<Suggestions>((resolve, reject) => {
      const body = buildRequest(code, position)
      ternService.request(body, (err, body) => {
        if (err) {
          reject(err)
        } else {
          resolve(body.completions as Suggestions)
        }
      })
    })
  },
  addDefs: (contextData: any) => {
    ternService.addDefs({
      '!name': 'contextData',
      ...(generateTypeDef(contextData) as any),
    })
  },
}

export default ternUtil
