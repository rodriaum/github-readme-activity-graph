import type { SnowyTheme } from "./snowy-types"

type RGB = [number, number, number]

export class SnowyPalette {
  readonly background: string
  readonly border: string
  readonly label: string
  readonly title: string
  readonly snow: string
  readonly snowHighlight: string
  readonly snowShadow: string
  readonly mountainFar: string
  readonly mountainNear: string
  readonly pine: string
  readonly pineShadow: string
  readonly pineHighlight: string
  readonly skyAccent: string
  readonly star: string

  constructor(theme: SnowyTheme) {
    this.background = this.toCss(theme.background)
    this.border = this.toCss(theme.border)
    this.label = this.toCss(theme.label)
    this.title = this.toCss(theme.title)
    this.snow = this.mix("#ffffff", theme.background, 0.9)
    this.snowHighlight = this.mix("#ffffff", theme.area, 0.72)
    this.snowShadow = this.mix(theme.area, theme.background, 0.28)
    this.mountainFar = this.mix(theme.point, theme.background, 0.2)
    this.mountainNear = this.mix(theme.point, theme.background, 0.34)
    this.pine = this.mix(theme.point, theme.background, 0.72)
    this.pineShadow = this.mix(theme.point, theme.background, 0.48)
    this.pineHighlight = this.mix(theme.area, theme.point, 0.42)
    this.skyAccent = this.mix(theme.area, theme.background, 0.16)
    this.star = this.mix("#ffffff", theme.background, 0.82)
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

    if (normalized.length === 8) normalized = normalized.slice(0, 6)
    if (normalized.length !== 6 || /[^0-9a-f]/i.test(normalized)) {
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

    return "#" + channel(red) + channel(green) + channel(blue)
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
