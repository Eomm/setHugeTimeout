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


## License

Copyright [Manuel Spigolon](https://github.com/Eomm), Licensed under [MIT](./LICENSE).
