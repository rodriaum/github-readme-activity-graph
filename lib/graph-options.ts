import type { GraphOptions, GraphQuery, GraphType, Colors } from "./types"
import { graphStyleNames } from "./graph-styles"
import { getTheme } from "./themes"

const loginPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/
const colorPattern = /^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

const getValue = (query: GraphQuery, key: string) => {
  const value = query[key]
  return Array.isArray(value) ? value[0] : value
}

const getBoolean = (value: string | undefined, fallback: boolean) =>
  value === undefined ? fallback : value === "true"

const getNumber = (value: string | undefined, fallback: number, min: number, max: number) => {
  const parsed = value === undefined || value.trim() === "" ? Number.NaN : Number(value)
  return Number.isInteger(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback
}

const getDate = (value: string | undefined) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value ? undefined : value
}

const safeColor = (value: string | undefined, fallback: string) =>
  value && colorPattern.test(value) ? value : fallback

export const isValidGitHubLogin = (value: string) => loginPattern.test(value)

export function parseGraphOptions(query: GraphQuery): GraphOptions {
  const username = (getValue(query, "username") ?? "").trim()
  const organization = (getValue(query, "organization") ?? "").trim()
  const theme = getTheme(getValue(query, "theme") ?? "default")
  const fromValue = getDate(getValue(query, "from"))
  const toValue = getDate(getValue(query, "to"))
  const now = new Date().toISOString().slice(0, 10)
  let from: string | undefined
  let to: string | undefined
  let days = getNumber(getValue(query, "days"), 31, 1, 90)

  if (fromValue && toValue) {
    const start = Date.parse(`${fromValue}T00:00:00.000Z`)
    const end = Date.parse(`${toValue}T00:00:00.000Z`)
    const range = (end - start) / 86_400_000
    if (range >= 0 && range < 90 && toValue <= now) {
      from = fromValue
      to = toValue
      days = range + 1
    }
  }

  const requestedType = getValue(query, "type") ?? "default"
  const type = graphStyleNames.includes(requestedType as GraphType) ? requestedType as GraphType : "default"
  const radius = getNumber(getValue(query, "radius"), 0, 0, 16)
  const height = getNumber(getValue(query, "height"), 420, 200, 600)
  const customTitle = getValue(query, "custom_title")?.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 120)
  const hideBorder = getBoolean(getValue(query, "hide_border"), false)

  const colors: Colors = {
    areaColor: safeColor(getValue(query, "area_color"), theme.areaColor),
    bgColor: safeColor(getValue(query, "bg_color"), theme.bgColor),
    borderColor: hideBorder ? "0000" : safeColor(getValue(query, "border_color"), theme.borderColor),
    color: safeColor(getValue(query, "color"), theme.color),
    titleColor: safeColor(getValue(query, "title_color"), theme.titleColor),
    lineColor: safeColor(getValue(query, "line"), theme.lineColor),
    pointColor: safeColor(getValue(query, "point"), theme.pointColor)
  }

  return { username, organization, hideTitle: getBoolean(getValue(query, "hide_title"), false), customTitle: customTitle || undefined, radius, height, days, from, to, area: getBoolean(getValue(query, "area"), false), grid: getBoolean(getValue(query, "grid"), true), type, colors }
}
