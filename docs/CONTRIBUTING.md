## Setup

1. Install [yarn](https://yarnpkg.com/en/).
2. Install [jq](https://stedolan.github.io/jq/).
2. `yarn install`

## Test

Unit tests: `yarn test`

Test in Chrome:

1. `yarn dev`
2. Follow the instructions starting at “Open the Extension Management page” in
   the [Chrome Extension Getting Started
   Tutorial](https://developer.chrome.com/extensions/getstarted#manifest).
   Install the unpacked extension from `./build`.

Use Python to run a local HTTP server, and open the `./example/sampler.html`
sampler in the default browser: `yarn sampler`.

This leaves the Python server running. Run `lsof -i :8000` to find the PID and
`kill` it.

## Build (Chrome)

`yarn build:chrome`

## Build (Firefox)

`yarn build:firefox`

This creates the following files in `dist`:

* sneetches_for_github-${version}.zip — extension package
* sources.zip — source code package

To verify that the Firefox extension is working, visit e.g
<https://github.com/bfred-it/Awesome-WebExtensions#libraries-and-frameworks> and
visually confirm that links are followed by star counts, for example
"webext-options-sync (30★)" instead of "webext-options-sync".

You may need to enter a GitHub Personal Access Token into the options panel, if
the extension has already used up its GitHub API request quota. The extension
doesn't currently visually indicate this state.
