# @eomm/set-huge-timeout

[`setTimeout`](https://devdocs.io/dom/settimeout#reasons_for_delays_longer_than_specified) handles
delay as a 32-bit signed integer. This causes an integer overflow when using delays larger
than 2,147,483,647 ms (about 24.8 days), resulting in the timeout being executed immediately.

This package bypass this limit using a recursive `setTimeout` call hiding the complexity!

## Install

```
npm install @eomm/set-huge-timeout
```

## Usage

Use it as a normal `setTimeout` call, but without caring about the limit!

Note that the returned value is an object instead of a `Timeout` object.

The object has two properties:

- `timeout`: This is the reference to the timeout, so you can clear it using `clearTimeout`
- `emitter`: This is an `EventEmitter` that emits some utility events:
  - `reschedule`: Emitted when the timeout is rescheduled

Keep in mind that the `timeout` property is updated at every internal reschedule, so you can
clear the timeout at any time only if you read the `timeoutReference.timeout` property, otherwise
you may read an old reference.

```js
const { setHugeTimeout } = require('@eomm/set-huge-timeout')

const oneYear = 31_536_000_000

const timeoutReference = setHugeTimeout((message) => {
  console.log(message)
}, oneYear, 'Hello, world!')

timeoutReference.emitter.on('reschedule', (timeLeft) => {
  console.log(`Rescheduled to ${timeLeft}`)
})

// Clear the timeout
clearTimeout(timeoutReference.timeout)
```

### Test mode

This module has a test mode that allows to ease the testing of huge timeouts.

Here is an example using [Sinon Fake Timers](https://sinonjs.org/releases/latest/fake-timers/):

```js
const FakeTimers = require('@sinonjs/fake-timers')
const HugeTimeout = require('@eomm/set-huge-timeout')

const { setHugeTimeout } = HugeTimeout

const clock = FakeTimers.createClock()

// Overwrite the internal setTimeout with the fake one.
// All the huge timeouts will be handled by the fake clock
// after this call.
hugeTimeout.test.overwriteSetTimeout(clock.setTimeout)

const waitMs = 2_147_483_999

// This timeout will be handled by the fake clock
setHugeTimeout(() => {
  console.log('Timeout!')
}, waitMs)

// Move the clock forward
clock.tick(waitMs) // Output: Timeout!

// Restore the original setTimeout when it's not needed anymore
hugeTimeout.test.restore()
```


## License

Copyright [Manuel Spigolon](https://github.com/Eomm), Licensed under [MIT](./LICENSE).
