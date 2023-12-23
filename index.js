'use strict'

const MAX_TIMEOUT = 0x7FFFFFFF // 2147483647

function setHugeTimeout () {
  // 0: function
  // 1: delay
  // 2: ...args

  const delay = arguments[1]
  const dynamicId = this || Object.create(null, { timeout: { value: null, writable: true } })

  if (delay <= MAX_TIMEOUT) {
    dynamicId.timeout = global.setTimeout.apply(null, arguments)
  } else {
    dynamicId.timeout = global.setTimeout(() => {
      arguments[1] = delay - MAX_TIMEOUT
      setHugeTimeout.apply(dynamicId, arguments)
    }, MAX_TIMEOUT)
  }

  return dynamicId
}

module.exports = {
  MAX_TIMEOUT,
  setHugeTimeout
}
