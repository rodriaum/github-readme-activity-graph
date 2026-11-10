import type { PixelCityContribution } from "./pixel-city-types"
import { PixelCityPalette } from "./pixel-city-palette"

export interface PixelCityBuildingOptions {
  contribution: PixelCityContribution
  index: number
  x: number
  baseline: number
  width: number
  height: number
  intensity: number
  palette: PixelCityPalette
}

export class PixelCityBuilding {
  constructor(private readonly options: PixelCityBuildingOptions) {}

  render(): string {
    if (this.options.contribution.count === 0) {
      return this.renderPark()
    }

    const { x, baseline, width, height, palette } = this.options
    const top = baseline - height
    const sideWidth = Math.min(5, Math.max(1, width * 0.16))
    const frontWidth = Math.max(2, width - sideWidth)
    const roofHeight = Math.min(5, Math.max(2, width * 0.12))
    const bodyHeight = Math.max(1, height - roofHeight)
    const parts = [
      "<g>",
      this.renderTooltip(),
      '<rect x="' +
        x +
        '" y="' +
        (top + roofHeight) +
        '" width="' +
        frontWidth +
        '" height="' +
        bodyHeight +
        '" fill="' +
        palette.buildingFront +
        '"/>',
      '<rect x="' +
        (x + frontWidth) +
        '" y="' +
        (top + roofHeight) +
        '" width="' +
        sideWidth +
        '" height="' +
        bodyHeight +
        '" fill="' +
        palette.buildingSide +
        '"/>',
      '<rect x="' +
        x +
        '" y="' +
        top +
        '" width="' +
        width +
        '" height="' +
        roofHeight +
        '" fill="' +
        palette.buildingRoof +
        '"/>',
      this.renderRoof(top, frontWidth, roofHeight),
      this.renderWindows(top + roofHeight, frontWidth, bodyHeight),
      "</g>",
    ]

    return parts.join("")
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

  private renderRoof(top: number, frontWidth: number, roofHeight: number) {
    const { x, width, index, palette } = this.options
    const variant = index % 4
    const details: string[] = []

    if (variant === 0) {
      const unitWidth = Math.max(2, Math.min(6, frontWidth * 0.28))
      details.push(
        '<rect x="' +
          (x + 2) +
          '" y="' +
          (top - 3) +
          '" width="' +
          unitWidth +
          '" height="3" fill="' +
          palette.buildingSide +
          '"/>'
      )
    } else if (variant === 1) {
      const antennaX = x + Math.max(2, frontWidth * 0.68)
      details.push(
        '<rect x="' +
          antennaX +
          '" y="' +
          (top - 7) +
          '" width="2" height="7" fill="' +
          palette.buildingSide +
          '"/>'
      )
      details.push(
        '<rect x="' +
          (antennaX - 1) +
          '" y="' +
          (top - 8) +
          '" width="4" height="2" fill="' +
          palette.buildingRoof +
          '"/>'
      )
    } else if (variant === 2) {
      const moduleWidth = Math.max(3, frontWidth * 0.52)
      details.push(
        '<rect x="' +
          (x + (frontWidth - moduleWidth) / 2) +
          '" y="' +
          (top - 4) +
          '" width="' +
          moduleWidth +
          '" height="4" fill="' +
          palette.buildingSide +
          '"/>'
      )
    } else {
      const tankWidth = Math.max(3, Math.min(8, width * 0.3))
      details.push(
        '<rect x="' +
          (x + width - tankWidth - 2) +
          '" y="' +
          (top - 4) +
          '" width="' +
          tankWidth +
          '" height="4" fill="' +
          palette.buildingSide +
          '"/>'
      )
    }

    return details.join("")
  }

  private renderWindows(
    bodyTop: number,
    frontWidth: number,
    bodyHeight: number
  ): string {
    const { x, baseline, index, intensity, palette } = this.options

    if (frontWidth < 4 || bodyHeight < 8) {
      return ""
    }

    const columns =
      frontWidth >= 25 ? 3 : frontWidth >= 13 ? 2 : 1
    const rows = Math.max(1, Math.floor((bodyHeight - 5) / 10))
    const cellWidth = frontWidth / columns
    const windowWidth = Math.max(1, Math.min(4, cellWidth * 0.3))
    const windowHeight = Math.max(1.5, Math.min(3.5, bodyHeight * 0.055))
    const lightRatio = 0.2 + intensity * 0.72
    const windows: string[] = []

    for (let row = 0; row < rows; row++) {
      const windowY = bodyTop + 4 + row * 9

      if (windowY + windowHeight >= baseline - 2) {
        break
      }

      for (let column = 0; column < columns; column++) {
        const windowX =
          x + column * cellWidth + (cellWidth - windowWidth) / 2
        const seed = (index * 17 + row * 7 + column * 11) % 100
        const fill =
          seed / 100 < lightRatio
            ? palette.windowLit
            : palette.windowDark

        windows.push(
          '<rect x="' +
            windowX +
            '" y="' +
            windowY +
            '" width="' +
            windowWidth +
            '" height="' +
            windowHeight +
            '" fill="' +
            fill +
            '"/>'
        )
      }
    }

    return windows.join("")
  }

  private renderPark(): string {
    const { contribution, x, baseline, width, index, palette } = this.options
    const label =
      "No contributions" + (contribution.date ? " on " + contribution.date : "")
    const treeSize = Math.min(6, Math.max(2, width * 0.28))
    const treeX = x + (width - treeSize) / 2
    const showTree = width >= 7

    return [
      "<g>",
      "<title>" + this.escapeXml(label) + "</title>",
      '<rect x="' +
        x +
        '" y="' +
        (baseline - 3) +
        '" width="' +
        width +
        '" height="3" fill="' +
        palette.emptyLot +
        '"/>',
      showTree
        ? '<rect x="' +
          (treeX + treeSize * 0.42) +
          '" y="' +
          (baseline - 7) +
          '" width="' +
          Math.max(1, treeSize * 0.2) +
          '" height="4" fill="' +
          palette.treeTrunk +
          '"/><rect x="' +
          treeX +
          '" y="' +
          (baseline - 10) +
          '" width="' +
          treeSize +
          '" height="3" fill="' +
          palette.treeFoliage +
          '"/>'
        : "",
      index % 2 === 0
        ? '<rect x="' +
          (x + width * 0.18) +
          '" y="' +
          (baseline - 2) +
          '" width="1.5" height="1.5" fill="' +
          palette.treeFoliage +
          '"/>'
        : "",
      "</g>",
    ].join("")
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
