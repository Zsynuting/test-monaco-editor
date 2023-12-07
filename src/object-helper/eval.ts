export const evalModule = (script: string) => {
  const objString = script.replace('export default', '')
  return new Function(`return ${objString}`).call(null)
}
