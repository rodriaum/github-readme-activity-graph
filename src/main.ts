import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { Handlers } from './handlers';

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

app.get('/', handlers.getRoot);
app.get('/auth/github', handlers.beginOAuth.bind(handlers));
app.get('/auth/github/callback', handlers.finishOAuth.bind(handlers));
app.get('/auth/status', handlers.getAuthStatus.bind(handlers));
app.post('/auth/logout', handlers.logout.bind(handlers));
// Get Graph
app.get('/graph', handlers.getGraph);

app.get('/data', handlers.getData);

app.listen(port, (): void => {
    console.log(`Server is Running on Port ${port}`);
});
