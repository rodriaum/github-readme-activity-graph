import { ContributionDay } from '../interfaces/interface';
import { GraphRenderOptions } from './types';

export interface GraphPoint {
    x: number;
    y: number;
    day: ContributionDay;
    index: number;
}

export interface ChartBounds {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface ChartPadding {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export function getGraphPoints(
    days: ContributionDay[],
    options: GraphRenderOptions,
    padding: ChartPadding = {
        left: 88,
        right: 42,
        top: 82,
        bottom: 54,
    },
): GraphPoint[] {
    const chartWidth = options.width - padding.left - padding.right;
    const chartHeight = options.height - padding.top - padding.bottom;
    const maxValue = Math.max(
        1,
        ...days.map(({ contributionCount }) => contributionCount),
    );

    return days.map((day, index) => ({
        x: padding.left + (index / Math.max(1, days.length - 1)) * chartWidth,
        y: padding.top + chartHeight - (day.contributionCount / maxValue) * chartHeight,
        day,
        index,
    }));
}

export function renderGrid(
    options: GraphRenderOptions,
    bounds: ChartBounds,
    ticks = 4,
): string {
    if (!options.showGrid) {
        return '';
    }

    return Array.from({ length: ticks + 1 }, (_, index) => {
        const y = bounds.top + (index / ticks) * (bounds.bottom - bounds.top);

        return `
            <line
                x1="${bounds.left}"
                y1="${y}"
                x2="${bounds.right}"
                y2="${y}"
                stroke="#${options.colors.color}"
                stroke-opacity=".14"
                stroke-dasharray="4 6"
            />
        `;
    }).join('');
}

export function renderYAxis(
    days: ContributionDay[],
    options: GraphRenderOptions,
    bounds: ChartBounds,
    ticks = 4,
): string {
    const maxValue = Math.max(
        1,
        ...days.map(({ contributionCount }) => contributionCount),
    );

    return Array.from({ length: ticks + 1 }, (_, index) => {
        const value = Math.round((maxValue * (ticks - index)) / ticks);
        const y = bounds.top + (index / ticks) * (bounds.bottom - bounds.top) + 4;

        return `
            <text
                x="${bounds.left - 14}"
                y="${y}"
                text-anchor="end"
                fill="#${options.colors.color}"
                font-size="12"
            >
                ${value}
            </text>
        `;
    }).join('');
}

export function renderDateLabels(
    points: GraphPoint[],
    options: GraphRenderOptions,
    y: number,
): string {
    const interval = Math.max(1, Math.ceil(points.length / 12));

    return points
        .map(({ x, day, index }) => {
            const shouldShowLabel =
                points.length <= 18 ||
                index % interval === 0 ||
                index === points.length - 1;

            if (!shouldShowLabel) {
                return '';
            }

            const label = escapeSvgText(day.date);

            return `
                <text
                    x="${x}"
                    y="${y}"
                    text-anchor="middle"
                    fill="#${options.colors.color}"
                    font-size="11"
                >
                    ${label}
                </text>
            `;
        })
        .join('');
}

export function escapeSvgText(value: string): string {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
