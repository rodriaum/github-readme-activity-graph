<p align="center">
    <img src="public/logo.png" width="384" alt="Activity Graph logo">
</p>

<h1 align="center">GITHUB README ACTIVITY GRAPH</h1>

> [!NOTE]
> This project is being moved to a new version based on **Next.js**.

### DEPLOYMENT

The deployment is `github-act-graph.rodriaum.com`.

Please refer to the updated link [here](#how-to-use)

## Table of contents

- [Table of contents](#table-of-contents)
- [How to Use](#how-to-use)
    - [Attention ⚠](#attention-)
    - [Organization Activity Graph](#organization-activity-graph)
    - [Optional Private Activity](#optional-private-activity)
- [Use themes](#use-themes)
- [Available Themes](#available-themes)
- [Graph Types](#graph-types)
- [Customization](#customization)
    - [Common Options](#common-options)
- [Shadcn Style](#shadcn-template)
- [Contributing](#contributing)
- [Core Team 💻](#core-team-)
- [Star History](#star-history)
    - [Made with ❤ and TypeScript ](#made-with--and-typescript-)

## How to Use

Just paste the following URL in your profile readme and you are good to go.

**Pass your `username` in the URL**

```md
[![rodriaum's github activity graph](https://github-act-graph.rodriaum.com/graph?username=rodriaum)](https://github.com/rodriaum/github-readme-activity-graph)
```

### [Attention ⚠](#deploy-on-your-own-vercel-instance)

### Organization Activity Graph

You can also generate an activity graph for a GitHub organization. Use the `organization` parameter with the organization's GitHub login:

```md
[![StudioLoad organization activity graph](https://github-act-graph.rodriaum.com/graph?organization=StudioLoad)](https://github.com/StudioLoad)
```

The organization graph counts commits across the organization's **public repositories only**. It does not include private repositories and does not require access to them. Anyone can embed the graph in a README by replacing `StudioLoad` with the organization's login.

You can use the existing graph customization parameters, such as `theme`, `days`, and `custom_title`, with the `organization` parameter as well.

## Optional Private Activity

Public activity is displayed by default without requiring users to log in.

To include private contributions, users must first enable **Show private contributions on my profile** in their GitHub settings:

1. Open **GitHub → Settings → Profile**.
2. Scroll down to **Contributions & activity**.
3. Enable **Show private contributions on my profile**.

This allows private contributions to appear in the user's profile contribution graph as aggregated counts, without revealing private repository names or details.

## Use themes

_`username=rodriaum&theme=theme_name`_

```md
[![rodriaum's github activity graph](https://github-act-graph.rodriaum.com/graph?username=rodriaum&theme=dracula)](https://github.com/rodriaum/github-readme-activity-graph)
```

[Manual Customization](#customization) is also available

## Available Themes

|            Name            |                             Preview                             |
| :------------------------: |:---------------------------------------------------------------:|
| **Default (cotton candy)** | <img src="./public/themes/default.svg" height=250 alt="graph"/> |
|         **react**          |     <img src="./public/themes/react.png" height=250 alt="graph"/>      |
|       **react-dark**       |   <img src="./public/themes/react-dark.svg" height=250 alt="graph"/>   |
|         **github**         |     <img src="./public/themes/github.svg" height=250 alt="graph"/>     |
|      **shadcn-white**      |  <img src="./public/themes/shadcn-white.png" height=250 alt="graph"/>  |
|       **shadcn-dark**      |  <img src="./public/themes/shadcn-dark.png" height=250 alt="graph"/>   |
|     **github-compact**     | <img src="./public/themes/github-compact.svg" height=250 alt="graph"/> |
|         **xcode**          |     <img src="./public/themes/xcode.svg" height=250 alt="graph"/>      |
|         **rogue**          |     <img src="./public/themes/rogue.svg" height=250 alt="graph"/>      |
|         **merko**          |     <img src="./public/themes/merko.png" height=250 alt="graph"/>      |
|          **vue**           |      <img src="./public/themes/vue.png" height=250 alt="graph"/>       |
|      **tokyo-night**       |  <img src="./public/themes/tokyo-night.png" height=250 alt="graph"/>   |
|     **high-contrast**      | <img src="./public/themes/high-contrast.png" height=250 alt="graph"/>  |

For more themes click [here](https://github.com/rodriaum/github-readme-activity-graph/blob/main/THEMES.md)

## Graph Types

Choose the graph style independently from the theme:

|            Type              |                               Preview                                |
| :--------------------------: | :------------------------------------------------------------------: |
|          **default**         | <img src="./public/types/default.svg" height=250 alt="graph"/>        |
|            **bar**           | <img src="./public/types/bar.svg" height=250 alt="graph"/>            |
|            **neon**          | <img src="./public/types/neon.svg" height=250 alt="graph"/>           |
|          **minimal**         | <img src="./public/types/minimal.svg" height=250 alt="graph"/>        |
|          **terminal**        | <img src="./public/types/default.svg" height=250 alt="graph"/>       |
|          **gradient**        | <img src="./public/types/gradient.svg" height=250 alt="graph"/>       |

## Customization

Personalize your GitHub activity graph using the [online customizer](https://github-act-graph.rodriaum.com/). Adjust its appearance and generate a graph URL ready to use in your profile README.

![Customization interface preview](./public/customizer-preview.png)

You can also configure the graph manually using URL parameters.

Examples:

```md
https://github-act-graph.rodriaum.com/graph?username=rodriaum&type=bar&theme=dracula
https://github-act-graph.rodriaum.com/graph?username=rodriaum&type=gradient&theme=github-dark
```


```md
[![rodriaum's GitHub activity graph](https://github-act-graph.rodriaum.com/graph?username=rodriaum&theme=dracula)](https://github.com/rodriaum/github-readme-activity-graph)
```

#### Common Options

|   Arguments    |                  Description                  |                 Type of Value                  |
| :------------: | :-------------------------------------------: | :--------------------------------------------: |
|   `bg_color`   |            card's background color            |             hex code (without `#`)             |
| `border_color` |              card's border color              |             hex code (without `#`)             |
|    `color`     |            graph card's text color            |             hex code (without `#`)             |
| `title_color`  |           graph card's title color            |             hex code (without `#`)             |
|     `line`     |              graph's line color               |             hex code (without `#`)             |
|    `point`     |         color of points on line graph         |             hex code (without `#`)             |
|  `area_color`  |       color of the area under the graph       |             hex code (without `#`)             |
|     `area`     |          shows area under the graph           |           boolean (default: `false`)           |
| `hide_border`  |   makes the border of the graph transparent   |           boolean (default: `false`)           |
|  `hide_title`  |       sets the title to an empty string       |           boolean (default: `false`)           |
| `custom_title` |          set the title to any string          |                     string                     |
|    `theme`     | name of [available themes](#available-themes) |                     string                     |
|    `radius`    |            border radius of graph             |            number (0-16 inclusive)             |
|    `height`    |              height of the graph              |           number (200-600 inclusive)           |
|     `days`     |      number of to days display on graph       | number between (1 - 90) [Recommended below 40] |
|     `from`     |       date from which the graph starts        |              format `YYYY-MM-DD`               |
|      `to`      |         date where the graph will end         |              format `YYYY-MM-DD`               |
|     `type`     | name of [graph types](#graph-types)           |                     string                     |
|     `grid`     |                   show grid                   |           boolean (default: `true`)            |

⚠ **For `custom_title` please make sure that you are using %20 for spaces**

Example:

**`custom_title=This%20is%20a%20title`**

```md
[![rodriaum's github activity graph](https://github-act-graph.rodriaum.com/graph?username=rodriaum&custom_title=This%20is%20a%20title&hide_border=true)](https://github.com/rodriaum/github-readme-activity-graph)
```

**Example:**

```md
[![rodriaum's github activity graph](https://github-act-graph.rodriaum.com/graph?username=rodriaum&bg_color=fffff0&color=708090&line=24292e&point=24292e&area=true&border_color=ff0000)](https://github.com/rodriaum/github-readme-activity-graph)
```

## Shadcn Template

This project use the template [b5JgwDAjy](https://ui.shadcn.com/create?preset=b5JgwDAjy) with the style **Maia**.

## Contributing

Please read through our [contributing guidelines](https://github.com/rodriaum/github-readme-activity-graph/blob/main/CONTRIBUTING.md). Directions are included for opening issues, coding standards, and notes on development.

## Core Team 💻

<table>
    <tr>
        <td align="center">
        <a href="https://github.com/rodriaum">
            <img src="https://avatars.githubusercontent.com/u/119365213?v=4" width="100px;" alt=""/>
            <br />
            <sub><b>rodriaum</b></sub>
        </a>
        <br />
        <a href="#projectManagement" title="Project Management">📆</a>
        <a href="https://github.com/rodriaum/github-readme-activity-graph/commits?author=rodriaum" title="Code">💻</a>
        <a href="#documentation" title="Documentation">📖</a>
        <a href="#ideas" title="Ideas & Planning">🤔</a>
        <a href="#testing" title="Testing">⚠</a>
    </td>
    </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

## Star History

<table>
  <tr>
    <td>
      <a href="https://star-history.com/#rodriaum/github-readme-activity-graph&Timeline">
        <img src="https://api.star-history.com/svg?repos=rodriaum/github-readme-activity-graph&type=Timeline" width="800">
      </a>
    </td>
  </tr>
</table>

### Made with ❤ and TypeScript <img src="https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-icon.svg" width="25">
