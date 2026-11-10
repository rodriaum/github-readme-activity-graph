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

export interface PixelCityAxisSettings {
  headroom: number
  scaleMinSpace: number
}

export interface PixelCityAxisScale {
  step: number
  maximum: number
  values: number[]
}

export interface PixelCityRendererOptions {
  width: number
  height: number
  title: string
  theme: PixelCityTheme
  axis: PixelCityAxisSettings
}

export interface PixelCityLayout {
  left: number
  right: number
  top: number
  groundY: number
  slotWidth: number
  maxBuildingHeight: number
}
