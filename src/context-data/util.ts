export const generateJSORuntimeDeclaration = (
  object: Record<string, any>,
  variableName: string,
) => {
  const properties: string[] = []

  Object.entries(object).forEach(([key, value]) => {
    if (typeof value === 'function') {
      properties.push(`  ${key}: {
  data: ${JSON.stringify(value.data)}
}`)
    } else {
      properties.push(`  ${key}: ${JSON.stringify(value)}`)
    }
  })

  const content = `{
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
const ${variableName} = ${JSON.stringify(object, null, 2)}
`
