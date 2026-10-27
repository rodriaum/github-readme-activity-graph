import { ContributionDay } from '../interfaces/interface';
import { getGraphPoints, renderDateLabels, renderGrid, renderYAxis } from './svgHelpers';
import { GraphRenderOptions, GraphRenderer } from './types';

type GraphStyle = 'neon' | 'minimal' | 'terminal' | 'gradient';

export class StyledGraphRenderer implements GraphRenderer {
    constructor(private readonly style: GraphStyle) {}

    async render(days: ContributionDay[], options: GraphRenderOptions): Promise<string> {
        const minimal = this.style === 'minimal';
        const terminal = this.style === 'terminal';
        const neon = this.style === 'neon';
        const bounds = {
            left: minimal ? 70 : 90,
            right: options.width - (minimal ? 35 : 50),
            top: 82,
            bottom: options.height - 70,
        };
        const points = getGraphPoints(days, options, {
            left: bounds.left,
            right: options.width - bounds.right,
            top: bounds.top,
            bottom: options.height - bounds.bottom,
        });
        const polyline = points.map(({ x, y }) => `${x},${y}`).join(' ');
        const linePath = terminal
            ? points.reduce((path, point, index) => {
                if (index === 0) return `M ${point.x},${point.y}`;
                const previous = points[index - 1];
                return `${path} L ${point.x},${previous.y} L ${point.x},${point.y}`;
            }, '')
            : points.reduce((path, point, index) => {
                if (index === 0) return `M ${point.x},${point.y}`;
                const previous = points[index - 1];
                const middleX = (previous.x + point.x) / 2;
                return `${path} C ${middleX},${previous.y} ${middleX},${point.y} ${point.x},${point.y}`;
            }, '');
        const areaPath = points.length
            ? `M ${bounds.left},${bounds.bottom} L ${points[0].x},${points[0].y} ${linePath.slice(linePath.indexOf(' ') + 1)} L ${bounds.right},${bounds.bottom} Z`
            : '';
        const gridOptions = minimal ? { ...options, showGrid: false } : options;
        const grid = renderGrid(gridOptions, bounds, terminal ? 5 : 4);
        const yAxis = minimal ? '' : renderYAxis(days, options, bounds);
        const dates = renderDateLabels(points, options, bounds.bottom + 28);
        const strokeWidth = neon ? 3.5 : minimal ? 2.2 : terminal ? 2 : 3;
        const strokeColor = terminal ? '#7CFF8A' : `#${options.colors.lineColor}`;
        const pointColor = terminal ? '#B6FFBE' : `#${options.colors.pointColor}`;
        const areaColor = this.style === 'gradient'
            ? 'url(#activity-gradient)'
            : `#${options.colors.areaColor}`;
        const glowDefs = neon ? `
            <defs>
                <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
            </defs>
        ` : '';
        const gradientDefs = this.style === 'gradient' ? `
            <defs>
                <linearGradient id="activity-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#${options.colors.lineColor}" stop-opacity=".75"/>
                    <stop offset="100%" stop-color="#${options.colors.areaColor}" stop-opacity=".04"/>
                </linearGradient>
            </defs>
        ` : '';
        const terminalBackground = terminal ? `
            <rect x="${bounds.left}" y="${bounds.top}" width="${bounds.right - bounds.left}" height="${bounds.bottom - bounds.top}" fill="#${options.colors.bgColor}" fill-opacity=".35" rx="4"/>
        ` : '';
        const area = points.length && (options.showArea || this.style === 'gradient')
            ? `<path d="${areaPath}" fill="${areaColor}" fill-opacity="${this.style === 'gradient' ? '1' : minimal ? '.08' : '.2'}"/>`
            : '';
        const line = points.length ? `
            <path d="${linePath}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" ${neon ? 'filter="url(#neon-glow)"' : ''} ${terminal ? 'stroke-dasharray="8 4"' : ''} class="graph-animated-line"/>
        ` : '';
        const markers = points.filter(({ day, index }) => neon ? day.contributionCount > 0 : terminal ? index % 3 === 0 : minimal ? false : day.contributionCount > 0)
            .map(({ x, y, index }) => `
                <circle cx="${x}" cy="${y}" r="${neon ? 4 : 3}" fill="${pointColor}" ${neon ? 'filter="url(#neon-glow)"' : ''} style="animation-delay:${index * .02}s" class="graph-animated-point"/>
            `).join('');

        return `
            ${glowDefs}
            ${gradientDefs}
            ${terminalBackground}
            <g font-family="${terminal ? 'monospace' : 'inherit'}">
                ${grid}
                ${yAxis}
                ${area}
                ${line}
                ${markers}
                <g fill="${terminal ? '#7CFF8A' : `#${options.colors.color}`}" ${terminal ? 'font-family="monospace" font-size="10"' : ''}>
                    ${dates}
                </g>
            </g>
        `;
    }
}
