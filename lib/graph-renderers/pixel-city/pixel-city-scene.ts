import type {
  PixelCityContribution,
  PixelCityLayout,
  GraphAxisScale,
  PixelCityRendererOptions,
} from "./pixel-city-types"
import { PixelCityPalette } from "./pixel-city-palette"
import { GraphAxis } from "../shared/graph-axis"
import type { GraphAxisScale } from "../shared/graph-axis"

export class PixelCityScene {
  constructor(
    private readonly options: PixelCityRendererOptions,
    private readonly layout: PixelCityLayout,
    private readonly palette: PixelCityPalette
  ) {}

  render(
    contributions: PixelCityContribution[],
    buildings: string[],
    axisScale: GraphAxisScale
  ): string {
    const { width, height, title, theme } = this.options
    const accessibleTitle = title || "GitHub contribution city"

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
      '<rect width="' +
        width +
        '" height="' +
        height +
        '" rx="' +
        theme.radius +
        '" fill="' +
        this.palette.background +
        '"/>',
      this.renderTitle(),
      this.renderSkyline(),
      this.renderStreet(),
      this.renderGuides(axisScale),
      buildings.join(""),
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

  private renderSkyline(): string {
    const { left, right, groundY, slotWidth } = this.layout
    const towerCount = Math.max(10, Math.min(24, Math.ceil((right - left) / 48)))
    const towerWidth = Math.min(24, Math.max(5, slotWidth * 1.1))
    const spacing = (right - left) / towerCount
    const towers: string[] = []

    for (let index = 0; index < towerCount; index++) {
      const towerHeight = 22 + ((index * 19) % 43)
      const x = left + index * spacing + (spacing - towerWidth) / 2
      const y = groundY - towerHeight

      towers.push(
        '<g opacity="0.2"><rect x="' +
          x +
          '" y="' +
          y +
          '" width="' +
          towerWidth +
          '" height="' +
          towerHeight +
          '" fill="' +
          this.palette.skyline +
          '"/><rect x="' +
          (x + towerWidth * 0.25) +
          '" y="' +
          (y + 5) +
          '" width="' +
          Math.max(1, towerWidth * 0.16) +
          '" height="2" fill="' +
          this.palette.windowLit +
          '"/></g>'
      )
    }

    return towers.join("")
  }

  private renderGuides(scale: GraphAxisScale): string {
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
    }).render()
  }

  private renderStreet(): string {
    const { left, right, groundY } = this.layout
    const { height } = this.options
    const roadY = groundY + 7
    const roadHeight = Math.max(10, height - roadY - 27)
    const streetParts = [
      '<rect x="' +
        (left - 5) +
        '" y="' +
        groundY +
        '" width="' +
        (right - left + 10) +
        '" height="7" fill="' +
        this.palette.sidewalk +
        '"/>',
      '<rect x="' +
        (left - 5) +
        '" y="' +
        roadY +
        '" width="' +
        (right - left + 10) +
        '" height="' +
        roadHeight +
        '" fill="' +
        this.palette.street +
        '"/>',
    ]

    const markingY = roadY + roadHeight * 0.58
    const markingWidth = Math.max(4, Math.min(22, this.layout.slotWidth * 0.5))

    for (let x = left + 8; x < right - markingWidth; x += 54) {
      streetParts.push(
        '<rect x="' +
          x +
          '" y="' +
          markingY +
          '" width="' +
          markingWidth +
          '" height="2" fill="' +
          this.palette.streetMarking +
          '" opacity="0.72"/>'
      )
    }

    return streetParts.join("")
  }

  private renderTitle(): string {
    const { width, title } = this.options

    if (!title) {
      return ""
    }

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

  private formatDateLabel(date: string): string {
    const normalized = date.trim()

    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(normalized)) {
      return normalized.slice(5).replace("-", "/")
    }

    return normalized
  }

  private renderDateLabels(
    contributions: PixelCityContribution[]
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

      if (!contribution.date) {
        return
      }

      labels.push(
        '<text x="' +
          (left + index * slotWidth + slotWidth / 2) +
          '" y="' +
          (height - 9) +
          '" text-anchor="middle" fill="' +
          this.palette.label +
          '" font-family="Arial, sans-serif" font-size="10">' +
          this.escapeXml(this.formatDateLabel(contribution.date)) +
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
