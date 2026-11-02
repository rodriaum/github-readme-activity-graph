import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { Handlers } from './handlers';
import { rateLimitGraphRequests } from './rateLimiter';

const app: Application = express();
const port = process.env.PORT || 5100;
const rootDir = process.cwd();

// Vercel terminates TLS and forwards the client IP through one trusted proxy.
if (process.env.VERCEL === '1') {
    app.set('trust proxy', 1);
}

const configuredOrigins = [
    process.env.ORIGIN_URL || 'https://github-act-graph.rodriaum.com',
    ...(process.env.CORS_ORIGINS || '').split(','),
];

const allowedOrigins = new Set(
    configuredOrigins
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => {
            try {
                return new URL(value).origin;
            } catch {
                return '';
            }
        })
        .filter(Boolean),
);

app.use(cors({
    origin: (origin, callback) => {
        // Non-browser clients do not send Origin and do not use CORS.
        callback(null, !origin || allowedOrigins.has(origin));
    },
    methods: ['GET', 'HEAD'],
    allowedHeaders: ['Content-Type'],
    maxAge: 600,
    credentials: false,
}));

app.use(express.urlencoded({ extended: false, limit: '10kb' }));

app.get('/styles.css', (_req, res) => {
    res.sendFile(path.resolve(rootDir, 'styles.css'));
});

app.get('/script.js', (_req, res) => {
    res.sendFile(path.resolve(rootDir, 'script.js'));
});

app.use('/asset', express.static(path.resolve(rootDir, 'asset'), { dotfiles: 'deny' }));

const handlers = new Handlers();

// The limiter is shared by both expensive endpoints within this process.
app.get('/graph', rateLimitGraphRequests, handlers.getGraph);
app.get('/data', rateLimitGraphRequests, handlers.getData);

app.get('/', handlers.getRoot);

app.listen(port, (): void => {
    console.log(`Server is Running on Port ${port}`);
});
