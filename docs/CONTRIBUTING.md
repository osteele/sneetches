## Setup

1. Install yarn.
2. `yarn install`

## Testing

Unit tests: `yarn test`

Test in the browser:

1. `yarn dev`
2. Follow the instructions starting at “Open the Extension Management page” in
   the [Chrome Extension Getting Started
   Tutorial](https://developer.chrome.com/extensions/getstarted#manifest).
   Install the unpacked extension from `./build`.

Use Python to run a local HTTP server, and open the `./example/sampler.html`
sampler in the default browser: `yarn sampler`.

This leaves the Python server running. Run `lsof -i :8000` to find the PID and
`kill` it.
