export type InterpolationName =
  "none" | "simple" | "step" | "cardinal" | "monotoneCubic"

export type PointMode = "all" | "positive" | "every-nth" | "none"

export type GraphStyle = {
  label: string
  chart: "line" | "bar"
  fontFamily: string

  /** Opacity of points/bars with a zero count */
  inactiveOpacity: number

  /** Extra raw CSS appended to the SVG <style>. Supports placeholders. */
  css?: string

  /** Tooltip template for each point/bar, or false to disable */
  tooltip: string | false

  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }

  title: {
    /** top padding used instead of `padding.top` when a title is shown */
    topPadding: number
    y: number
    fontSize: number
    fontWeight: number
  }

  line: {
    width: number
    interpolation: InterpolationName
    color?: string
    dashArray?: string
    glow?: number
  }

  points: {
    width: number
    mode: PointMode
    /** used by mode "every-nth" */
    every?: number
    color?: string
    alternateColor?: boolean
  }

  area: {
    enabled: boolean
    fill: "solid" | "gradient"
    opacity: number

    /** stop opacities for fill "gradient" */
    gradient: {
      from: number
      to: number
    }
  }

  grid: {
    enabled: boolean
    opacity: number
    dashArray: string
  }

  axisX: {
    offset: number
    maxLabels: number
  }
  axisY: {
    showLabels: boolean
    offset: number
    /** multiplier applied to the max value (1.15 = 15% headroom) */
    headroom: number
    scaleMinSpace: number
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
    /** stroke-dasharray length used by the line draw animation */
    lineDashLength: number
  }
}

/* Helpers */

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

function deepMerge<T>(base: T, overrides: DeepPartial<T>): T {
  const result: Record<string, unknown> = { ...(base as object) }

  for (const [key, value] of Object.entries(overrides as object)) {
    if (value === undefined) continue
    const current = result[key]
    result[key] =
      isPlainObject(current) && isPlainObject(value)
        ? deepMerge(current, value)
        : value
  }

  return result as T
}

/* Base Preset */

const baseStyle: GraphStyle = {
  label: "Default",
  chart: "line",
  fontFamily: "'Segoe UI', Ubuntu, sans-serif",
  inactiveOpacity: 0.28,
  tooltip: "{count} contribution{s} on {date}",
  padding: {
    top: 22,
    right: 34,
    bottom: 22,
    left: 12,
  },
  title: {
    topPadding: 85,
    y: 48,
    fontSize: 20,
    fontWeight: 700,
  },

  // monotoneCubic never overshoots the data points (cardinal dips below 0)
  line: {
    width: 2.8,
    interpolation: "monotoneCubic",
  },
  points: {
    width: 6,
    mode: "positive",
    every: 3,
  },

  area: {
    enabled: false,
    fill: "solid",
    opacity: 0.22,
    gradient: {
      from: 0.78,
      to: 0.04,
    },
  },
  grid: {
    enabled: true,
    opacity: 0.18,
    dashArray: "4 6",
  },
  axisX: {
    offset: 26,
    maxLabels: 12,
  },
  axisY: {
    showLabels: true,
    offset: 48,
    headroom: 1.15,
    scaleMinSpace: 34,
  },
  bar: {
    widthRatio: 0.68,
    minWidth: 2,
    maxWidth: 24,
  },
  animation: {
    enabled: true,
    lineDuration: 6000,
    markDuration: 700,
    lineDashLength: 5000,
  },
}

/** Creates a preset from the base style, overriding only what differs. */
export const definePreset = (
  label: string,
  overrides: DeepPartial<GraphStyle> = {},
  base: GraphStyle = baseStyle
): GraphStyle => deepMerge(base, { ...overrides, label })

/* Presets */

export const graphStyles = {
  default: definePreset("Default"),

  bar: definePreset("Bar", {
    chart: "bar",
    points: { mode: "none" },
  }),

  neon: definePreset("Neon", {
    line: { glow: 5 },
  }),

  terminal: definePreset("Terminal", {
    fontFamily: "VT323, monospace",
    line: { interpolation: "step" },
    points: { mode: "none" },
    area: { enabled: true, opacity: 0.25 },
  }),

  gradient: definePreset("Gradient", {
    area: { enabled: true, fill: "gradient", opacity: 0.92 },
  }),

  "pixel-city": definePreset("Pixel City", {
    chart: "bar",
    points: { mode: "none" },
    area: { enabled: false },
    animation: { enabled: false },
  }),

  snowy: definePreset("Snowy", {
    chart: "bar",
    points: { mode: "none" },
    area: { enabled: false },
    animation: { enabled: false },
  }),

} as const satisfies Record<string, GraphStyle>

/* Lookups */

export type GraphType = keyof typeof graphStyles

export const graphStyleNames = Object.keys(graphStyles) as GraphType[]

/** Ready for the Studio <select>. */
export const graphStyleOptions = graphStyleNames.map((value) => ({
  value,
  label: graphStyles[value].label,
}))

/** Type guard for the API parser. */
export const isGraphType = (value: unknown): value is GraphType =>
  typeof value === "string" && value in graphStyles

export function getGraphStyle(type: GraphType): GraphStyle {
  return graphStyles[type] ?? graphStyles.default
}
