import MonacoEditor, { Monaco } from '@monaco-editor/react'
import { useEffect, useRef, useState } from 'react'

const RawEditor = () => {
  const [value, setValue] = useState<string>('test')
  const valueRef = useRef<string>()

  valueRef.current = value

  // useEffect(() => {
  //   setInterval(() => {
  //     setValue(valueRef.current + '1')
  //   }, 1)
  // }, [])

  return (
    <MonacoEditor
      height="1000px"
      language="javascript"
      theme="vs-dark"
      value={value}
      onChange={(value) => setValue(value || '')}
    />
  )
}

export default RawEditor
