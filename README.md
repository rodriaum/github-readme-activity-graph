# GitHub Readme Activity Graph

A Next.js and React application that generates customizable GitHub contribution graphs as SVG images.

## Features

- GitHub user and organization activity graphs
- Eight graph types: default, playful, bar, mountain, neon, minimal, terminal and gradient
- Themes and custom colors
- Custom titles, dimensions, radius, grid and area options
- Date ranges up to 90 days
- SVG and JSON endpoints
- Responsive graph customizer
- Bounded GitHub API requests and request timeouts

## Requirements

- Node.js 20.9 or later
- pnpm
- A GitHub token with access to the GraphQL API

## Setup

Install dependencies:

```bash
pnpm install
```

Create an environment file:

```bash
cp .env.example .env.local
```

Set `TOKEN` to a GitHub personal access token. Keep this variable server-side and never prefix it with `NEXT_PUBLIC_`.

Start the development server:

```bash
pnpm dev
```

## Endpoints

### Graph image

```text
/graph?username=rodriaum
```

### Organization graph

```text
/graph?organization=StudioLoad
```

Organization graphs count commits from public repositories only. A request is limited to 20 repositories and 99 commits per repository for the selected date range.

### JSON data

```text
/data?username=rodriaum
```

### Customization

| Parameter | Description |
| --- | --- |
| `username` | GitHub username |
| `organization` | GitHub organization login |
| `theme` | Theme preset |
| `type` | Graph type |
| `days` | Number of days from 1 to 90 |
| `from`, `to` | Custom date range in YYYY-MM-DD format |
| `bg_color` | Background color |
| `border_color` | Border color |
| `color` | Label color |
| `title_color` | Title color |
| `line` | Line color |
| `point` | Point color |
| `area_color` | Area color |
| `area` | Show the area below the graph |
| `grid` | Show grid lines |
| `hide_border` | Hide the border |
| `hide_title` | Hide the title |
| `custom_title` | Custom graph title |
| `radius` | Card radius from 0 to 16 |
| `height` | Graph height from 200 to 600 |

Color parameters accept 3, 4, 6 or 8 hexadecimal digits without the leading hash.

Example:

```md
![GitHub activity graph](https://your-domain.com/graph?username=rodriaum&theme=dracula&type=mountain)
```

## Deployment

Deploy the project to Vercel and configure the `TOKEN` environment variable in the project settings. The token is read only by server routes.

The included in-memory rate limiter is a per-instance safeguard. Configure an edge-level rate limit or shared storage limiter for deployments that run multiple server instances.

## License

See [LICENSE](./LICENSE).
