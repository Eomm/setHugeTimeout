'use strict'

const { EventEmitter } = require('node:events')

const MAX_TIMEOUT = 0x7FFFFFFF // 2147483647

const globalTimeout = global.setTimeout
let localTimeout = global.setTimeout

function setHugeTimeout () {
  // 0: function
  // 1: delay
  // 2: ...args

  const delay = arguments[1]
  const dynamicId = this || Object.create(null, {
    timeout: { value: null, writable: true },
    emitter: { value: new EventEmitter(), writable: true }
  })

  if (delay <= MAX_TIMEOUT) {
    dynamicId.timeout = localTimeout.apply(null, arguments)
  } else {
    dynamicId.timeout = localTimeout(() => {
      arguments[1] = delay - MAX_TIMEOUT
      setHugeTimeout.apply(dynamicId, arguments)
      dynamicId.emitter.emit('reschedule', arguments[1])
    }, MAX_TIMEOUT)
  }

  return dynamicId
}

module.exports = {
  __proto__: null,
  MAX_TIMEOUT,
  setHugeTimeout,

  test: {
    overwriteSetTimeout (setTimeoutFn) {
      localTimeout = setTimeoutFn
    },
    restore () {
      localTimeout = globalTimeout
    }
  }
}
