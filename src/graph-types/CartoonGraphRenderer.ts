import { ContributionDay } from '../interfaces/interface';
import { GraphRenderOptions, GraphRenderer } from './types';
import { getGraphPoints, renderDateLabels, renderGrid, renderYAxis } from './svgHelpers';

export class CartoonGraphRenderer implements GraphRenderer {
    async render(days: ContributionDay[], options: GraphRenderOptions): Promise<string> {
        const bounds = {
            left: 90,
            right: options.width - 45,
            top: 94,
            bottom: options.height - 58,
        };
        const points = getGraphPoints(days, options, {
            left: bounds.left,
            right: options.width - bounds.right,
            top: bounds.top,
            bottom: options.height - bounds.bottom,
        });
        const polyline = points.map(({ x, y }) => `${x},${y}`).join(' ');
        const areaPath = points.length
            ? `M ${bounds.left},${bounds.bottom} L ${polyline.replace(/ /g, ' L ')} L ${bounds.right},${bounds.bottom} Z`
            : '';
        const line = points.length
            ? `<polyline points="${polyline}" fill="none" stroke="#${options.colors.lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
            : '';
        const dots = points.map(({ x, y, day, index }) => {
            const radius = day.contributionCount > 0 ? 5 : 3;
            const fill = index % 2 === 0 ? options.colors.pointColor : options.colors.lineColor;
            return `<circle cx="${x}" cy="${y}" r="${radius + 4}" fill="#${fill}" fill-opacity=".12"/><circle cx="${x}" cy="${y}" r="${radius}" fill="#${fill}" stroke="#${options.colors.bgColor}" stroke-width="2"/>`;
        }).join('');
        const total = days.reduce((sum, day) => sum + day.contributionCount, 0);
        const peak = Math.max(0, ...days.map(({ contributionCount }) => contributionCount));
        const summaryX = options.width - 250;

        return `
            <g class="cartoon-chart">
                <rect x="22" y="66" width="${options.width - 44}" height="${options.height - 86}" rx="18" fill="#${options.colors.bgColor}" stroke="#${options.colors.borderColor}" stroke-width="1.5"/>
                ${renderGrid(options, bounds)}
                ${renderYAxis(days, options, bounds)}
                ${options.showArea ? `<path d="${areaPath}" fill="#${options.colors.areaColor}" fill-opacity=".2"/>` : ''}
                ${line}
                ${dots}
                ${renderDateLabels(points, options, bounds.bottom + 28)}
                <g transform="translate(${summaryX}, 78)">
                    <rect width="186" height="42" rx="14" fill="#${options.colors.lineColor}" fill-opacity=".12" stroke="#${options.colors.lineColor}" stroke-opacity=".65"/>
                    <text x="14" y="17" fill="#${options.colors.color}" font-size="10" font-weight="600" letter-spacing="1">TOTAL CONTRIBUTIONS</text>
                    <text x="14" y="33" fill="#${options.colors.titleColor || options.colors.color}" font-size="13" font-weight="700">${total} · peak ${peak}</text>
                </g>
            </g>`;
    }
}
