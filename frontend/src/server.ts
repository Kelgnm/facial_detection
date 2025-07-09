import { spawn } from 'child_process';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const run = async () => {
  const open = (await import('open')).default;
  await open(`http://localhost:${port}`);
};

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/run-python', (req, res) => {
    const scriptPath = path.resolve(process.cwd(), '..', 'src', 'scripts', 'image.py');

    const Python = spawn("python3", [scriptPath], { cwd: path.dirname(scriptPath) });

    let output = '';
    let errorOutput = '';

    Python.stdout.on('data', (data) => {
        output += data.toString();
    });

    Python.stderr.on("data", (data) => {
        errorOutput += data.toString();
        console.error("Python error:", data.toString());
    });

    Python.on("error", (err) => {
        if(!res.headersSent) {
            res.status(500).send(`Failed to run: <br><pre>${err.message}</pre>`)
        }
    });

    Python.on("close", (code) => {
        if (res.headersSent) return;
        try {
            const result = JSON.parse(output);
            res.send(`I see youuuuu *spy noises* ${result.seen}`)
        } catch (err) {
            res
                .status(500)
                .send('Python exited with code ${code}<br><pre>${errorOutput || output}</pre>');
        }
    });

    console.log('Running:', scriptPath);
});

app.use(express.static(path.join(process.cwd(), 'public')));

app.listen(port, () =>  {
    console.log(`Server listening on port ${port}`);
    run();
});

