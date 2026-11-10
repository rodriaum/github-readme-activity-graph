export interface PixelCityContribution {
  date: string
  count: number
}

export interface PixelCityTheme {
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

export interface PixelCityRendererOptions {
  width: number
  height: number
  title: string
  theme: PixelCityTheme
}

export interface PixelCityLayout {
  left: number
  right: number
  top: number
  groundY: number
  slotWidth: number
  maxBuildingHeight: number
}
