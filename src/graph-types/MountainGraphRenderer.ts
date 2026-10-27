import { ContributionDay } from '../interfaces/interface';
import { GraphRenderOptions, GraphRenderer } from './types';
import { getGraphPoints, renderDateLabels, renderGrid, renderYAxis } from './svgHelpers';

export class MountainGraphRenderer implements GraphRenderer {
    async render(days: ContributionDay[], options: GraphRenderOptions): Promise<string> {
        const bounds = { left: 90, right: options.width - 42, top: 90, bottom: options.height - 58 };
        const points = getGraphPoints(days, options, {
            left: bounds.left,
            right: options.width - bounds.right,
            top: bounds.top,
            bottom: options.height - bounds.bottom,
        });
        const linePoints = points.map(({ x, y }) => `${x},${y}`).join(' ');
        const areaPath = points.length
            ? `M ${bounds.left},${bounds.bottom} L ${linePoints.replace(/ /g, ' L ')} L ${bounds.right},${bounds.bottom} Z`
            : '';
        const smoothLine = points.length
            ? `<polyline points="${linePoints}" fill="none" stroke="#${options.colors.lineColor}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
            : '';
        const markers = points.filter(({ day }) => day.contributionCount > 0).map(({ x, y }) =>
            `<circle cx="${x}" cy="${y}" r="3.5" fill="#${options.colors.pointColor}" stroke="#${options.colors.bgColor}" stroke-width="1.5"/>`
        ).join('');

        return `
            <g class="mountain-chart">
                <rect x="22" y="66" width="${options.width - 44}" height="${options.height - 86}" rx="12" fill="#${options.colors.bgColor}" stroke="#${options.colors.borderColor}"/>
                ${renderGrid(options, bounds)}
                ${renderYAxis(days, options, bounds)}
                <path d="${areaPath}" fill="#${options.colors.areaColor}" fill-opacity="${options.showArea ? '.35' : '.18'}"/>
                ${smoothLine}
                ${markers}
                ${renderDateLabels(points, options, bounds.bottom + 28)}
            </g>`;
    }
}
