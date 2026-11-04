/**
 * Single source of truth for graph presets.
 * Adding a style here automatically exposes it in the Studio selector and API parser.
 */
export type GraphStyle = {
  label: string
  chart: "line" | "bar"
  fontFamily: string
  line: {
    width: number
    smooth: boolean
    color?: string
    dashArray?: string
    glow?: number
    step?: boolean
  }
  points: {
    width: number
    mode: "all" | "positive" | "every-third" | "none"
    color?: string
    alternateColor?: boolean
  }
  area: {
    enabled: boolean
    fill: "solid" | "gradient"
    opacity: number
  }
  grid: {
    enabled: boolean
    opacity: number
    dashArray: string
  }
  axisY: {
    showLabels: boolean
    offset: number
  }
  bar: {
    widthRatio: number
    minWidth: number
    maxWidth: number
  }
  animation: {
    enabled: boolean
    lineDuration: number
    markDuration: number
  }
}

const defaultGraphStyle = {
  label: "Default",
  chart: "line",
  fontFamily: "Inter, Arial, sans-serif",
  line: { width: 2.8, smooth: true },
  points: { width: 6, mode: "positive" },
  area: { enabled: false, fill: "solid", opacity: 0.22 },
  grid: { enabled: true, opacity: 0.18, dashArray: "4 6" },
  axisY: { showLabels: true, offset: 48 },
  bar: { widthRatio: 0.68, minWidth: 2, maxWidth: 24 },
  animation: { enabled: true, lineDuration: 6000, markDuration: 700 },
} as const satisfies GraphStyle

export const graphStyles = {
  default: defaultGraphStyle,
  bar: {
    label: "Bar",
    chart: "bar",
    fontFamily: "Inter, Arial, sans-serif",
    line: { width: 2.8, smooth: true },
    points: { width: 6, mode: "none" },
    area: { enabled: false, fill: "solid", opacity: 0.22 },
    grid: { enabled: true, opacity: 0.18, dashArray: "4 6" },
    axisY: { showLabels: true, offset: 48 },
    bar: { widthRatio: 0.68, minWidth: 2, maxWidth: 24 },
    animation: { enabled: true, lineDuration: 6000, markDuration: 700 },
  },
  neon: {
    label: "Neon",
    chart: "line",
    fontFamily: "Inter, Arial, sans-serif",
    line: { width: 2.8, smooth: true, glow: 5 },
    points: { width: 6, mode: "positive" },
    area: { enabled: false, fill: "solid", opacity: 0.22 },
    grid: { enabled: true, opacity: 0.18, dashArray: "4 6" },
    axisY: { showLabels: true, offset: 48 },
    bar: { widthRatio: 0.68, minWidth: 2, maxWidth: 24 },
    animation: { enabled: true, lineDuration: 6000, markDuration: 700 },
  },
  minimal: {
    label: "Minimal",
    chart: "line",
    fontFamily: "Inter, Arial, sans-serif",
    line: { width: 2.8, smooth: true },
    points: { width: 6, mode: "none" },
    area: { enabled: false, fill: "solid", opacity: 0.22 },
    grid: { enabled: false, opacity: 0, dashArray: "4 6" },
    axisY: { showLabels: false, offset: 8 },
    bar: { widthRatio: 0.68, minWidth: 2, maxWidth: 24 },
    animation: { enabled: true, lineDuration: 6000, markDuration: 700 },
  },
  terminal: {
    ...defaultGraphStyle,
    fontFamily: "VT323, monospace",
    label: "Terminal",
    line: {
      ...defaultGraphStyle.line,
      step: true,
    },
  },
  gradient: {
    label: "Gradient",
    chart: "line",
    fontFamily: "Inter, Arial, sans-serif",
    line: { width: 2.8, smooth: true },
    points: { width: 6, mode: "positive" },
    area: { enabled: true, fill: "gradient", opacity: 0.92 },
    grid: { enabled: true, opacity: 0.18, dashArray: "4 6" },
    axisY: { showLabels: true, offset: 48 },
    bar: { widthRatio: 0.68, minWidth: 2, maxWidth: 24 },
    animation: { enabled: true, lineDuration: 6000, markDuration: 700 },
  },
} as const satisfies Record<string, GraphStyle>

export type GraphType = keyof typeof graphStyles

export const graphStyleNames = Object.keys(graphStyles) as GraphType[]

export function getGraphStyle(type: GraphType): GraphStyle {
  return graphStyles[type] ?? graphStyles.default
}
