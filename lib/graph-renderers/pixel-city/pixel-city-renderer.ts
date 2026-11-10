import { PixelCityBuilding } from "./pixel-city-building"
import { PixelCityPalette } from "./pixel-city-palette"
import { PixelCityScene } from "./pixel-city-scene"
import type {
  PixelCityContribution,
  PixelCityLayout,
  PixelCityRendererOptions,
} from "./pixel-city-types"

export class PixelCityRenderer {
  constructor(private readonly options: PixelCityRendererOptions) {}

  render(contributions: PixelCityContribution[]): string {
    const days =
      contributions.length > 0
        ? contributions
        : [{ date: "", count: 0 }]

    const maxContribution = Math.max(
      0,
      ...days.map((contribution) => contribution.count)
    )
    const layout = this.createLayout(days.length)
    const palette = new PixelCityPalette(this.options.theme)
    const buildings = this.createBuildings(
      days,
      layout,
      palette,
      maxContribution
    )
    const scene = new PixelCityScene(this.options, layout, palette)

    return scene.render(days, buildings, maxContribution)
  }

  private createLayout(dayCount: number): PixelCityLayout {
    const { width, height, title, theme } = this.options
    const left = theme.showYAxis ? 88 : 42
    const right = width - 36
    const top = title ? 94 : 54
    const groundY = height - 60
    const slotWidth = (right - left) / Math.max(1, dayCount)

    return {
      left,
      right,
      top,
      groundY,
      slotWidth,
      maxBuildingHeight: Math.max(18, groundY - top - 8),
    }
  }

  private createBuildings(
    contributions: PixelCityContribution[],
    layout: PixelCityLayout,
    palette: PixelCityPalette,
    maxContribution: number
  ): string[] {
    const minBuildingHeight = Math.min(
      18,
      layout.maxBuildingHeight * 0.28
    )
    const logarithmicMaximum = Math.log1p(maxContribution)

    return contributions.map((contribution, index) => {
      const intensity =
        contribution.count > 0 && logarithmicMaximum > 0
          ? Math.log1p(contribution.count) / logarithmicMaximum
          : 0
      const height =
        contribution.count > 0
          ? minBuildingHeight +
            intensity * (layout.maxBuildingHeight - minBuildingHeight)
          : 0
      const width = Math.min(42, Math.max(3, layout.slotWidth * 0.72))
      const x =
        layout.left +
        index * layout.slotWidth +
        (layout.slotWidth - width) / 2

      return new PixelCityBuilding({
        contribution,
        index,
        x,
        baseline: layout.groundY,
        width,
        height,
        intensity,
        palette,
      }).render()
    })
  }
}
