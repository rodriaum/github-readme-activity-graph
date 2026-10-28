import { graphSvg, invalidUserSvg } from '../src/svgs';
import { Card } from '../src/GraphCards';
import { fakeGraphArgs, fakeQueryStringRes } from './fakeInputs';

describe('SVG Testing', () => {
    //- Svg testing ✔
    it('Test SVGs', () => {
        let fakeInvalidSvgArg = 'User not found!';
        expect.assertions(4);
        expect(graphSvg(fakeGraphArgs)).toEqual(expect.any(String));
        expect(graphSvg(fakeGraphArgs)).toMatchSnapshot();
        expect(invalidUserSvg(fakeInvalidSvgArg)).toEqual(expect.any(String));
        expect(invalidUserSvg(fakeInvalidSvgArg)).toMatchSnapshot();
    });

    //- Svg testing Promise<string> (GrapgCards.ts)✔
    it('chart SVGs', async () => {
        expect.assertions(1);
        expect(
            await new Card(
                420,
                1200,
                fakeQueryStringRes[0].radius,
                fakeQueryStringRes[0].colors,
                "xyz's Contribution Graph",
                fakeQueryStringRes[0].area,
            ).buildGraph([
                {
                    contributionCount: 2,
                    date: '1',
                },
                {
                    contributionCount: 3,
                    date: '2',
                },
                {
                    contributionCount: 10,
                    date: '1',
                },
                {
                    contributionCount: 12,
                    date: '1',
                },
                {
                    contributionCount: 14,
                    date: '1',
                },
            ]),
        ).toMatchSnapshot();
    });
    it('supports all registered graph types', async () => {
        const days = [
            { contributionCount: 0, date: '2026-10-20' },
            { contributionCount: 4, date: '2026-10-21' },
            { contributionCount: 2, date: '2026-10-22' },
        ];
        for (const type of ['cartoon', 'bar', 'mountain'] as const) {
            const svg = await new Card(
                420,
                1200,
                8,
                fakeQueryStringRes[0].colors,
                'Activity Graph',
                true,
                true,
                type,
            ).buildGraph(days);
            expect(svg).toContain('<svg');
            expect(svg).toContain('Activity Graph');
        }
    });

});
