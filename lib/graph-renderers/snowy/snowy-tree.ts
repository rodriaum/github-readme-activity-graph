import { SnowyPalette } from "./snowy-palette"
import type { SnowyContribution } from "./snowy-types"

export interface SnowyTreeOptions {
  contribution: SnowyContribution
  x: number
  baseline: number
  width: number
  height: number
  palette: SnowyPalette
}

export class SnowyTree {
  constructor(private readonly options: SnowyTreeOptions) {}

  render(): string {
    if (this.options.contribution.count <= 0) {
      return this.renderSnowDrift()
    }

    const { x, baseline, width, height, palette } = this.options
    const center = x + width / 2
    const top = baseline - height
    const trunkWidth = Math.max(1.5, width * 0.1)
    const trunkHeight = Math.max(4, height * 0.14)
    const tiers = [
      { y: top, width: width * 0.34, height: height * 0.42, color: palette.pine },
      { y: top + height * 0.23, width: width * 0.68, height: height * 0.48, color: palette.pineShadow },
      { y: top + height * 0.48, width: width * 0.98, height: height * 0.52, color: palette.pine },
    ]
    const parts = [
      "<g>",
      this.renderTooltip(),
      '<rect x="' +
        (center - trunkWidth / 2) +
        '" y="' +
        (baseline - trunkHeight) +
        '" width="' +
        trunkWidth +
        '" height="' +
        trunkHeight +
        '" fill="' +
        palette.pineShadow +
        '"/>',
      ...tiers.map((tier) => this.renderTier(center, tier.y, tier.width / 2, tier.height, tier.color)),
      '<circle cx="' +
        (center + width * 0.08) +
        '" cy="' +
        (top + height * 0.12) +
        '" r="' +
        Math.max(1, width * 0.07) +
        '" fill="' +
        palette.snowHighlight +
        '"/>',
      "</g>",
    ]

    return parts.join("")
  }

  private renderTier(
    center: number,
    top: number,
    halfWidth: number,
    height: number,
    fill: string
  ): string {
    const lowerY = top + height

    return (
      '<path d="M' +
      center +
      " " +
      top +
      " L" +
      (center + halfWidth) +
      " " +
      lowerY +
      " H" +
      (center - halfWidth) +
      ' Z" fill="' +
      fill +
      '"/>' +
      '<path d="M' +
      center +
      " " +
      top +
      " L" +
      (center + halfWidth) +
      " " +
      lowerY +
      '" fill="none" stroke="' +
      this.options.palette.snow +
      '" stroke-width="' +
      Math.max(1, Math.min(2, this.options.width * 0.07)) +
      '" stroke-linecap="round"/>'
    )
  }

  private renderTooltip(): string {
    const { count, date } = this.options.contribution
    const label =
      count +
      " contribution" +
      (count === 1 ? "" : "s") +
      (date ? " on " + date : "")

    return "<title>" + this.escapeXml(label) + "</title>"
  }

  private renderSnowDrift(): string {
    const { x, baseline, width, palette, contribution } = this.options
    const center = x + width / 2
    const radius = Math.max(2, width * 0.42)

    return (
      "<g><title>No contributions" +
      (contribution.date ? " on " + this.escapeXml(contribution.date) : "") +
      "</title>" +
      '<ellipse cx="' +
      center +
      '" cy="' +
      (baseline - 2) +
      '" rx="' +
      radius +
      '" ry="' +
      Math.max(1.5, width * 0.16) +
      '" fill="' +
      palette.snowShadow +
      '"/>' +
      '<path d="M' +
      (center - radius) +
      " " +
      (baseline - 2) +
      " Q" +
      center +
      " " +
      (baseline - radius * 0.8) +
      " " +
      (center + radius) +
      " " +
      (baseline - 2) +
      '" fill="' +
      palette.snow +
      '"/></g>'
    )
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  }
}
