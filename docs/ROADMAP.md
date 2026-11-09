# Roadmap

This file is just a general plan of what each version will introduce.

## v0.1: Starting Grounds

The v0.1 version should only ship some MVP features:

- Simple contribution graph rendering using a Cloudflare Worker.
- Forward-planned adapter architecture for contribution sources.
- Concrete adapters for @nikooozzz main platforms:
  - GitHub
  - GitLab
  - AUR
  - Gitea
- Simple filters for the output:
  - Source filter
  - Source-level username specification
- Caching for faster responses

## v0.2: Feature Depth

- Themes
- Time range filters
- More adapters (Gitea shortcuts, Codeberg, Bitbucket)
- Stats endpoint

## v0.3: Data Focused

- `/stats.json` data endpoint
- `/?interactive` parameter for interactive HTML responses
- PNG output
- Documentation site

## v0.4: Adding Users

- GitHub/GitLab OAuth
- D1 with linked accounts
- Saved profiles

