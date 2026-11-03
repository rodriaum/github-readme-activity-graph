import type { ActivityData, GraphOptions } from "./types"

type Point = { x: number; y: number; index: number; day: ActivityData["contributions"][number] }

const width = 1200
const escapeXml = (value: unknown) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")
const n = (value: number) => Number(value.toFixed(1))
const maxOf = (days: ActivityData["contributions"]) => days.reduce((max, day) => Math.max(max, day.contributionCount), 1)

function getPoints(days: ActivityData["contributions"], height: number, left = 90, right = 50, top = 82, bottom = 70): Point[] {
  const chartWidth = width - left - right
  const chartHeight = height - top - bottom
  const max = maxOf(days)
  return days.map((day, index) => ({
    x: n(left + (index / Math.max(1, days.length - 1)) * chartWidth),
    y: n(top + chartHeight - (day.contributionCount / max) * chartHeight),
    index,
    day
  }))
}

function gridMarkup(options: GraphOptions, left: number, right: number, top: number, bottom: number, ticks = 4) {
  if (!options.grid) return ""
  return Array.from({ length: ticks + 1 }, (_, index) => {
    const y = n(top + index / ticks * (bottom - top))
    return `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="#${options.colors.color}" stroke-opacity=".14" stroke-dasharray="4 6"/>`
  }).join("")
}

function yAxisMarkup(days: ActivityData["contributions"], color: string, left: number, top: number, bottom: number, ticks = 4) {
  const max = maxOf(days)
  return Array.from({ length: ticks + 1 }, (_, index) => {
    const y = n(top + index / ticks * (bottom - top) + 4)
    const value = Math.round(max * (ticks - index) / ticks)
    return `<text x="${left - 14}" y="${y}" text-anchor="end" fill="#${color}" font-size="12">${value}</text>`
  }).join("")
}

function dateLabels(points: Point[], color: string, y: number) {
  const interval = Math.max(1, Math.ceil(points.length / 12))
  return points.map(({ x, day, index }) => {
    if (points.length > 18 && index % interval !== 0 && index !== points.length - 1) return ""
    return `<text x="${x}" y="${y}" text-anchor="middle" fill="#${color}" font-size="11">${escapeXml(day.date)}</text>`
  }).join("")
}

function smoothPath(points: Point[], terminal = false) {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x},${point.y}`
    const previous = points[index - 1]
    if (terminal) return `${path} L ${point.x},${previous.y} L ${point.x},${point.y}`
    const middle = n((previous.x + point.x) / 2)
    return `${path} C ${middle},${previous.y} ${middle},${point.y} ${point.x},${point.y}`
  }, "")
}

function graphBody(days: ActivityData["contributions"], options: GraphOptions) {
  const height = options.height
  const minimal = options.type === "minimal"
  const terminal = options.type === "terminal"
  const left = minimal ? 70 : 90
  const right = width - (minimal ? 35 : 50)
  const top = options.type === "default" ? 80 : 82
  const bottom = height - 70
  const points = getPoints(days, height, left, width - right, top, height - bottom)
  const grid = minimal ? "" : gridMarkup(options, left, right, top, bottom, terminal ? 5 : 4)
  const yAxis = minimal ? "" : yAxisMarkup(days, options.colors.color, left, top, bottom)
  const labels = dateLabels(points, options.colors.color, bottom + 28)
  const path = smoothPath(points, terminal)
  const first = points[0]
  const last = points.at(-1)
  const areaPath = first && last ? `M ${left},${bottom} L ${first.x},${first.y}${path.replace(/^M [^ ]+/, "")} L ${right},${bottom} Z` : ""
  const area = options.area || options.type === "mountain" || options.type === "gradient"
  const areaFill = options.type === "gradient" ? "url(#activity-gradient)" : `#${options.colors.areaColor}`
  const stroke = terminal ? "#7CFF8A" : `#${options.colors.lineColor}`
  const pointColor = terminal ? "#B6FFBE" : `#${options.colors.pointColor}`
  let marks = ""

  if (options.type === "bar") {
    const chartWidth = right - left
    const slotWidth = chartWidth / Math.max(1, days.length)
    const barWidth = Math.max(2, Math.min(24, slotWidth * .68))
    marks = days.map((day, index) => {
      const barHeight = day.contributionCount / maxOf(days) * (bottom - top)
      const x = n(left + index * slotWidth + (slotWidth - barWidth) / 2)
      const y = n(bottom - barHeight)
      const fill = day.contributionCount > 0 ? pointColor : stroke
      return `<rect class="graph-bar" x="${x}" y="${y}" width="${n(barWidth)}" height="${n(Math.max(2, barHeight))}" rx="${n(Math.min(5, barWidth / 2))}" fill="${fill}" fill-opacity="${day.contributionCount > 0 ? ".95" : ".28"}"><title>${escapeXml(day.date)}: ${day.contributionCount}</title></rect>`
    }).join("")
  } else {
    const showAll = options.type === "playful"
    const markers = points.filter(({ day, index }) => {
      if (minimal) return false
      if (terminal) return index % 3 === 0
      if (showAll) return true
      return day.contributionCount > 0
    }).map(({ x, y, day, index }) => {
      const radius = showAll ? (day.contributionCount > 0 ? 5 : 3) : options.type === "neon" ? 4 : 2.5
      const fill = showAll && index % 2 ? stroke : pointColor
      return `<circle class="graph-point" cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="#${options.colors.bgColor}" stroke-width="1.5"/>`
    }).join("")
    marks = `<path d="${path}" fill="none" stroke="${stroke}" stroke-width="${showAll ? 4 : terminal ? 2 : 2.8}" stroke-linecap="round" stroke-linejoin="round" ${terminal ? 'stroke-dasharray="8 4"' : ""} ${options.type === "neon" ? 'filter="url(#neon-glow)"' : ""} class="graph-line"/>${markers}`
  }

  const defs = `<defs><linearGradient id="activity-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#${options.colors.lineColor}" stop-opacity=".75"/><stop offset="100%" stop-color="#${options.colors.areaColor}" stop-opacity=".04"/></linearGradient><linearGradient id="mountain-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#${options.colors.areaColor}" stop-opacity=".72"/><stop offset="100%" stop-color="#${options.colors.areaColor}" stop-opacity=".04"/></linearGradient><filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`
  const areaMarkup = area && first && last && options.type !== "bar"
    ? `<path d="${areaPath}" fill="${options.type === "mountain" ? "url(#mountain-fill)" : areaFill}" fill-opacity="${options.type === "gradient" ? 1 : options.type === "minimal" ? .08 : .2}"/>`
    : ""
  const background = terminal ? `<rect x="${left}" y="${top}" width="${right-left}" height="${bottom-top}" rx="4" fill="#${options.colors.bgColor}" fill-opacity=".35"/>` : ""

  return `${defs}<g font-family="${terminal ? "monospace" : "inherit"}">${background}${grid}${yAxis}${areaMarkup}${marks}<g fill="${terminal ? "#7CFF8A" : `#${options.colors.color}`}" ${terminal ? 'font-size="10"' : ""}>${labels}</g></g>`
}

export function renderActivityGraph(data: ActivityData, options: GraphOptions) {
  const title = options.hideTitle ? "" : options.customTitle || (options.organization
    ? `${options.organization}'s Organization Activity Graph`
    : `${data.name || options.username}'s Contribution Graph`)
  const chart = graphBody(data.contributions, options)
  const c = options.colors
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${options.height}" viewBox="0 0 ${width} ${options.height}" fill="none" role="img" aria-label="${escapeXml(title || "GitHub activity graph")}"><rect x=".5" y=".5" width="calc(100% - 1px)" height="calc(100% - 1px)" rx="${options.radius}" fill="#${c.bgColor}" stroke="#${c.borderColor}" stroke-width="1"/><style>svg{font:600 18px 'Segoe UI',Ubuntu,Sans-Serif;user-select:none}.graph-line{stroke-dasharray:5000;stroke-dashoffset:5000;animation:draw 3s ease-in-out forwards}.graph-point{opacity:0;animation:appear .8s ease-out forwards}.graph-bar{transform-box:fill-box;transform-origin:bottom;animation:grow .8s ease-out both}@keyframes draw{to{stroke-dashoffset:0}}@keyframes appear{to{opacity:1}}@keyframes grow{from{transform:scaleY(0);opacity:.2}to{transform:scaleY(1);opacity:1}}@media(prefers-reduced-motion:reduce){.graph-line,.graph-point,.graph-bar{animation:none;opacity:1;stroke-dashoffset:0}}</style>${title ? `<text x="${width/2}" y="34" text-anchor="middle" fill="#${c.titleColor}" font-size="20" font-weight="700">${escapeXml(title)}</text>` : ""}${chart}</svg>`
}

export function invalidGraph(message: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="200" viewBox="0 0 420 200"><rect x=".5" y=".5" width="419" height="199" rx="5" fill="#44475a" stroke="#E4E2E2"/><text x="20" y="100" fill="#bd93f9" font-size="14">${escapeXml(message)}</text></svg>`
}
