import { ContributionDay } from '../interfaces/interface';
import { renderDateLabels, renderGrid, renderYAxis } from './svgHelpers';
import { GraphRenderOptions, GraphRenderer } from './types';

export class BarGraphRenderer implements GraphRenderer {
    async render(days: ContributionDay[], options: GraphRenderOptions): Promise<string> {
        const bounds = {
            left: 90,
            right: options.width - 50,
            top: 80,
            bottom: options.height - 70,
        };

        const chartWidth = bounds.right - bounds.left;
        const chartHeight = bounds.bottom - bounds.top;
        const maxValue = Math.max(
            1,
            ...days.map(({ contributionCount }) => contributionCount),
        );

        const slotWidth = chartWidth / Math.max(1, days.length);
        const barWidth = Math.max(2, Math.min(24, slotWidth * 0.68));

        const bars = days
            .map((day, index) => {
                const height = (day.contributionCount / maxValue) * chartHeight;
                const x = bounds.left + index * slotWidth + (slotWidth - barWidth) / 2;
                const y = bounds.bottom - height;
                const fill = day.contributionCount > 0
                    ? options.colors.pointColor
                    : options.colors.lineColor;
                const fillOpacity = day.contributionCount > 0 ? '.95' : '.28';
                const animationDelay = `${index * 0.025}s`;

                return `
                    <rect
                        class="graph-animated-bar"
                        x="${x}"
                        y="${y}"
                        width="${barWidth}"
                        height="${Math.max(2, height)}"
                        rx="${Math.min(5, barWidth / 2)}"
                        fill="#${fill}"
                        fill-opacity="${fillOpacity}"
                        style="animation-delay: ${animationDelay}"
                    >
                        <title>${day.date}: ${day.contributionCount}</title>
                    </rect>
                `;
            })
            .join('');

        const points = days.map((day, index) => ({
            x: bounds.left + index * slotWidth + slotWidth / 2,
            y: bounds.bottom,
            day,
            index,
        }));

        return `
            <g class="bar-chart">
                ${renderGrid(options, bounds)}
                ${renderYAxis(days, options, bounds)}
                ${bars}
                ${renderDateLabels(points, options, bounds.bottom + 28)}
            </g>
        `;
    }
}
