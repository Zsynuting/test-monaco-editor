import type { Server, Def } from 'tern'
import tern from 'tern'
import { TernWorkerAction } from './const'

let server: Server

function startServer(plugins = {}, scripts?: string[]) {
  // eslint-disable-next-line no-restricted-globals
  if (scripts) self.importScripts.apply(null, scripts)

  server = new tern.Server({
    async: true,
    defs: [] as Def[],
    plugins: plugins,
  })
}

// eslint-disable-next-line no-restricted-globals
self.onmessage = function (e) {
  const data = e.data
  switch (data.type) {
    case TernWorkerAction.INIT:
      return startServer(data.plugins, data.scripts)
    case TernWorkerAction.REQUEST:
      return server.request(data.body, function (err, reqData) {
        postMessage({ id: data.id, body: reqData, err: err && String(err) })
      })
    case TernWorkerAction.DELETE_DEF:
      return server.deleteDefs(data.name)
    case TernWorkerAction.ADD_DEF:
      return server.addDefs(data.defs)
    default:
      throw new Error('Unknown message type: ' + data.type)
  }
}
