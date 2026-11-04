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
import type { ActivityData, GraphOptions } from "./types"

const SVG_WIDTH = 1200
const MAX_CONTRIBUTION_DAYS = 90
const HEX_COLOR_PATTERN =
  /^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

type ChartistValue = number | { x?: number; y?: number } | undefined

function escapeXml(value: unknown) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function safeColor(value: string, fallback: string) {
  return HEX_COLOR_PATTERN.test(value) ? value : fallback
}

function numericValue(value: ChartistValue) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0
  }

  if (!value) {
    return 0
  }

  const candidate = value.y ?? value.x

  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : 0
}

function normalizeContributions(data: ActivityData) {
  const contributions = data.contributions
    .slice(-MAX_CONTRIBUTION_DAYS)
    .map((day) => ({
      date: String(day.date).slice(0, 10),
      count: Number.isFinite(day.contributionCount)
        ? Math.max(0, Math.trunc(day.contributionCount))
        : 0,
    }))

  return contributions.length > 0 ? contributions : [{ date: "", count: 0 }]
}

function createChartCss(options: GraphOptions, barWidth: number) {
  const style = getGraphStyle(options.type)

  const labelColor = safeColor(options.colors.color, "9e4c98")

  const lineColor = safeColor(
    style.line.color ?? options.colors.lineColor,
    "9e4c98"
  )

  const pointColor = safeColor(
    style.points.color ?? options.colors.pointColor,
    "403d3d"
  )

  const areaColor = safeColor(options.colors.areaColor, "9e4c98")

  const areaFill =
    style.area.fill === "gradient"
      ? "url(#activity-area-gradient)"
      : "#" + areaColor

  const gridOpacity =
    options.grid && style.grid.enabled ? String(style.grid.opacity) : "0"

  const animationStyles = style.animation.enabled
    ? [
        style.line.dashArray
          ? ""
          : ".ct-line{stroke-dasharray:5000;stroke-dashoffset:5000;animation:activity-line-draw " +
            style.animation.lineDuration +
            "ms ease-in-out forwards;}",
        ".ct-point,.ct-bar{animation:activity-mark-appear " +
          style.animation.markDuration +
          "ms ease-out both;}",
        "@keyframes activity-line-draw{to{stroke-dashoffset:0;}}",
        "@keyframes activity-mark-appear{from{opacity:0.15;}to{opacity:1;}}",
        "@media(prefers-reduced-motion:reduce){.ct-line,.ct-point,.ct-bar{animation:none;opacity:1;stroke-dashoffset:0;}}",
      ]
    : []

  return [
    "svg{overflow:hidden;font-family:" + style.fontFamily + ";}",
    ".ct-label{fill:#" +
      labelColor +
      ";color:#" +
      labelColor +
      ";font-size:11px;font-family:" +
      style.fontFamily +
      ";}",
    ".ct-grid{stroke:#" +
      labelColor +
      ";stroke-opacity:" +
      gridOpacity +
      ";stroke-dasharray:" +
      style.grid.dashArray +
      ";}",
    ".ct-line{fill:none;stroke:#" +
      lineColor +
      ";stroke-width:" +
      style.line.width +
      ";stroke-linecap:round;stroke-linejoin:round;}",
    style.line.dashArray
      ? ".ct-line{stroke-dasharray:" + style.line.dashArray + ";}"
      : "",
    style.line.glow
      ? ".ct-line{filter:drop-shadow(0 0 " +
        style.line.glow +
        "px #" +
        lineColor +
        ");}"
      : "",
    ".ct-point{stroke:#" +
      pointColor +
      ";stroke-width:" +
      style.points.width +
      ";stroke-linecap:round;}",
    ".ct-point.graph-point-empty{opacity:0.28;}",
    style.points.alternateColor
      ? ".ct-point.graph-point-active:nth-of-type(2n){stroke:#" +
        areaColor +
        ";}"
      : "",
    ".ct-area{fill:" + areaFill + ";fill-opacity:" + style.area.opacity + ";}",
    ".ct-bar{stroke:#" +
      pointColor +
      ";stroke-width:" +
      barWidth +
      ";stroke-linecap:round;}",
    ".ct-bar.graph-point-empty{opacity:0.28;}",
    ".graph-title{font-family:" + style.fontFamily + ";}",
    ...animationStyles,
  ]
    .filter(Boolean)
    .join("\n")
}

function addAreaGradient(
  scene: ReturnType<typeof toScene>,
  options: GraphOptions
) {
  const style = getGraphStyle(options.type)

  if (
    style.area.fill !== "gradient" ||
    (!style.area.enabled && !options.area)
  ) {
    return scene
  }

  const lineColor = safeColor(
    style.line.color ?? options.colors.lineColor,
    "9e4c98"
  )
  const areaColor = safeColor(options.colors.areaColor, "9e4c98")

  const gradient = node("linearGradient", {
    id: "activity-area-gradient",
    x1: "0%",
    y1: "0%",
    x2: "0%",
    y2: "100%",
  })
    .append(
      node("stop", {
        offset: "0%",
        "stop-color": "#" + lineColor,
        "stop-opacity": "0.78",
      })
    )
    .append(
      node("stop", {
        offset: "100%",
        "stop-color": "#" + areaColor,
        "stop-opacity": "0.04",
      })
    )

  return scene.append(node("defs").append(gradient), true)
}

function decorateScene(
  initialScene: ReturnType<typeof toScene>,
  title: string,
  options: GraphOptions,
  height: number,
  barWidth: number
) {
  const backgroundColor = safeColor(options.colors.bgColor, "ffffff")
  const borderColor = safeColor(options.colors.borderColor, "ffffff")
  const titleColor = safeColor(options.colors.titleColor, "9e4c98")
  const radius = Math.min(16, Math.max(0, Math.trunc(options.radius)))

  let scene = addAreaGradient(initialScene, options)

  scene = scene.append(
    node(
      "rect",
      {
        x: 0,
        y: 0,
        width: SVG_WIDTH,
        height,
        rx: radius,
        fill: "#" + backgroundColor,
      },
      "graph-background"
    ),
    true
  )

  scene = scene.append(
    node("title").text(title || "GitHub activity graph"),
    true
  )

  if (title) {
    scene = scene.append(
      node(
        "text",
        {
          x: SVG_WIDTH / 2,
          y: 48,
          "text-anchor": "middle",
          fill: "#" + titleColor,
          "font-size": 20,
          "font-weight": 700,
        },
        "graph-title"
      ).text(title)
    )
  }

  scene = scene.append(
    node(
      "rect",
      {
        x: 0.5,
        y: 0.5,
        width: SVG_WIDTH - 1,
        height: height - 1,
        rx: radius,
        fill: "none",
        stroke: "#" + borderColor,
        "stroke-width": 1,
      },
      "graph-border"
    )
  )

  scene = scene.append(node("style").text(createChartCss(options, barWidth)))

  return scene.attr({
    width: SVG_WIDTH,
    height,
    viewBox: "0 0 " + SVG_WIDTH + " " + height,
    role: "img",
    "aria-label": title || "GitHub activity graph",
  })
}

export function renderActivityGraph(data: ActivityData, options: GraphOptions) {
  const style = getGraphStyle(options.type)
  const height = Math.min(600, Math.max(200, Math.trunc(options.height)))
  const contributions = normalizeContributions(data)
  const labels = contributions.map((day) => day.date)
  const values = contributions.map((day) => day.count)
  const maxValue = values.reduce(
    (maximum, value) => Math.max(maximum, value),
    0
  )
  const daysInterval = Math.max(1, Math.ceil(labels.length / 12))
  const hasTitle = !options.hideTitle
  const title = hasTitle
    ? options.customTitle ||
      (options.organization
        ? options.organization + "'s Organization Activity Graph"
        : (data.name || options.username) + "'s Contribution Graph")
    : ""
  const chartData = {
    labels,
    series: [{ name: "contributions", data: values }],
  }
  const chartPadding = {
    top: hasTitle ? 85 : 22,
    right: 34,
    bottom: 22,
    left: 12,
  }
  const axisX = {
    offset: 26,
    showLabel: true,
    showGrid: false,
    labelTransform: (value: string | number | Date, index: number) =>
      index % daysInterval === 0 || index === labels.length - 1
        ? String(value)
        : null,
  }
  const axisY = {
    offset: style.axisY.offset,
    showLabel: style.axisY.showLabels,
    showGrid: options.grid && style.grid.enabled,
    low: 0,
    high: Math.max(1, maxValue),
    onlyInteger: true,
    scaleMinSpace: 34,
  }

  const barWidth = Math.max(
    style.bar.minWidth,
    Math.min(
      style.bar.maxWidth,
      ((SVG_WIDTH - 120) / labels.length) * style.bar.widthRatio
    )
  )

  const chartConfig =
    style.chart === "bar"
      ? barChartConfig(chartData, {
          width: SVG_WIDTH,
          height,
          chartPadding,
          seriesBarDistance: 0,
          axisX,
          axisY,
        })
      : lineChartConfig(chartData, {
          width: SVG_WIDTH,
          height,
          chartPadding,
          fullWidth: true,
          showLine: true,
          showPoint: style.points.mode !== "none",
          showArea: options.area || style.area.enabled,
          areaBase: 0,
          lineSmooth: style.line.step
            ? Interpolation.step()
            : style.line.smooth,
          axisX,
          axisY,
        })

  const rawScene = toScene(chartConfig, {
    width: SVG_WIDTH,
    height,
    labels: "svg",
  })

  const filteredScene = mapNodes(rawScene, (current) => {
    if (current.role === "point") {
      const count = numericValue(current.ctx.value)
      const pointIndex = current.ctx.valueIndex

      if (style.points.mode === "none") {
        return null
      }

      if (style.points.mode === "every-third" && pointIndex % 3 !== 0) {
        return null
      }

      if (style.points.mode === "positive" && count <= 0) {
        return null
      }

      return current.addClass(
        count > 0 ? "graph-point-active" : "graph-point-empty"
      )
    }

    if (current.role === "bar") {
      const count = numericValue(current.ctx.value)
      return current.addClass(
        count > 0 ? "graph-point-active" : "graph-point-empty"
      )
    }

    return undefined
  })

  const scene = decorateScene(
    filteredScene ?? rawScene,
    title,
    options,
    height,
    barWidth
  )

  return renderToString(scene)
}

export function invalidGraph(message: string, options: GraphOptions) {
  const width = 1200
  const height = Math.min(600, Math.max(200, Math.trunc(options.height)))

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${width}"
         height="${height}"
         viewBox="0 0 ${width} ${height}"
         fill="none">

      <rect
        x="0.5"
        y="0.5"
        width="${width - 1}"
        height="${height - 1}"
        rx="8"
        fill="#09090b"
        stroke="#27272a"
      />

      <circle cx="${width / 2}" cy="${height / 2 - 30}" r="24" fill="#27272a"/>

      <path
        d="M600 ${height / 2 - 42}V${height / 2 - 29}M600 ${height / 2 - 21}V${height / 2 - 20}"
        stroke="#a1a1aa"
        stroke-width="2"
        stroke-linecap="round"
      />

      <text
        x="${width / 2}"
        y="${height / 2 + 22}"
        fill="#fafafa"
        font-family="Inter, Arial, sans-serif"
        font-size="16"
        font-weight="600"
        text-anchor="middle"
      >
        Unable to display graph
      </text>

      <text
        x="${width / 2}"
        y="${height / 2 + 46}"
        fill="#a1a1aa"
        font-family="Inter, Arial, sans-serif"
        font-size="13"
        text-anchor="middle"
      >
        ${escapeXml(message)}
      </text>
    </svg>
  `
}