import { Fetcher } from '../src/fetcher';
import {
    mockQueryCorrect,
    mockQueryIncorrect,
    mockFetchCorrect,
    mockFetchIncorrect,
} from './mockFunctions';
import { expectedQuery } from './fakeInputs';
import { UserDetails } from '../src/interfaces/interface';

describe('Fetching Tests', () => {
    const fetcher = new Fetcher('rodriaum');

    it('Query Test', () => {
        const expected = expectedQuery(
            'rodriaum',
            '2022-05-01T00:00:00.000+00:00',
            '2022-06-01T00:00:00.000+00:00',
        );
        expect(
            // @ts-ignore: testing private method
            fetcher.getGraphQLQuery(
                '2022-05-01T00:00:00.000+00:00',
                '2022-06-01T00:00:00.000+00:00',
            ),
        ).toEqual(expected);
    });

    it('Fetching Contributions Test', async () => {
        // @ts-ignore: mocking private method
        fetcher.getGraphQLQuery = mockQueryCorrect;
        // @ts-ignore: mocking private method
        fetcher.fetch = mockFetchCorrect;

        const data = await fetcher.fetchContributions(31);
        expect((data as UserDetails).contributions).toEqual(expect.any(Array));
        expect((data as UserDetails).contributions.length).toEqual(31);
        expect((data as UserDetails).name).toEqual('Ashutosh Dwivedi');

        // @ts-ignore: mocking private method
        fetcher.getGraphQLQuery = mockQueryIncorrect;
        // @ts-ignore: mocking private method
        fetcher.fetch = mockFetchIncorrect;

        const invalidData = await fetcher.fetchContributions(31);
        expect(invalidData).toEqual("Can't fetch any contribution. Please check your username 😬");
    });
});
