import { ContributionDay } from '../interfaces/interface';
import { getGraphPoints, renderDateLabels, renderGrid, renderYAxis } from './svgHelpers';
import { GraphRenderOptions, GraphRenderer } from './types';

export class PlayfulGraphRenderer implements GraphRenderer {
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

        const polyline = points
            .map(({ x, y }) => `${x},${y}`)
            .join(' ');

        const areaPath = points.length
            ? `M ${bounds.left},${bounds.bottom} L ${polyline.replace(/ /g, ' L ')} L ${bounds.right},${bounds.bottom} Z`
            : '';

        const line = points.length
            ? `
                <polyline
                    class="graph-animated-line"
                    points="${polyline}"
                    fill="none"
                    stroke="#${options.colors.lineColor}"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            `
            : '';

        const dots = points
            .map(({ x, y, day, index }) => {
                const radius = day.contributionCount > 0 ? 5 : 3;
                const fill = index % 2 === 0
                    ? options.colors.pointColor
                    : options.colors.lineColor;
                const animationDelay = `${index * 0.025}s`;

                return `
                    <circle
                        class="graph-animated-point"
                        cx="${x}"
                        cy="${y}"
                        r="${radius + 4}"
                        fill="#${fill}"
                        fill-opacity=".12"
                        style="animation-delay: ${animationDelay}"
                    />
                    <circle
                        class="graph-animated-point"
                        cx="${x}"
                        cy="${y}"
                        r="${radius}"
                        fill="#${fill}"
                        stroke="#${options.colors.bgColor}"
                        stroke-width="2"
                        style="animation-delay: ${animationDelay}"
                    />
                `;
            })
            .join('');

        return `
            <g class="playful-chart">
                ${renderGrid(options, bounds)}
                ${renderYAxis(days, options, bounds)}

                ${options.showArea
                    ? `
                        <path
                            d="${areaPath}"
                            fill="#${options.colors.areaColor}"
                            fill-opacity=".2"
                        />
                    `
                    : ''}

                ${line}
                ${dots}
                ${renderDateLabels(points, options, bounds.bottom + 28)}
            </g>
        `;
    }
}
