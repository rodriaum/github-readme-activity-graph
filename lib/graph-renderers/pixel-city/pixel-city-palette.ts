import type { PixelCityTheme } from "./pixel-city-types"

type RGB = [number, number, number]

export class PixelCityPalette {
  readonly background: string
  readonly border: string
  readonly label: string
  readonly title: string
  readonly buildingFront: string
  readonly buildingSide: string
  readonly buildingRoof: string
  readonly windowLit: string
  readonly windowDark: string
  readonly skyline: string
  readonly sidewalk: string
  readonly street: string
  readonly streetMarking: string
  readonly emptyLot: string
  readonly treeFoliage: string
  readonly treeTrunk: string

  constructor(theme: PixelCityTheme) {
    this.background = this.toCss(theme.background)
    this.border = this.toCss(theme.border)
    this.label = this.toCss(theme.label)
    this.title = this.toCss(theme.title)

    this.buildingFront = this.mix(theme.point, theme.background, 0.48)
    this.buildingSide = this.mix(theme.point, theme.background, 0.72)
    this.buildingRoof = this.mix(theme.area, theme.point, 0.55)
    this.windowLit = this.mix(theme.title, theme.background, 0.76)
    this.windowDark = this.mix(theme.point, theme.background, 0.28)
    this.skyline = this.mix(theme.point, theme.background, 0.16)
    this.sidewalk = this.mix(theme.point, theme.background, 0.13)
    this.street = this.mix(theme.point, theme.background, 0.2)
    this.streetMarking = this.mix(theme.area, theme.background, 0.58)
    this.emptyLot = this.mix(theme.area, theme.background, 0.2)
    this.treeFoliage = this.mix(theme.area, theme.background, 0.78)
    this.treeTrunk = this.mix(theme.point, theme.background, 0.62)
  }

  private toCss(value: string): string {
    return "#" + value.replace(/^#/, "")
  }

  private toRgb(value: string): RGB {
    let normalized = value.replace(/^#/, "")

    if (normalized.length === 3 || normalized.length === 4) {
      normalized = normalized
        .slice(0, 3)
        .split("")
        .map((channel) => channel + channel)
        .join("")
    }

    if (normalized.length === 8) {
      normalized = normalized.slice(0, 6)
    }

    if (normalized.length !== 6) {
      return [0, 0, 0]
    }

    return [
      Number.parseInt(normalized.slice(0, 2), 16),
      Number.parseInt(normalized.slice(2, 4), 16),
      Number.parseInt(normalized.slice(4, 6), 16),
    ]
  }

  private toHex([red, green, blue]: RGB): string {
    const channel = (value: number) =>
      Math.round(value).toString(16).padStart(2, "0")

    return (
      "#" + channel(red) + channel(green) + channel(blue)
    )
  }

  private mix(foreground: string, background: string, amount: number): string {
    const front = this.toRgb(foreground)
    const back = this.toRgb(background)
    const ratio = Math.min(1, Math.max(0, amount))

    return this.toHex([
      back[0] + (front[0] - back[0]) * ratio,
      back[1] + (front[1] - back[1]) * ratio,
      back[2] + (front[2] - back[2]) * ratio,
    ])
  }
}
