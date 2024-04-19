import { Tabs } from 'antd'

import EditorTern from './editor-tern'
import EditorTS from './editor-ts'

function App() {
  return (
    <Tabs
      items={[
        {
          key: 'tern',
          tabKey: 'tern',
          label: 'Tern',
          children: <EditorTern />,
        },
        {
          key: 'ts',
          tabKey: 'ts',
          label: 'TypeScript',
          children: <EditorTS />,
        },
      ]}
    ></Tabs>
  )

  // return <SimpleEditorTest />
  // return <RawEditor />
}

export default App
