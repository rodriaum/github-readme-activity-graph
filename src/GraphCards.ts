import { createGraph } from './createChart';
import { graphSvg } from './svgs';
import { Colors, ContributionDay } from './interfaces/interface';

export class Card {
    constructor(
        private readonly height: number,
        private readonly width: number,
        private readonly radius: number,
        private readonly colors: Colors,
        private readonly title = '',
        private readonly area = false,
        private readonly showGrid = true,
        private readonly type = 'default',
    ) {}

    private getOptions() {
        return {
            width: this.width,
            height: this.height,
            axisY: {
                title: 'Contributions',
                onlyInteger: true,
                offset: 70,
                labelOffset: { y: 4.5 },
                low: 0,
                showGrid: this.showGrid,
            },
            axisX: {
                title: 'Days',
                offset: 50,
                labelOffset: { x: -4.5 },
                showGrid: this.showGrid,
            },
            chartPadding: {
                top: 80,
                right: 50,
                bottom: 20,
                left: 20,
            },
            showArea: this.area,
            fullWidth: true,
        };
    }

    private buildCartoonGraph(days: ContributionDay[]): string {
        const left = 90;
        const right = this.width - 45;
        const top = 94;
        const bottom = this.height - 58;
        const maxValue = Math.max(1, ...days.map((day) => day.contributionCount));
        const points = days.map((day, index) => {
            const x = left + (index / Math.max(1, days.length - 1)) * (right - left);
            const y = bottom - (day.contributionCount / maxValue) * (bottom - top);
            return { x, y, day };
        });
        const yTicks = 4;
        const grid = this.showGrid
            ? Array.from({ length: yTicks + 1 }, (_, index) => {
                  const y = top + (index / yTicks) * (bottom - top);
                  return `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="#${this.colors.color}" stroke-opacity=".13" stroke-dasharray="5 6"/>`;
              }).join('')
            : '';
        const labels = points.map(({ x, day }, index) => {
            if (points.length > 18 && index % Math.ceil(points.length / 12) !== 0 && index !== points.length - 1) return '';
            const label = String(day.date).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<text x="${x}" y="${bottom + 28}" text-anchor="middle" fill="#${this.colors.color}" font-size="12">${label}</text>`;
        }).join('');
        const pointsLine = points.map(({ x, y }) => `${x},${y}`).join(' ');
        const areaPath = points.length
            ? `M ${left},${bottom} L ${pointsLine.replace(/ /g, ' L ')} L ${right},${bottom} Z`
            : '';
        const line = points.length ? `<polyline points="${pointsLine}" fill="none" stroke="#${this.colors.lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : '';
        const dots = points.map(({ x, y, day }, index) => {
            const radius = day.contributionCount > 0 ? 5 : 3;
            const fill = index % 2 === 0 ? this.colors.pointColor : this.colors.lineColor;
            return `<circle cx="${x}" cy="${y}" r="${radius + 3}" fill="#${fill}" fill-opacity=".12"/><circle cx="${x}" cy="${y}" r="${radius}" fill="#${fill}" stroke="#${this.colors.bgColor}" stroke-width="2"/>`;
        }).join('');
        const yLabels = Array.from({ length: yTicks + 1 }, (_, index) => {
            const value = Math.round((maxValue * (yTicks - index)) / yTicks);
            const y = top + (index / yTicks) * (bottom - top) + 4;
            return `<text x="${left - 16}" y="${y}" text-anchor="end" fill="#${this.colors.color}" font-size="12">${value}</text>`;
        }).join('');
        const total = days.reduce((sum, day) => sum + day.contributionCount, 0);
        const peak = Math.max(0, ...days.map((day) => day.contributionCount));
        const areaSvg = this.area ? `<path d="${areaPath}" fill="#${this.colors.areaColor}" fill-opacity=".2"/>` : '';
        return `
            <g class="cartoon-chart">
                <rect x="22" y="66" width="${this.width - 44}" height="${this.height - 86}" rx="18" fill="#${this.colors.bgColor}" stroke="#${this.colors.borderColor}" stroke-width="1.5"/>
                ${grid}
                ${yLabels}
                ${areaSvg}
                ${line}
                ${dots}
                ${labels}
                <g transform="translate(${this.width - 250}, 78)">
                    <rect width="186" height="42" rx="14" fill="#${this.colors.lineColor}" fill-opacity=".12" stroke="#${this.colors.lineColor}" stroke-opacity=".65"/>
                    <text x="14" y="17" fill="#${this.colors.color}" font-size="10" font-weight="600" letter-spacing="1">TOTAL CONTRIBUTIONS</text>
                    <text x="14" y="33" fill="#${this.colors.titleColor || this.colors.color}" font-size="13" font-weight="700">${total} · peak ${peak}</text>
                </g>
            </g>`;
    }

    async buildGraph(days: ContributionDay[]): Promise<string> {
        if (this.type === 'cartoon') {
            return graphSvg({
                height: this.height,
                width: this.width,
                colors: this.colors,
                title: this.title,
                radius: this.radius,
                line: this.buildCartoonGraph(days),
                type: 'cartoon',
            });
        }

        const options = this.getOptions();
        const line: Promise<string> = await createGraph('line', options, {
            labels: days.map((day) => day.date),
            series: [{ value: days.map((day) => day.contributionCount) }],
        });

        return graphSvg({
            height: this.height,
            width: this.width,
            colors: this.colors,
            title: this.title,
            radius: this.radius,
            line,
            type: 'default',
        });
    }
}
