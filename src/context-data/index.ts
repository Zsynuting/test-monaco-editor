import _ from 'lodash'

type ContextDataType = 'Props' | 'State' | 'DataSourceMap' | 'JSO' | 'CurrentModule'

export interface IContextData {
  Props: Record<string, any>
  State: Record<string, any>
  DataSourceMap: Record<string, (...args: any) => Promise<any>>
  [key: string]: any
}

let contextData: IContextData = { Props: {}, State: {}, DataSourceMap: {} }

export const setContextData = (type: ContextDataType, payload: any) => {
  switch (type) {
    case 'Props':
      contextData.Props = payload
      break
    case 'State':
      contextData.State = payload
      break
    case 'DataSourceMap':
      contextData.DataSourceMap = payload
      break
    case 'JSO':
      contextData = {
        ...contextData,
        ...payload,
      }
      break
    case 'CurrentModule':
      throw new Error('can not set CurrentModule')
    default:
      throw new Error('unsupported context data type')
  }
}

export const getContextData = () => contextData

export const getContextDataOfExpression = (expression: string) => {
  try {
    const contextDataType = getContextDataTypeOfExpression(expression)
    if (contextDataType === 'CurrentModule') {
      const [, ...path] = expression.split('.')
      return JSON.stringify(_.get(contextData, path.join('.')), null, 2)
    } else {
      return JSON.stringify(_.get(contextData, expression), null, 2)
    }
  } catch (ex) {
    console.log(ex as Error)
    return ''
  }
}

export const getContextDataTypeOfExpression = (expression: string): ContextDataType => {
  const [varName] = expression.split('.')
  if (varName === 'Props') return 'Props'
  if (varName === 'State') return 'State'
  if (varName === 'DataSourceMap') return 'DataSourceMap'
  if (varName === 'CurrentModule') return 'CurrentModule'
  if (varName in contextData) return 'JSO'
  throw new Error('variable not found')
}
