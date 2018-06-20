# Sneetches

A Chrome extension that adds stars to GitHub repo links.

## Settings

### Access Token

Sneetches uses the [GitHub API](https://developer.github.com/v3/) to retrieve
repository metadata.

Since Sneetches makes an API call for each GitHub repo it sees in any visited
page, it will quickly exceed the [60 request-per-hour rate limit](https://developer.github.com/v3/#rate-limiting) for unauthenticated requests.
When this happens, it will display an hourglass after the repo name, instead
of the repo summary statistics.

To increase the limit, create a [GitHub Personal Access
Token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) by following [this link](https://github.com/settings/tokens/new), and paste this token into the Sneetches options.

To allow Sneetches to add metadata to links to private repositories that you can
see, give this token "repo" scope. Otherwise, it doesn't need any scopes.

## License

MIT
