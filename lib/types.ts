import type { GraphType } from "./graph-styles"

export type { GraphType } from "./graph-styles"

export type ContributionDay = { date: string; contributionCount: number }

export type Colors = {
  areaColor: string
  bgColor: string
  borderColor: string
  color: string
  titleColor: string
  lineColor: string
  pointColor: string
}

export type GraphOptions = {
  username: string
  organization: string
  hideTitle: boolean
  customTitle?: string
  radius: number
  height: number
  days: number
  from?: string
  to?: string
  area: boolean
  grid: boolean
  showPoint: boolean
  type: GraphType
  colors: Colors
}

export type ActivityData = {
  name: string | null
  contributions: ContributionDay[]
}

export type GraphQuery = Record<string, string | string[] | undefined>
