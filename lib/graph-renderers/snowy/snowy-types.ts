import type { GraphAxisSettings } from "../shared/graph-axis"

export interface SnowyContribution {
  date: string
  count: number
}

export interface SnowyTheme {
  background: string
  border: string
  label: string
  title: string
  point: string
  area: string
  radius: number
  showGrid: boolean
  showYAxis: boolean
}

export interface SnowyRendererOptions {
  width: number
  height: number
  title: string
  theme: SnowyTheme
  axis: GraphAxisSettings
}

export interface SnowyLayout {
  left: number
  right: number
  top: number
  groundY: number
  slotWidth: number
  maxTreeHeight: number
}
