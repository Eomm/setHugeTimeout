'use strict'

const { test } = require('tap')
const { setHugeTimeout } = require('../index.js')

test('works as setTimeout', t => {
  t.plan(2)

  const start = Date.now()
  setHugeTimeout(() => {
    t.pass('executed callback')
    t.ok(Date.now() - start >= 100, 'delay is respected')
  }, 100)
})

test('works as setTimeout with arguments', t => {
  t.plan(1)

  setHugeTimeout((a, b, c) => {
    t.same([a, b, c], ['a', 'b', 'c'], 'arguments are passed')
  }, 100, 'a', 'b', 'c')
})

test('works as setTimeout with clearTimeout', t => {
  t.plan(2)

  const { timeout } = setHugeTimeout(() => {
    t.fail('should not execute')
  }, 100)

  setTimeout(() => {
    clearTimeout(timeout)
    t.pass('cleared timeout')
  }, 50)

  setTimeout(() => {
    t.pass('did not execute the other timer')
  }, 200)
})
