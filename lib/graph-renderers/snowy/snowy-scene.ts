import { GraphAxis } from "../shared/graph-axis"
import type { GraphAxisScale } from "../shared/graph-axis"
import { SnowyPalette } from "./snowy-palette"
import type {
  SnowyContribution,
  SnowyLayout,
  SnowyRendererOptions,
} from "./snowy-types"

export class SnowyScene {
  constructor(
    private readonly options: SnowyRendererOptions,
    private readonly layout: SnowyLayout,
    private readonly palette: SnowyPalette
  ) {}

  render(
    contributions: SnowyContribution[],
    trees: string[],
    scale: GraphAxisScale
  ): string {
    const { width, height, title, theme } = this.options
    const accessibleTitle = title || "GitHub contribution graph in winter"

    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
        width +
        '" height="' +
        height +
        '" viewBox="0 0 ' +
        width +
        " " +
        height +
        '" role="img" aria-label="' +
        this.escapeXml(accessibleTitle) +
        '">',
      "<title>" + this.escapeXml(accessibleTitle) + "</title>",
      this.renderDefinitions(),
      '<rect width="' +
        width +
        '" height="' +
        height +
        '" rx="' +
        theme.radius +
        '" fill="url(#snowy-sky)"/>',
      this.renderTitle(),
      this.renderMountains(),
      this.renderSnowfall(),
      this.renderGround(),
      this.renderAxis(scale),
      trees.join(""),
      this.renderDateLabels(contributions),
      '<rect x="0.5" y="0.5" width="' +
        (width - 1) +
        '" height="' +
        (height - 1) +
        '" rx="' +
        theme.radius +
        '" fill="none" stroke="' +
        this.palette.border +
        '" stroke-width="1"/>',
      "</svg>",
    ].join("")
  }

  private renderDefinitions(): string {
    return (
      "<defs>" +
      '<linearGradient id="snowy-sky" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' +
      this.palette.background +
      '"/>' +
      '<stop offset="100%" stop-color="' +
      this.palette.skyAccent +
      '"/>' +
      "</linearGradient>" +
      '<linearGradient id="snowy-ground" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' +
      this.palette.snow +
      '"/>' +
      '<stop offset="100%" stop-color="' +
      this.palette.snowShadow +
      '"/>' +
      "</linearGradient>" +
      "</defs>"
    )
  }

  private renderTitle(): string {
    const { width, title } = this.options

    if (!title) return ""

    return (
      '<text x="' +
      width / 2 +
      '" y="42" text-anchor="middle" fill="' +
      this.palette.title +
      '" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="600">' +
      this.escapeXml(title) +
      "</text>"
    )
  }

  private renderMountains(): string {
    const { width } = this.options
    const { groundY, top } = this.layout
    const mountainHeight = Math.max(
      30,
      Math.min(168, (groundY - top) * 0.72)
    )
    const nearHeight = mountainHeight * 0.69

    return [
      '<path d="M0 ' +
        (groundY - mountainHeight * 0.43) +
        " L" +
        width * 0.16 +
        " " +
        (groundY - mountainHeight) +
        " L" +
        width * 0.31 +
        " " +
        (groundY - mountainHeight * 0.43) +
        " L" +
        width * 0.46 +
        " " +
        (groundY - mountainHeight * 0.845) +
        " L" +
        width * 0.64 +
        " " +
        (groundY - mountainHeight * 0.417) +
        " L" +
        width * 0.82 +
        " " +
        (groundY - mountainHeight * 0.917) +
        " L" +
        width +
        " " +
        (groundY - mountainHeight * 0.393) +
        " V" +
        groundY +
        " H0 Z" +
        '" fill="' +
        this.palette.mountainFar +
        '" opacity="0.36"/>',
      '<path d="M0 ' +
        (groundY - nearHeight * 0.345) +
        " L" +
        width * 0.2 +
        " " +
        (groundY - nearHeight * 0.914) +
        " L" +
        width * 0.38 +
        " " +
        (groundY - nearHeight * 0.397) +
        " L" +
        width * 0.6 +
        " " +
        (groundY - nearHeight) +
        " L" +
        width * 0.81 +
        " " +
        (groundY - nearHeight * 0.414) +
        " L" +
        width +
        " " +
        (groundY - nearHeight * 0.819) +
        " V" +
        groundY +
        " H0 Z" +
        '" fill="' +
        this.palette.mountainNear +
        '" opacity="0.5"/>',
      this.renderMountainSnow(
        width * 0.16,
        groundY - mountainHeight,
        width * 0.045
      ),
      this.renderMountainSnow(
        width * 0.46,
        groundY - mountainHeight * 0.845,
        width * 0.04
      ),
      this.renderMountainSnow(
        width * 0.82,
        groundY - mountainHeight * 0.917,
        width * 0.04
      ),
    ].join("")
  }

  private renderMountainSnow(
    peakX: number,
    peakY: number,
    halfWidth: number
  ): string {
    return (
      '<path d="M' +
      peakX +
      " " +
      peakY +
      " L" +
      (peakX - halfWidth) +
      " " +
      (peakY + halfWidth * 1.2) +
      " L" +
      (peakX - halfWidth * 0.18) +
      " " +
      (peakY + halfWidth * 0.72) +
      " L" +
      peakX +
      " " +
      (peakY + halfWidth * 0.95) +
      " L" +
      (peakX + halfWidth * 0.22) +
      " " +
      (peakY + halfWidth * 0.7) +
      " L" +
      (peakX + halfWidth) +
      " " +
      (peakY + halfWidth * 1.2) +
      ' Z" fill="' +
      this.palette.snow +
      '" opacity="0.9"/>'
    )
  }

  private renderSnowfall(): string {
    const { width } = this.options
    const { top, groundY } = this.layout
    const flakes: string[] = []

    for (let index = 0; index < 48; index++) {
      const x = (index * 197 + 43) % width
      const y = top + 12 + ((index * 83 + 19) % Math.max(20, groundY - top - 18))
      const radius = index % 7 === 0 ? 2 : index % 3 === 0 ? 1.5 : 1

      flakes.push(
        '<circle cx="' +
          x +
          '" cy="' +
          y +
          '" r="' +
          radius +
          '" fill="' +
          this.palette.star +
          '" opacity="' +
          (index % 4 === 0 ? 0.72 : 0.38) +
          '"/>'
      )
    }

    return flakes.join("")
  }

  private renderGround(): string {
    const { width, height } = this.options
    const { groundY } = this.layout

    return (
      '<path d="M0 ' +
      (groundY - 2) +
      " Q" +
      width * 0.2 +
      " " +
      (groundY - 14) +
      " " +
      width * 0.42 +
      " " +
      (groundY - 3) +
      " T" +
      width +
      " " +
      (groundY - 2) +
      " V" +
      height +
      " H0 Z" +
      '" fill="url(#snowy-ground)"/>' +
      '<path d="M0 ' +
      (groundY + 11) +
      " Q" +
      width * 0.35 +
      " " +
      (groundY + 2) +
      " " +
      width * 0.65 +
      " " +
      (groundY + 10) +
      " T" +
      width +
      " " +
      (groundY + 8) +
      '" fill="none" stroke="' +
      this.palette.snowShadow +
      '" stroke-opacity="0.55" stroke-width="2"/>'
    )
  }

  private renderAxis(scale: GraphAxisScale): string {
    const { showGrid, showYAxis } = this.options.theme

    return new GraphAxis({
      layout: {
        left: this.layout.left,
        right: this.layout.right,
        top: this.layout.top,
        bottom: this.layout.groundY,
      },
      scale,
      showGrid,
      showLabels: showYAxis,
      labelColor: this.palette.label,
      gridOpacity: 0.2,
      dashArray: "2 6",
    }).render()
  }

  private renderDateLabels(
    contributions: SnowyContribution[]
  ): string {
    const { left, slotWidth } = this.layout
    const { height } = this.options
    const step = Math.max(1, Math.ceil(contributions.length / 10))
    const labels: string[] = []

    contributions.forEach((contribution, index) => {
      if (
        index !== 0 &&
        index !== contributions.length - 1 &&
        index % step !== 0
      ) {
        return
      }

      if (!contribution.date) return

      const date = contribution.date.trim()
      const label = /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date.slice(5).replace("-", "/")
        : date

      labels.push(
        '<text x="' +
          (left + index * slotWidth + slotWidth / 2) +
          '" y="' +
          (height - 9) +
          '" text-anchor="middle" fill="' +
          this.palette.label +
          '" font-family="Arial, sans-serif" font-size="10">' +
          this.escapeXml(label) +
          "</text>"
      )
    })

    return labels.join("")
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
