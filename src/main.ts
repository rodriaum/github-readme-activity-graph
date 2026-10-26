import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { Handlers } from './handlers';
import { GitHubOAuth } from './auth';

const app: Application = express();
const port = process.env.PORT || 5100;
const rootDir = process.cwd();

app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.get('/styles.css', (_req, res) => {
    res.sendFile(path.resolve(rootDir, 'styles.css'));
});

app.get('/script.js', (_req, res) => {
    res.sendFile(path.resolve(rootDir, 'script.js'));
});

app.use('/asset', express.static(path.resolve(rootDir, 'asset'), { dotfiles: 'deny' }));

const handlers = new Handlers();
const githubOAuth = new GitHubOAuth();

app.get('/', handlers.getRoot);
// Get Graph
app.get('/graph', handlers.getGraph);

app.get('/data', handlers.getData);

app.get('/auth/github', (req, res) => githubOAuth.start(req, res));
app.get('/auth/github/callback', (req, res) => githubOAuth.callback(req, res));
app.get('/auth/status', (req, res) => githubOAuth.status(req, res));
app.get('/auth/logout', (req, res) => githubOAuth.logout(req, res));

app.listen(port, (): void => {
    console.log(`Server is Running on Port ${port}`);
});
