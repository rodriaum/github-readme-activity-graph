import { Colors, ContributionDay } from '../interfaces/interface';

export interface GraphRenderOptions {
    width: number;
    height: number;
    colors: Colors;
    showGrid: boolean;
    showArea: boolean;
}

export interface GraphRenderer {
    render(days: ContributionDay[], options: GraphRenderOptions): Promise<string>;
}

export type GraphType = 'default' | 'cartoon' | 'bar' | 'mountain';
