'use strict'

const { test, beforeEach, afterEach } = require('tap')
const FakeTimers = require('@sinonjs/fake-timers')
const hugeTimeout = require('../index.js')
const { setHugeTimeout, MAX_TIMEOUT } = hugeTimeout

const clock = FakeTimers.createClock()

beforeEach(() => {
  hugeTimeout.test.overwriteSetTimeout(clock.setTimeout)
})

afterEach(() => {
  hugeTimeout.test.restore()
})

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

test('triggers the onReschedule callback', t => {
  t.plan(13)

  const ref = setHugeTimeout(() => {
    t.pass('should execute')
  }, MAX_TIMEOUT + MAX_TIMEOUT + 500)

  let emitterCount = 0
  ref.emitter.on('reschedule', delay => {
    t.ok(delay > 0, `delay is defined: ${delay}`)
    emitterCount++
  })

  let oldRef = ref.timeout
  t.ok(ref.timeout, 'timeout is defined')
  t.equal(emitterCount, 0, 'emitter has not been triggered')

  clock.tick(400)
  t.ok(oldRef === ref.timeout, 'timeout is the same')
  t.equal(emitterCount, 0, 'emitter has not been triggered')

  clock.tick(MAX_TIMEOUT)
  t.notOk(oldRef === ref.timeout, 'timeout is updated - first time')
  t.equal(emitterCount, 1, 'emitter has been triggered')
  oldRef = ref.timeout

  ref.emitter.on('reschedule', () => {
    t.pass('can add multiple listeners')
  })

  clock.tick(MAX_TIMEOUT)
  t.notOk(oldRef === ref.timeout, 'timeout is updated - second time')
  t.equal(emitterCount, 2, 'emitter has been triggered twice')

  clock.tick(MAX_TIMEOUT)
  t.equal(emitterCount, 2, 'emitter has not been triggered again')
})

test('onReschedule clearTimeout', t => {
  t.plan(1)

  const ref = setHugeTimeout(() => {
    t.fail('should not execute')
  }, MAX_TIMEOUT + 1)

  ref.emitter.on('reschedule', () => {
    t.pass('should emit')
    clock.clearTimeout(ref.timeout)
  })

  clock.tick(MAX_TIMEOUT + 1)
})
