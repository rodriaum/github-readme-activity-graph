import moment from 'moment';
import { Response } from 'express';
import { Card } from './GraphCards';
import { invalidUserSvg } from './svgs';
import { selectColors } from './styles/themes';
import { isGraphType } from './graph-types';
import { QueryOption, UserDetails } from './interfaces/interface';

const HEX_COLOR_PATTERN = /^(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const MAX_DATE_RANGE_DAYS = 90;
const MAX_CUSTOM_TITLE_LENGTH = 120;

const safeColor = (value: unknown, fallback: string): string =>
    typeof value === 'string' && HEX_COLOR_PATTERN.test(value)
        ? value
        : fallback;

const boundedNumber = (
    value: unknown,
    fallback: number,
    min: number,
    max: number,
): number => {
    const parsed = typeof value === 'number'
        ? value
        : typeof value === 'string' && value.trim() !== ''
          ? Number(value)
          : Number.NaN;

    return Number.isFinite(parsed)
        ? Math.min(Math.max(parsed, min), max)
        : fallback;
};

export const isValidGitHubLogin = (login: string): boolean =>
    /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(login);

export class Utilities {
    public username: string;

    constructor(private readonly queryString: Record<string, unknown>) {
        this.username = typeof this.queryString.username === 'string'
            ? this.queryString.username.trim()
            : '';
    }

    private getColors() {
        const theme = typeof this.queryString.theme === 'string'
            ? this.queryString.theme
            : 'default';
        const themeColors = selectColors(theme);

        return {
            areaColor: safeColor(this.queryString.area_color, themeColors.areaColor),
            bgColor: safeColor(this.queryString.bg_color, themeColors.bgColor),
            borderColor: String(this.queryString.hide_border) === 'true'
                ? '0000'
                : safeColor(this.queryString.border_color, themeColors.borderColor),
            color: safeColor(this.queryString.color, themeColors.color),
            titleColor: safeColor(
                this.queryString.title_color,
                safeColor(this.queryString.color, themeColors.titleColor),
            ),
            lineColor: safeColor(this.queryString.line, themeColors.lineColor),
            pointColor: safeColor(this.queryString.point, themeColors.pointColor),
        };
    }

    private validateDays(days?: unknown): number {
        const parsed = typeof days === 'string' || typeof days === 'number' ? Number(days) : Number.NaN;
        return Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_DATE_RANGE_DAYS
            ? parsed
            : 31;
    }

    private validateDate(date?: unknown): boolean {
        return typeof date === 'string' && moment(date, 'YYYY-MM-DD', true).isValid();
    }

    private stringDateToUTC(date: string): string {
        return moment(date, 'YYYY-MM-DD', true).utc().toISOString();
    }

    private validateFromIsLessThanTwo(from: string, to: string): boolean {
        const fromDate = moment(from);
        const toDate = moment(to);
        const now = moment();

        return (
            fromDate.isBefore(toDate) &&
            toDate.diff(fromDate, 'days') <= MAX_DATE_RANGE_DAYS &&
            moment(fromDate).isSameOrBefore(now) &&
            moment(toDate).isSameOrBefore(now)
        );
    }

    private calculateNumberOfDaysFromDate(from: string, to: string): number {
        return moment(to).diff(moment(from), 'days');
    }

    public queryOptions() {
        const area = String(this.queryString.area) === 'true';
        const colors = this.getColors();
        const requestedType = typeof this.queryString.type === 'string'
            ? this.queryString.type
            : 'default';
        const type = requestedType === 'cartoon'
            ? 'playful'
            : isGraphType(requestedType)
              ? requestedType
              : 'default';

        let from = '';
        let to = '';
        let days = 31;

        const isFromValid = this.validateDate(this.queryString.from);
        const isToValid = this.validateDate(this.queryString.to);

        if (isFromValid && isToValid) {
            const requestedFrom = this.stringDateToUTC(this.queryString.from as string);
            const requestedTo = this.stringDateToUTC(this.queryString.to as string);

            if (this.validateFromIsLessThanTwo(requestedFrom, requestedTo)) {
                from = requestedFrom;
                to = requestedTo;
                days = this.calculateNumberOfDaysFromDate(from, to);
            }
        }

        const options: QueryOption = {
            username: this.username,
            hide_title: String(this.queryString.hide_title) === 'true',
            radius: boundedNumber(this.queryString.radius, 0, 0, 16),
            colors,
            area,
            height: boundedNumber(this.queryString.height, 420, 200, 600),
            days: from && to ? days : this.validateDays(this.queryString.days),
            grid: String(this.queryString.grid) !== 'false',
            type,
            from,
            to,
        };

        if (typeof this.queryString.custom_title === 'string') {
            const title = this.queryString.custom_title
                .replace(/[\u0000-\u001f\u007f]/g, '')
                .slice(0, MAX_CUSTOM_TITLE_LENGTH);
            if (title) options.custom_title = title;
        }

        return options;
    }

    public async buildGraph(fetchCalendarData: string | UserDetails) {
        if (typeof fetchCalendarData === 'object') {
            const options = this.queryOptions();
            let title = '';

            if (!options.hide_title) {
                if (options.custom_title) {
                    title = options.custom_title;
                } else if (typeof this.queryString.organization === 'string' && this.queryString.organization.trim()) {
                    title = `${this.queryString.organization.trim()}'s Organization Activity Graph`;
                } else {
                    title = `${fetchCalendarData.name !== null ? fetchCalendarData.name : options.username}'s Contribution Graph`;
                }
            }

            const graph = new Card(
                options.height,
                1200,
                options.radius,
                options.colors,
                title,
                options.area,
                options.grid,
                options.type,
            );
            const getChart = await graph.buildGraph(fetchCalendarData.contributions);
            return {
                finalGraph: getChart,
                header: {
                    maxAge: 'public, max-age=1800',
                },
            };
        }

        return {
            finalGraph: invalidUserSvg(fetchCalendarData),
            header: { maxAge: 'no-store, max-age=0' },
        };
    }

    public setHttpHeader(res: Response, directivesAndAge: string): void {
        res.setHeader('Cache-Control', directivesAndAge);
        res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'");
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.type('image/svg+xml');
    }
}
