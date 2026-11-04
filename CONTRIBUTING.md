# Contributing to GitHub Readme Activity Graph

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Before you contribute

Our aim is to **keep it simple** for developers to contribute to this project. The folder structure below provides an overview of the main directories and their responsibilities.

## How to contribute

1. Fork this repository to your GitHub account.
2. Clone your fork to your computer.
3. Add the original repository as an upstream remote and sync your local branch:

   ```bash
   git remote add upstream https://github.com/rodriaum/github-readme-activity-graph.git
   git pull upstream main
   ```

4. Create a branch for your changes:

   ```bash
   git checkout -b <your-branch-name>
   ```

5. [Generate a GitHub personal access token](https://github.com/settings/tokens) with the permissions required by the project.
6. Create a `.env` file in the project root and add your token:

   ```env
   TOKEN=<your_generated_token>
   ```

7. Install the dependencies and start the development server:

   ```bash
   pnpm install
   pnpm dev
   ```

   The application will be available at the local URL printed by the development server.

8. Take a screenshot of your finished work if your contribution changes the UI. Crop it so the relevant changes are easy to review.
9. Sync with upstream before committing your changes:

   ```bash
   git pull upstream main
   ```

10. If Git reports that your local changes would be overwritten by the merge, stash them first:

    ```bash
    git stash
    git pull upstream main
    git stash pop
    ```

    See the [Git stash guide](https://git-scm.com/docs/git-stash) for more information.

11. Commit and push your changes to your fork.
12. Open a pull request from your branch to the `main` branch of this repository.

### Folder Structure

The project is built with Next.js and TypeScript. Its main structure is:

```text
├── app
│   ├── data/                         # Application data
│   ├── graph/
│   │   └── route.ts                  # Graph image/API route
│   ├── favicon.ico                   # Application favicon
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── components
│   ├── ui/                           # Reusable UI components
│   ├── activity-graph-builder.tsx    # Activity graph customizer/builder
│   └── theme-provider.tsx            # Theme context provider
├── hooks
│   ├── use-highlighted-code.ts       # Code highlighting hook
│   └── use-mobile.ts                 # Mobile viewport hook
├── lib
│   ├── github.ts                     # GitHub API integration
│   ├── graph-options.ts              # Graph configuration options
│   ├── graph-styles.ts               # Graph styling definitions
│   ├── graph.ts                      # Graph generation logic
│   ├── highlighter.tsx               # Code highlighting utilities
│   ├── rate-limit.ts                 # Rate limiting utilities
│   ├── themes.ts                     # Graph themes
│   ├── types.ts                      # Shared TypeScript types
│   └── utils.ts                      # Shared utility functions
├── public
│   ├── themes/                       # Static theme assets
│   ├── types/                        # Static type-related assets
│   ├── customizer-preview.png        # Customizer preview image
│   └── logo.svg                      # Project logo
├── .env.example                      # Example environment variables
├── components.json                   # UI components configuration
├── next.config.ts                    # Next.js configuration
├── package.json                      # Scripts and dependencies
├── pnpm-lock.yaml                    # Locked dependency versions
├── pnpm-workspace.yaml               # pnpm workspace configuration
└── tsconfig.json                     # TypeScript configuration
```

## We use GitHub Flow, so all code changes happen through pull requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your contributions:

1. Fork the repository and create your branch from `main`.
2. Add tests when your changes introduce or modify behaviour that should be tested.
3. Update the documentation when your changes affect how the project is used.
4. Ensure the relevant checks pass.
5. Make sure your code follows the project's linting and formatting conventions.
6. Open your pull request.

## Any contributions you make will be under the MIT Software License

When you submit code changes, your contributions are understood to be licensed under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers this project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub Issues

We use GitHub Issues to track public bugs. Report a bug by [opening a new issue](../../issues).

## Write bug reports with detail, background, and sample code

**Great bug reports** tend to include:

- A quick summary and relevant background
- Steps to reproduce the issue, with specific details
- A minimal code sample when possible
- What you expected to happen
- What actually happened
- Any additional notes or troubleshooting steps

Thorough reports make it much easier to understand and resolve issues.

## Use a consistent coding style

Follow the existing coding style and conventions when adding or changing code. Keep changes focused and avoid unrelated structural changes.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
