import { GraphAxis } from "../shared/graph-axis"
import { SnowyPalette } from "./snowy-palette"
import { SnowyScene } from "./snowy-scene"
import { SnowyTree } from "./snowy-tree"
import type {
  SnowyContribution,
  SnowyLayout,
  SnowyRendererOptions,
} from "./snowy-types"

export class SnowyRenderer {
  constructor(private readonly options: SnowyRendererOptions) {}

  render(contributions: SnowyContribution[]): string {
    const days =
      contributions.length > 0
        ? contributions
        : [{ date: "", count: 0 }]
    const maxContribution = Math.max(
      0,
      ...days.map((contribution) => contribution.count)
    )
    const layout = this.createLayout(days.length)
    const palette = new SnowyPalette(this.options.theme)
    const scale = GraphAxis.createScale(
      maxContribution,
      layout.groundY - layout.top,
      this.options.axis
    )
    const trees = this.createTrees(days, layout, palette, scale.maximum)
    const scene = new SnowyScene(this.options, layout, palette)

    return scene.render(days, trees, scale)
  }

  private createLayout(dayCount: number): SnowyLayout {
    const { width, height, title, theme } = this.options
    const left = theme.showYAxis ? 88 : 42
    const right = width - 36
    const top = title ? 96 : 60
    const groundY = height - 72
    const slotWidth = (right - left) / Math.max(1, dayCount)

    return {
      left,
      right,
      top,
      groundY,
      slotWidth,
      maxTreeHeight: Math.max(18, groundY - top - 12),
    }
  }

  private createTrees(
    contributions: SnowyContribution[],
    layout: SnowyLayout,
    palette: SnowyPalette,
    axisMaximum: number
  ): string[] {
    return contributions.map((contribution, index) => {
      const ratio =
        contribution.count > 0
          ? contribution.count / Math.max(1, axisMaximum)
          : 0
      const height =
        contribution.count > 0
          ? Math.max(8, layout.maxTreeHeight * ratio)
          : 0
      const width = Math.min(30, Math.max(5, layout.slotWidth * 0.78))
      const x =
        layout.left +
        index * layout.slotWidth +
        (layout.slotWidth - width) / 2

      return new SnowyTree({
        contribution,
        x,
        baseline: layout.groundY,
        width,
        height,
        palette,
      }).render()
    })
  }
}
