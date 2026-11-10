export interface GraphAxisSettings {
  headroom: number
  scaleMinSpace: number
}

export interface GraphAxisScale {
  step: number
  maximum: number
  values: number[]
}

export interface GraphAxisLayout {
  left: number
  right: number
  top: number
  bottom: number
}

export interface GraphAxisOptions {
  layout: GraphAxisLayout
  scale: GraphAxisScale
  showGrid: boolean
  showLabels: boolean
  labelColor: string
  gridOpacity?: number
  dashArray?: string
}

export class GraphAxis {
  constructor(private readonly options: GraphAxisOptions) {}

  static createScale(
    maximumValue: number,
    axisHeight: number,
    settings: GraphAxisSettings
  ): GraphAxisScale {
    const high = Math.max(1, maximumValue * settings.headroom)
    const minimumSpace = Math.max(1, settings.scaleMinSpace)
    const intervals = Math.max(1, Math.min(4, Math.floor(axisHeight / minimumSpace)))
    const rawStep = high / intervals
    const step = Math.max(1, Math.ceil(GraphAxis.niceStep(rawStep)))
    const maximum = Math.max(step, Math.ceil(high / step) * step)
    const values: number[] = []

    for (let value = 0; value <= maximum; value += step) {
      values.push(value)
    }

    return { step, maximum, values }
  }

  render(): string {
    const {
      layout,
      scale,
      showGrid,
      showLabels,
      labelColor,
      gridOpacity = 0.16,
      dashArray = "3 6",
    } = this.options
    const plotHeight = layout.bottom - layout.top
    const elements: string[] = []

    scale.values.forEach((value) => {
      const y = layout.bottom - (value / scale.maximum) * plotHeight

      if (showGrid) {
        elements.push(
          '<path d="M' +
            layout.left +
            " " +
            y +
            " H" +
            layout.right +
            '" fill="none" stroke="' +
            labelColor +
            '" stroke-opacity="' +
            gridOpacity +
            '" stroke-dasharray="' +
            dashArray +
            '"/>'
        )
      }

      if (showLabels) {
        elements.push(
          '<text x="' +
            (layout.left - 12) +
            '" y="' +
            (y + 4) +
            '" text-anchor="end" fill="' +
            labelColor +
            '" font-family="Arial, sans-serif" font-size="11">' +
            value +
            "</text>"
        )
      }
    })

    return elements.join("")
  }

  private static niceStep(value: number): number {
    if (!Number.isFinite(value) || value <= 0) return 1

    const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
    const fraction = value / magnitude

    if (fraction <= 1.5) return magnitude
    if (fraction <= 2.25) return magnitude * 2
    if (fraction <= 3.5) return magnitude * 2.5
    if (fraction <= 7.5) return magnitude * 5

    return magnitude * 10
  }
}
