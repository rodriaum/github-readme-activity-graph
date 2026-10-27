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

        const linePoints = points
            .map(({ x, y }) => `${x},${y}`)
            .join(' ');

        const areaPath = points.length
            ? `M ${bounds.left},${bounds.bottom} L ${linePoints.replace(/ /g, ' L ')} L ${bounds.right},${bounds.bottom} Z`
            : '';

        const line = points.length
            ? `
                <polyline
                    class="graph-animated-line"
                    points="${linePoints}"
                    fill="none"
                    stroke="#${options.colors.lineColor}"
                    stroke-width="3"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                />
            `
            : '';

        const markers = points
            .filter(({ day }) => day.contributionCount > 0)
            .map(({ x, y, index }) => `
                <circle
                    class="graph-animated-point"
                    cx="${x}"
                    cy="${y}"
                    r="3.5"
                    fill="#${options.colors.pointColor}"
                    stroke="#${options.colors.bgColor}"
                    stroke-width="1.5"
                    style="animation-delay: ${index * 0.025}s"
                />
            `)
            .join('');

        return `
            <g class="mountain-chart">
                ${renderGrid(options, bounds)}
                ${renderYAxis(days, options, bounds)}

                <path
                    d="${areaPath}"
                    fill="#${options.colors.areaColor}"
                    fill-opacity="${options.showArea ? '.35' : '.18'}"
                />

                ${line}
                ${markers}
                ${renderDateLabels(points, options, bounds.bottom + 28)}
            </g>
        `;
    }
}
