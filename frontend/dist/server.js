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
    const Python = spawn("python", [scriptPath], { cwd: path.dirname(scriptPath) });
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
        if (!res.headersSent) {
            res.status(500).send(`Failed to run: \n${err.message}`);
        }
    });
    Python.on("close", (code) => {
        if (res.headersSent)
            return;
        console.log("Python exited with code:", code);
        console.log("Raw Python stdout:", output);
        console.log("Python stderr:", errorOutput);
        try {
            const result = JSON.parse(output);
            const seen = result?.seen?.length
                ? result.seen.join(', ')
                : 'nothing';
            res.send(`I seeeeee youuuu *spy noises*: ${seen}`);
        }
        catch (error) {
            if (code === 0) {
                res.send(`
                ${output || '[no output]'}
            `);
            }
            else {
                res.status(500).send(`
                Python exited with code ${code}
                ${errorOutput || '[no stderr]'}
                ${output || '[no stdout]'}
                ${error.message}
            `);
            }
        }
    });
    console.log('Running:', scriptPath);
});
app.use(express.static(path.join(process.cwd(), 'public')));
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    run();
});
