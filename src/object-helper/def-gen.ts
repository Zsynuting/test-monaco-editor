import _ from 'lodash'

export const generateDefForObject = (object: any, variableName: string) => {
  const dfs = (value: unknown): string => {
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return `[
${value.map((item) => dfs(item)).join(',')}
]`
      } else if (value === null) {
        return 'null'
      } else {
        return `{
${Object.keys(value)
  .map((key) => `${key}: ${dfs((value as Record<string, unknown>)[key])}`)
  .join(',\n')}
}`
      }
    } else if (typeof value === 'function') {
      return value.toString()
    } else {
      return typeof value
    }
  }

  const objectContent = dfs(object)

  return `
  declare const ${variableName}: ${objectContent}}
  `
}

export const generateDefForModule = (script: string, variableName: string): void => {}
