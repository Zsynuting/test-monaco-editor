import { Def } from 'tern'
import { TernWorkerAction } from './const'

type ICallback = (err: string, body: any) => any

let msgId = 0
let pending: { [x: number]: ICallback } = {}

const ternWorker = new Worker(new URL('./tern.worker.ts', import.meta.url), {
  name: 'TernWorker',
  type: 'module',
})

function send(data: any, callback?: ICallback) {
  if (callback) {
    data.id = ++msgId
    pending[msgId] = callback
  }
  ternWorker.postMessage(data)
}

ternWorker.onmessage = function (e) {
  const data = e.data
  if (data) {
    if (data.id && pending[data.id]) {
      pending[data.id](data.err, data.body)
      delete pending[data.id]
    }
  }
}

send({
  type: TernWorkerAction.INIT,
  plugins: {},
  scripts: {},
})

const ternService = {
  request: (body: any, callback: ICallback) => {
    send({ type: TernWorkerAction.REQUEST, body }, callback)
  },
  addDefs: function (defs: Def) {
    send({ type: TernWorkerAction.ADD_DEF, defs })
  },
  deleteDefs: function (name: string) {
    send({ type: TernWorkerAction.DELETE_DEF, name })
  },
}

export default ternService
