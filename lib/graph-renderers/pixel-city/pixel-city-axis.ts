import type {
  PixelCityAxisScale,
  PixelCityAxisSettings,
  PixelCityLayout,
} from "./pixel-city-types"
import { PixelCityPalette } from "./pixel-city-palette"

export class PixelCityAxis {
  constructor(
    private readonly layout: PixelCityLayout,
    private readonly palette: PixelCityPalette,
    private readonly showGrid: boolean,
    private readonly showLabels: boolean
  ) {}

  static createScale(
    maximumValue: number,
    axisHeight: number,
    settings: PixelCityAxisSettings
  ): PixelCityAxisScale {
    const high = Math.max(1, maximumValue * settings.headroom)
    const minimumSpace = Math.max(1, settings.scaleMinSpace)
    const targetIntervals = Math.max(
      1,
      Math.min(4, Math.floor(axisHeight / minimumSpace))
    )
    const rawStep = high / targetIntervals
    const step = Math.max(1, Math.ceil(PixelCityAxis.niceStep(rawStep)))
    const maximum = Math.max(step, Math.ceil(high / step) * step)
    const values: number[] = []

    for (let value = 0; value <= maximum; value += step) {
      values.push(value)
    }

    return { step, maximum, values }
  }

  render(scale: PixelCityAxisScale): string {
    const { left, right, top, groundY } = this.layout
    const plotHeight = groundY - top
    const elements: string[] = []

    scale.values.forEach((value) => {
      const y = groundY - (value / scale.maximum) * plotHeight

      if (this.showGrid) {
        elements.push(
          '<path d="M' +
            left +
            " " +
            y +
            " H" +
            right +
            '" fill="none" stroke="' +
            this.palette.label +
            '" stroke-opacity="0.16" stroke-dasharray="3 6"/>'
        )
      }

      if (this.showLabels) {
        elements.push(
          '<text x="' +
            (left - 12) +
            '" y="' +
            (y + 4) +
            '" text-anchor="end" fill="' +
            this.palette.label +
            '" font-family="Arial, sans-serif" font-size="11">' +
            value +
            "</text>"
        )
      }
    })

    return elements.join("")
  }

  private static niceStep(value: number): number {
    if (!Number.isFinite(value) || value <= 0) {
      return 1
    }

    const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
    const fraction = value / magnitude

    if (fraction <= 1.5) return magnitude
    if (fraction <= 2.25) return magnitude * 2
    if (fraction <= 3.5) return magnitude * 2.5
    if (fraction <= 7.5) return magnitude * 5

    return magnitude * 10
  }
}
