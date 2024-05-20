import { ipcRenderer as electronIpcRenderer } from 'electron'

export const ipcRenderer = {
  send: (channel: string, data: unknown): void => {
    electronIpcRenderer.send(channel, data)
  },
  on: (channel: string, func: (...args: unknown[]) => void): void => {
    electronIpcRenderer.on(channel, (_event, ...args) => func(...args))
  },
  invoke: (channel: string, data: unknown): unknown => {
    return electronIpcRenderer.invoke(channel, data)
  }
}
