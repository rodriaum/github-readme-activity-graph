import { ContributionDay } from '../interfaces/interface';
import { GraphRenderOptions, GraphRenderer } from './types';
import { renderDateLabels, renderGrid, renderYAxis } from './svgHelpers';

export class BarGraphRenderer implements GraphRenderer {
    async render(days: ContributionDay[], options: GraphRenderOptions): Promise<string> {
        const bounds = { left: 90, right: options.width - 42, top: 88, bottom: options.height - 58 };
        const chartWidth = bounds.right - bounds.left;
        const chartHeight = bounds.bottom - bounds.top;
        const maxValue = Math.max(1, ...days.map(({ contributionCount }) => contributionCount));
        const slotWidth = chartWidth / Math.max(1, days.length);
        const barWidth = Math.max(2, Math.min(24, slotWidth * 0.68));
        const bars = days.map((day, index) => {
            const height = (day.contributionCount / maxValue) * chartHeight;
            const x = bounds.left + index * slotWidth + (slotWidth - barWidth) / 2;
            const y = bounds.bottom - height;
            const fill = day.contributionCount > 0 ? options.colors.pointColor : options.colors.lineColor;
            return `<rect x="${x}" y="${y}" width="${barWidth}" height="${Math.max(2, height)}" rx="${Math.min(5, barWidth / 2)}" fill="#${fill}" fill-opacity="${day.contributionCount > 0 ? '.95' : '.28'}"><title>${day.date}: ${day.contributionCount}</title></rect>`;
        }).join('');
        const points = days.map((day, index) => ({
            x: bounds.left + index * slotWidth + slotWidth / 2,
            y: bounds.bottom,
            day,
            index,
        }));

        return `
            <g class="bar-chart">
                <rect x="22" y="66" width="${options.width - 44}" height="${options.height - 86}" rx="12" fill="#${options.colors.bgColor}" stroke="#${options.colors.borderColor}"/>
                ${renderGrid(options, bounds)}
                ${renderYAxis(days, options, bounds)}
                ${bars}
                ${renderDateLabels(points, options, bounds.bottom + 28)}
            </g>`;
    }
}
