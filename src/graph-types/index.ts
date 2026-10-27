import { BarGraphRenderer } from './BarGraphRenderer';
import { CartoonGraphRenderer } from './CartoonGraphRenderer';
import { DefaultGraphRenderer } from './DefaultGraphRenderer';
import { MountainGraphRenderer } from './MountainGraphRenderer';
import { GraphRenderer, GraphType } from './types';

const renderers: Record<GraphType, GraphRenderer> = {
    default: new DefaultGraphRenderer(),
    cartoon: new CartoonGraphRenderer(),
    bar: new BarGraphRenderer(),
    mountain: new MountainGraphRenderer(),
};

export function getGraphRenderer(type: string): GraphRenderer {
    return renderers[isGraphType(type) ? type : 'default'];
}

export function isGraphType(type: string): type is GraphType {
    return Object.prototype.hasOwnProperty.call(renderers, type);
}

export function getGraphTypes(): GraphType[] {
    return Object.keys(renderers) as GraphType[];
}
