import {
  barChartConfig,
  Interpolation,
  lineChartConfig,
  mapNodes,
  node,
  toScene,
} from "chartist"
import { renderToString } from "chartist/server"
import { getGraphStyle } from "./graph-styles"
import type { GraphStyle, InterpolationName } from "./graph-styles"
import type { ActivityData, GraphOptions } from "./types"

const SVG_WIDTH = 1200
const CHART_HORIZONTAL_PADDING = 120
const MIN_HEIGHT = 200
const MAX_HEIGHT = 600
const MAX_RADIUS = 16
const MAX_CONTRIBUTION_DAYS = 90
const DEFAULT_COLOR = "9e4c98"
const DEFAULT_POINT_COLOR = "403d3d"
const DEFAULT_BACKGROUND = "ffffff"
const DEFAULT_BORDER = "ffffff"

const HEX_COLOR_PATTERN =
  /^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

const INTERPOLATIONS: Record<InterpolationName, () => unknown> = {
  none: () => Interpolation.none(),
  simple: () => Interpolation.simple(),
  step: () => Interpolation.step(),
  cardinal: () => Interpolation.cardinal(),
  monotoneCubic: () => Interpolation.monotoneCubic(),
}

type Scene = ReturnType<typeof toScene>
type ChartistValue = number | { x?: number; y?: number } | undefined

interface Contribution {
  date: string
  count: number
}

/* Helpers */

const clampInt = (value: number, min: number, max: number): number =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, Math.trunc(value))) : min

const safeColor = (value: string | undefined, fallback: string): string =>
  value && HEX_COLOR_PATTERN.test(value) ? value : fallback

const hex = (color: string): string => `#${color}`

/** Replaces {{key}} / {key} placeholders. Unknown keys are left empty. */
const fill = (
  template: string,
  vars: Record<string, string | number>
): string =>
  template.replace(/\{\{?(\w+)\}?\}/g, (_, key: string) =>
    String(vars[key] ?? "")
  )

function escapeXml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function numericValue(value: ChartistValue): number {
  const candidate = typeof value === "object" ? (value.y ?? value.x) : value
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : 0
}

function normalizeContributions(data: ActivityData): Contribution[] {
  const days = data.contributions.slice(-MAX_CONTRIBUTION_DAYS).map((day) => ({
    date: String(day.date).slice(0, 10),
    count: Number.isFinite(day.contributionCount)
      ? Math.max(0, Math.trunc(day.contributionCount))
      : 0,
  }))

  return days.length > 0 ? days : [{ date: "", count: 0 }]
}

function resolveTitle(data: ActivityData, options: GraphOptions): string {
  if (options.hideTitle) return ""
  if (options.customTitle) return options.customTitle
  if (options.organization) {
    return `${options.organization}'s Organization Activity Graph`
  }
  return `${data.name || options.username}'s Contribution Graph`
}

/* Theme */

function resolveTheme(options: GraphOptions, style: GraphStyle) {
  const c = options.colors

  return {
    label: safeColor(c.color, DEFAULT_COLOR),
    line: safeColor(c.lineColor, DEFAULT_COLOR),
    point: safeColor(style.points.color ?? c.pointColor, DEFAULT_POINT_COLOR),
    area: safeColor(c.areaColor, DEFAULT_COLOR),
    title: safeColor(c.titleColor, DEFAULT_COLOR),
    background: safeColor(c.bgColor, DEFAULT_BACKGROUND),
    border: safeColor(c.borderColor, DEFAULT_BORDER),
    radius: clampInt(options.radius, 0, MAX_RADIUS),
    showArea: options.area,
    showGrid: options.grid,
    showPoint: options.showPoint,
  }
}
type Theme = ReturnType<typeof resolveTheme>

/* CSS */

function createChartCss(
  style: GraphStyle,
  theme: Theme,
  barWidth: number
): string {
  const { animation, line, points, area, grid, fontFamily } = style
  const areaFill =
    area.fill === "gradient" ? "url(#activity-area-gradient)" : hex(theme.area)

  const rule = (selector: string, declarations: string[]): string =>
    `${selector} {\n${declarations.map((declaration) => `  ${declaration};`).join("\n")}\n}`

  const rules = [
    rule("svg", [`overflow: hidden`, `font-family: ${fontFamily}`]),
    rule(".ct-label", [
      `fill: ${hex(theme.label)}`,
      `color: ${hex(theme.label)}`,
      `font-size: 11px`,
      `font-family: ${fontFamily}`,
    ]),
    rule(".ct-grid", [
      `stroke: ${hex(theme.label)}`,
      `stroke-opacity: ${theme.showGrid && grid.enabled ? grid.opacity : 0}`,
      `stroke-dasharray: ${grid.dashArray}`,
    ]),
    rule(".ct-line", [
      `fill: none`,
      `stroke: ${hex(theme.line)}`,
      `stroke-width: ${line.width}`,
      `stroke-linecap: round`,
      `stroke-linejoin: round`,
    ]),
    line.dashArray && rule(".ct-line", [`stroke-dasharray: ${line.dashArray}`]),
    line.glow &&
      rule(".ct-line", [
        `filter: drop-shadow(0 0 ${line.glow}px ${hex(theme.line)})`,
      ]),
    rule(".ct-point", [
      `stroke: ${hex(theme.point)}`,
      `stroke-width: ${points.width}`,
      `stroke-linecap: round`,
      `display: ${theme.showPoint ? "initial" : "none"}`,
    ]),
    points.alternateColor &&
      rule(".ct-point.graph-point-active:nth-of-type(2n)", [
        `stroke: ${hex(theme.area)}`,
      ]),
    rule(".ct-area", [
      `fill: ${areaFill}`,
      `fill-opacity: ${area.opacity}`,
      `display: ${theme.showArea ? "initial" : "none"}`,
    ]),
    rule(".ct-bar", [
      `stroke: ${hex(theme.point)}`,
      `stroke-width: ${barWidth}`,
      `stroke-linecap: butt`,
    ]),
    rule(".ct-point.graph-point-empty, .ct-bar.graph-point-empty", [
      `opacity: ${style.inactiveOpacity}`,
    ]),
    rule(".graph-title", [`font-family: ${fontFamily}`]),
  ]

  if (animation.enabled) {
    const len = animation.lineDashLength
    const isBarChart = style.chart === "bar"

    rules.push(
      !isBarChart &&
        !line.dashArray &&
        rule(".ct-line", [
          `stroke-dasharray: ${len}`,
          `stroke-dashoffset: ${len}`,
          `animation: activity-line-draw ${animation.lineDuration}ms ease-in-out forwards`,
        ]),
      isBarChart &&
        rule(".ct-bar", [
          "stroke-dasharray: 1000",
          "stroke-dashoffset: 1000",
          `animation: ct-draw ${animation.lineDuration}ms ease-in-out forwards`,
        ]),
      !isBarChart &&
        theme.showPoint &&
        rule(".ct-point", [
          `animation: activity-mark-appear ${animation.markDuration}ms ease-out both`,
        ]),
      `@keyframes activity-line-draw {
  to {
    stroke-dashoffset: 0;
  }
}`,
      `@keyframes ct-draw {
  to {
    stroke-dashoffset: 0;
  }
}`,
      `@keyframes activity-mark-appear {
  from {
    opacity: 0.15;
  }

  to {
    opacity: 1;
  }
}`,
      `@media (prefers-reduced-motion: reduce) {
  .ct-line,
  .ct-point,
  .ct-bar {
    animation: none;
    opacity: 1;
    stroke-dashoffset: 0;
  }
}`
    )
  }

  if (style.css) {
    rules.push(
      fill(style.css, {
        line: theme.line,
        point: theme.point,
        area: theme.area,
        label: theme.label,
        background: theme.background,
      })
    )
  }

  return rules.filter(Boolean).join("\n")
}

/* Decoration */

function addAreaGradient(scene: Scene, style: GraphStyle, theme: Theme): Scene {
  if (style.area.fill !== "gradient" || !theme.showArea) return scene

  const stop = (offset: string, color: string, opacity: number) =>
    node("stop", {
      offset,
      "stop-color": hex(color),
      "stop-opacity": opacity,
    })

  const gradient = node("linearGradient", {
    id: "activity-area-gradient",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%",
  })
    .append(stop("0%", theme.line, style.area.gradient.from))
    .append(stop("100%", theme.area, style.area.gradient.to))

  return scene.append(node("defs").append(gradient), true)
}

function decorateScene(
  initialScene: Scene,
  title: string,
  style: GraphStyle,
  theme: Theme,
  height: number,
  barWidth: number
) {
  const label = title || "GitHub activity graph"

  const background = node(
    "rect",
    {
      x: 0,
      y: 0,
      width: SVG_WIDTH,
      height,
      rx: theme.radius,
      fill: hex(theme.background),
    },
    "graph-background"
  )

  const border = node(
    "rect",
    {
      x: 0.5,
      y: 0.5,
      width: SVG_WIDTH - 1,
      height: height - 1,
      rx: theme.radius,
      fill: "none",
      stroke: hex(theme.border),
      "stroke-width": 1,
    },
    "graph-border"
  )

  let scene = addAreaGradient(initialScene, style, theme)
    .append(background, true)
    .append(node("title").text(label), true)

  if (title) {
    scene = scene.append(
      node(
        "text",
        {
          x: SVG_WIDTH / 2,
          y: style.title.y,
          "text-anchor": "middle",
          fill: hex(theme.title),
          "font-size": style.title.fontSize,
          "font-weight": style.title.fontWeight,
        },
        "graph-title"
      ).text(title)
    )
  }

  return scene
    .append(border)
    .append(node("style").text(createChartCss(style, theme, barWidth)))
    .attr({
      width: SVG_WIDTH,
      height,
      viewBox: `0 0 ${SVG_WIDTH} ${height}`,
      role: "img",
      "aria-label": label,
    })
}

/* Chart Config */

function buildChartConfig(
  style: GraphStyle,
  theme: Theme,
  contributions: Contribution[],
  hasTitle: boolean,
  height: number
) {
  const labels = contributions.map((d) => d.date)
  const values = contributions.map((d) => d.count)
  const maxValue = Math.max(1, ...values)
  const labelStep = Math.max(
    1,
    Math.ceil(labels.length / style.axisX.maxLabels)
  )
  const lastIndex = labels.length - 1

  const data = { labels, series: [{ name: "contributions", data: values }] }

  const base = {
    width: SVG_WIDTH,
    height,
    chartPadding: {
      ...style.padding,
      top: hasTitle ? style.title.topPadding : style.padding.top,
    },
    axisX: {
      offset: style.axisX.offset,
      showLabel: true,
      showGrid: false,
      labelTransform: (value: string | number | Date, index: number) =>
        index % labelStep === 0 || index === lastIndex ? String(value) : null,
    },
    axisY: {
      offset: style.axisY.offset,
      showLabel: style.axisY.showLabels,
      showGrid: theme.showGrid && style.grid.enabled,
      low: 0,
      high: maxValue * style.axisY.headroom,
      onlyInteger: true,
      scaleMinSpace: style.axisY.scaleMinSpace,
    },
  }

  if (style.chart === "bar") {
    return barChartConfig(data, { ...base, seriesBarDistance: 0 })
  }

  return lineChartConfig(data, {
    ...base,
    fullWidth: true,
    showLine: true,
    showPoint: theme.showPoint,
    showArea: theme.showArea,
    areaBase: 0,
    lineSmooth: INTERPOLATIONS[style.line.interpolation]() as never,
  })
}

function shouldKeepPoint(
  style: GraphStyle,
  index: number,
  count: number
): boolean {
  switch (style.points.mode) {
    case "none":
      return false
    case "every-nth":
      return index % Math.max(1, style.points.every ?? 3) === 0
    case "positive":
      return count > 0
    default:
      return true
  }
}

function getBarWidth(style: GraphStyle, contributionCount: number): number {
  const availableWidth =
    (SVG_WIDTH - CHART_HORIZONTAL_PADDING) / contributionCount

  return Math.max(
    style.bar.minWidth,
    Math.min(style.bar.maxWidth, availableWidth * style.bar.widthRatio)
  )
}

/* Public */

export function renderActivityGraph(data: ActivityData, options: GraphOptions) {
  const style = getGraphStyle(options.type)
  const theme = resolveTheme(options, style)
  const height = clampInt(options.height, MIN_HEIGHT, MAX_HEIGHT)
  const contributions = normalizeContributions(data)
  const title = resolveTitle(data, options)
  const barWidth = getBarWidth(style, contributions.length)

  const rawScene = toScene(
    buildChartConfig(style, theme, contributions, Boolean(title), height),
    { width: SVG_WIDTH, height, labels: "svg" }
  )

  const filteredScene = mapNodes(rawScene, (current) => {
    if (current.role !== "point" && current.role !== "bar") return undefined

    const count = numericValue(current.ctx.value)
    const index = current.ctx.valueIndex

    if (current.role === "point" && !shouldKeepPoint(style, index, count)) {
      return null
    }

    const marked = current.addClass(
      count > 0 ? "graph-point-active" : "graph-point-empty"
    )

    if (!style.tooltip) return marked

    const date = contributions[index]?.date ?? ""
    return marked.append(
      node("title").text(
        fill(style.tooltip, { count, date, s: count === 1 ? "" : "s" })
      )
    )
  })

  return renderToString(
    decorateScene(
      filteredScene ?? rawScene,
      title,
      style,
      theme,
      height,
      barWidth
    )
  )
}

export function invalidGraph(message: string, options: GraphOptions) {
  const width = SVG_WIDTH
  const height = clampInt(options.height, MIN_HEIGHT, MAX_HEIGHT)
  const cx = width / 2
  const cy = height / 2

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"
         viewBox="0 0 ${width} ${height}" fill="none" role="img"
         aria-label="Unable to display graph">
      <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="8"
            fill="#09090b" stroke="#27272a"/>
      <circle cx="${cx}" cy="${cy - 30}" r="24" fill="#27272a"/>
      <path d="M${cx} ${cy - 42}V${cy - 29}M${cx} ${cy - 21}V${cy - 20}"
            stroke="#a1a1aa" stroke-width="2" stroke-linecap="round"/>
      <text x="${cx}" y="${cy + 22}" fill="#fafafa"
            font-family="Inter, Arial, sans-serif" font-size="16"
            font-weight="600" text-anchor="middle">Unable to display graph</text>
      <text x="${cx}" y="${cy + 46}" fill="#a1a1aa"
            font-family="Inter, Arial, sans-serif" font-size="13"
            text-anchor="middle">${escapeXml(message)}</text>
    </svg>
  `
}
