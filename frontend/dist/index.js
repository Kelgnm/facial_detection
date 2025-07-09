var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { spawn } from 'child_process';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const open = (yield import('open')).default;
    yield open(`http://localhost:${port}`);
});
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const html = path.resolve(process.cwd(), 'public', 'index.html');
});
app.get('/run-python', (req, res) => {
    const scriptPath = path.resolve(process.cwd(), 'src', 'scripts', 'image.py');
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
        if (!res.headersSent) {
            res.status(500).send(`Failed to run: <br><pre>${err.message}</pre>`);
        }
    });
    Python.on("close", (code) => {
        if (res.headersSent)
            return;
        if (code === 0) {
            res.send(`Python script finished with code ${code}:<br>${output}`);
        }
        else {
            res.status(500).send(`Error code ${code}<br><pre>${errorOutput}</pre>`);
        }
        try {
            const result = JSON.parse(output);
            res.send(`I see youuuuu *spy noises* ${result.seen}`);
        }
        catch (error) {
            res.status(500).send('Could not parse Python output.');
        }
    });
    console.log('Running:', scriptPath);
});
app.use(express.static(path.join(process.cwd(), 'public')));
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
run();
