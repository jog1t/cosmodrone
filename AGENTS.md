# AGENTS

Project working agreement for code changes.

## Formatting

- Run `oxfmt` after finishing work before wrapping up.
- If server files changed, run `pnpm --filter server exec oxfmt src`.

## Validation

- After formatting, run the relevant tests, build, and lint checks for the area you changed.

## Git

- Do not commit unrelated untracked files.
