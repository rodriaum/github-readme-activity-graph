import { ContributionDay } from '../interfaces/interface';
import { getGraphPoints, renderDateLabels, renderGrid, renderYAxis } from './svgHelpers';
import { GraphRenderOptions, GraphRenderer } from './types';

export class MountainGraphRenderer implements GraphRenderer {
    async render(days: ContributionDay[], options: GraphRenderOptions): Promise<string> {
        const bounds = {
            left: 90,
            right: options.width - 50,
            top: 80,
            bottom: options.height - 70,
        };

        const points = getGraphPoints(days, options, {
            left: bounds.left,
            right: options.width - bounds.right,
            top: bounds.top,
            bottom: options.height - bounds.bottom,
        });

        const curvePath = points.reduce((path, point, index) => {
            if (index === 0) return `M ${point.x},${point.y}`;
            const previous = points[index - 1];
            const middleX = (previous.x + point.x) / 2;
            return `${path} C ${middleX},${previous.y} ${middleX},${point.y} ${point.x},${point.y}`;
        }, '');

        const areaPath = points.length
            ? `M ${bounds.left},${bounds.bottom} L ${bounds.left},${points[0].y} ${curvePath.slice(curvePath.indexOf(' C'))} L ${bounds.right},${bounds.bottom} Z`
            : '';

        const markers = points
            .filter(({ day }) => day.contributionCount > 0)
            .map(({ x, y, index }) => `
                <circle
                    cx="${x}"
                    cy="${y}"
                    r="2.5"
                    fill="#${options.colors.pointColor}"
                    stroke="#${options.colors.bgColor}"
                    stroke-width="1.5"
                    class="graph-animated-point"
                    style="animation-delay:${index * 0.02}s"
                />
            `).join('');

        return `
            <defs>
                <linearGradient id="mountain-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#${options.colors.areaColor}" stop-opacity=".72"/>
                    <stop offset="100%" stop-color="#${options.colors.areaColor}" stop-opacity=".04"/>
                </linearGradient>
            </defs>
            <g class="mountain-chart">
                ${renderGrid(options, bounds)}
                ${renderYAxis(days, options, bounds)}
                <path d="${areaPath}" fill="url(#mountain-fill)"/>
                <path d="${curvePath}" fill="none" stroke="#${options.colors.lineColor}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" class="graph-animated-line"/>
                ${markers}
                ${renderDateLabels(points, options, bounds.bottom + 28)}
            </g>
        `;
    }
}
