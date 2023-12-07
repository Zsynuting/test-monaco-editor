interface ISyncFunction {
  (...args: any[]): void
  data: any
}
interface IAsyncFunction {
  (...args: any[]): void
  loading: boolean
  data: any
  error: Error
}

const generateJSOFunctionDeclaration = (
  functionName: string,
  func: IAsyncFunction | ISyncFunction,
) => `
const ${functionName} = (...args) => {}
${functionName}.data = ${JSON.stringify(func.data)}
  `

const generateJSOAsyncFunctionDeclaration = (functionName: string, func: IAsyncFunction) => `
const ${functionName} = (...args) => {}
${functionName}.loading = false
${functionName}.data = ${JSON.stringify(func.data)}
${functionName}.error = ${JSON.stringify(func.error)}
`

export const generateJSORuntimeDeclaration = (object: Record<string, any>, variableName: string) => {
  const functionDeclarations: string[] = []
  const properties: string[] = []

  Object.entries(object).forEach(([key, value]) => {
    if (typeof value === 'function') {
      if ((value as any)[Symbol.toStringTag] === 'AsyncFunction') {
        functionDeclarations.push(generateJSOAsyncFunctionDeclaration(key, value))
      } else {
        functionDeclarations.push(generateJSOFunctionDeclaration(key, value))
      }
      properties.push(`  ${key}: ${key}`)
    } else {
      properties.push(`  ${key}: ${JSON.stringify(value)}`)
    }
  })

  const content = `
${functionDeclarations.join('')}
export const ${variableName} = {
${properties.join(',\n')}
}
`
  console.log('%c Line:32 🥝 content', 'color:#3f7cff', content)
  return content
}

export const generateObjectRuntimeDeclaration = (
  object: Record<string, any>,
  variableName: string,
) => `
export const ${variableName} = ${JSON.stringify(object, null, 2)}
`
