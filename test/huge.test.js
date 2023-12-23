'use strict'

const { test, teardown } = require('tap')
const FakeTimers = require('@sinonjs/fake-timers')
const { setHugeTimeout, MAX_TIMEOUT } = require('../index.js')

const clock = FakeTimers.install()

test('can set MAX_TIMEOUT timeout', t => {
  t.plan(1)

  setHugeTimeout(() => {
    t.pass('executed callback')
  }, MAX_TIMEOUT + 1)

  clock.tick(MAX_TIMEOUT + 1)
})

test('keeps the arguments', t => {
  t.plan(1)

  setHugeTimeout((a, b, c) => {
    t.same([a, b, c], ['a', 'b', 'c'], 'arguments are passed')
  }, MAX_TIMEOUT + 1, 'a', 'b', 'c')

  clock.tick(MAX_TIMEOUT + 1)
})

test('works with clearTimeout', t => {
  t.plan(1)

  const { timeout } = setHugeTimeout(() => {
    t.fail('should not execute')
  }, MAX_TIMEOUT + 100)

  setHugeTimeout(() => {
    t.pass('should execute')
  }, MAX_TIMEOUT + 500)

  clock.clearTimeout(timeout)
  clock.tick(MAX_TIMEOUT + 500)
})

test('updates the timeout reference', t => {
  t.plan(5)

  const ref = setHugeTimeout(() => {
    t.pass('should execute')
  }, MAX_TIMEOUT + MAX_TIMEOUT + 500)
  let oldRef = ref.timeout
  t.ok(ref.timeout, 'timeout is defined')

  clock.tick(400)
  t.ok(oldRef === ref.timeout, 'timeout is the same')

  clock.tick(MAX_TIMEOUT)
  t.notOk(oldRef === ref.timeout, 'timeout is updated - first time')
  oldRef = ref.timeout

  clock.tick(MAX_TIMEOUT)
  t.notOk(oldRef === ref.timeout, 'timeout is updated - second time')

  clock.tick(MAX_TIMEOUT)
})

teardown(() => {
  clock.uninstall()
})
