import { BarGraphRenderer } from './BarGraphRenderer';
import { PlayfulGraphRenderer } from './PlayfulGraphRenderer';
import { DefaultGraphRenderer } from './DefaultGraphRenderer';
import { MountainGraphRenderer } from './MountainGraphRenderer';
import { StyledGraphRenderer } from './StyledGraphRenderer';
import { GraphRenderer, GraphType } from './types';

const renderers: Record<GraphType, GraphRenderer> = {
    default: new DefaultGraphRenderer(),
    playful: new PlayfulGraphRenderer(),
    bar: new BarGraphRenderer(),
    mountain: new MountainGraphRenderer(),
    neon: new StyledGraphRenderer('neon'),
    minimal: new StyledGraphRenderer('minimal'),
    terminal: new StyledGraphRenderer('terminal'),
    gradient: new StyledGraphRenderer('gradient'),
};

export function getGraphRenderer(type: string): GraphRenderer {
    const graphType = isGraphType(type) ? type : 'default';

    return renderers[graphType];
}

export function isGraphType(type: string): type is GraphType {
    return Object.prototype.hasOwnProperty.call(renderers, type);
}

export function getGraphTypes(): GraphType[] {
    return Object.keys(renderers) as GraphType[];
}
