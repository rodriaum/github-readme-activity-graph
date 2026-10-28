import { createGraph } from '../createChart';
import { ContributionDay } from '../interfaces/interface';
import { GraphRenderOptions, GraphRenderer } from './types';

export class DefaultGraphRenderer implements GraphRenderer {
    async render(days: ContributionDay[], options: GraphRenderOptions): Promise<string> {
        return createGraph('line', {
            width: options.width,
            height: options.height,
            axisY: {
                title: 'Contributions',
                onlyInteger: true,
                offset: 70,
                labelOffset: { y: 4.5 },
                low: 0,
                showGrid: options.showGrid,
            },
            axisX: {
                title: 'Days',
                offset: 50,
                labelOffset: { x: -4.5 },
                showGrid: options.showGrid,
            },
            chartPadding: { top: 80, right: 50, bottom: 20, left: 20 },
            showArea: options.showArea,
            fullWidth: true,
        }, {
            labels: days.map(({ date }) => date),
            series: [{ value: days.map(({ contributionCount }) => contributionCount) }],
        });
    }
}
