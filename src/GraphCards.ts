import { Colors, ContributionDay } from './interfaces/interface';
import { graphSvg } from './svgs';
import { getGraphRenderer } from './graph-types';
import { GraphType } from './graph-types/types';

export class Card {
    constructor(
        private readonly height: number,
        private readonly width: number,
        private readonly radius: number,
        private readonly colors: Colors,
        private readonly title = '',
        private readonly area = false,
        private readonly showGrid = true,
        private readonly type: GraphType = 'default',
    ) {}

    async buildGraph(days: ContributionDay[]): Promise<string> {
        const renderer = getGraphRenderer(this.type);
        const chart = await renderer.render(days, {
            width: this.width,
            height: this.height,
            colors: this.colors,
            showGrid: this.showGrid,
            showArea: this.area,
        });

        return graphSvg({
            height: this.height,
            width: this.width,
            colors: this.colors,
            title: this.title,
            radius: this.radius,
            line: chart,
            type: this.type,
        });
    }
}
