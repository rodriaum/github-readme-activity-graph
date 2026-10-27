import { GraphArgs } from './interfaces/interface';
import { pointAnimation, lineAnimation } from './styles/graphAnimation';
import { graphStyle } from './styles/graphStyle';

export const graphSvg = (props: GraphArgs) => `
    <svg
        width="${props.width}"
        height="${props.height}"
        viewBox="0 0 ${props.width} ${props.height}"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <rect
            data-testid="card_bg"
            id="cardBg"
            x="0"
            y="0"
            rx="${props.radius}"
            height="100%"
            width="100%"
            fill="#${props.colors.bgColor}"
            fill-opacity="1"
            stroke="#${props.colors.borderColor}"
            stroke-opacity="1"
            stroke-width="1"
        />

        <style>
            body {
                font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
            }

            .header {
                font: 700 20px 'Segoe UI', Ubuntu, Sans-Serif;
                text-align: center;
                color: #${props.colors.titleColor ?? props.colors.color};
                margin-top: 20px;
            }

            svg {
                font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
                user-select: none;
            }

            ${(!props.type || props.type === 'default')
                ? graphStyle(
                    props.colors.color,
                    props.colors.lineColor,
                    props.colors.pointColor,
                    props.colors.areaColor,
                )
                : ''}

            ${pointAnimation() + lineAnimation()}

            .graph-animated-line {
                stroke-dasharray: 5000;
                stroke-dashoffset: 5000;
                animation: dash 5s ease-in-out forwards;
            }

            .graph-animated-point {
                opacity: 0;
                animation: blink 1s ease-in-out forwards;
            }

            .graph-animated-bar {
                transform-box: fill-box;
                transform-origin: bottom;
                animation: bar-grow .8s ease-out both;
            }

            @keyframes bar-grow {
                from {
                    transform: scaleY(0);
                    opacity: .2;
                }

                to {
                    transform: scaleY(1);
                    opacity: 1;
                }
            }
        </style>

        <foreignObject
            x="0"
            y="0"
            width="${props.width}"
            height="50"
        >
            <h1
                xmlns="http://www.w3.org/1999/xhtml"
                class="header"
            >
                ${props.title}
            </h1>
        </foreignObject>

        ${props.line}
    </svg>
`;

export const invalidUserSvg = (data: string) => `
    <svg
        width="400"
        height="200"
        viewBox="0 0 420 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <style>
            svg {
                font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif;
            }
        </style>

        <rect
            data-testid="card_bg"
            id="cardBg"
            x="0.5"
            y="0.5"
            rx="4.5"
            height="100%"
            width="100%"
            fill="#44475a"
            fill-opacity="1"
            stroke="#E4E2E2"
            stroke-opacity="1"
        />

        <text
            x="20"
            y="100"
            fill="#bd93f9"
        >
            ${data}
        </text>
    </svg>
`;
