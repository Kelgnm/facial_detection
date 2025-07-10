import { spawn } from 'child_process';
import express from 'express';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { WebSocketServer } from 'ws';


declare module 'express-session' {
  interface SessionData {
    name?: string;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
// const wss = new WebSocketServer({ port: 3001 });

// app.use(
//   session({
//     secret: 'dasgasgewqgq',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: process.env.NODE_ENV === 'production' },
//   })
// );

const publicPath = path.join(__dirname, "..", "public");
app.use(express.static(publicPath));

// app.use((req, res, next) => {
//   res.locals.name = req.session.name || 'Guest';
//   next();
// });

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'public', 'index.html'));
});

app.get('/run-python', (req, res) => {
    const scriptPath = path.resolve(process.cwd(), '..', 'src', 'scripts', 'image.py');

    const Python = spawn("python3", [scriptPath], { cwd: path.dirname(scriptPath) });

    let output = '';

    Python.stdout.on('data', (data) => {
        output += data.toString();
    });

    Python.stderr.on("data", (data) => {
        console.error("Python error:", data.toString());
    });

    Python.on("error", (err) => {
        if(!res.headersSent) {
            res.status(500).send(`Failed to run: \n${err.message}`)
        }
    });

    Python.on("close", (code) => {
      if (res.headersSent) return;

      try {
        const result = JSON.parse(output);
        const seen = result?.seen?.length
          ? result.seen.join(', ')
          : 'nothing';

        res.json({ seen });
      } catch (error) {
        console.error("Failed to parse JSON:", output);
        res.status(500).json({
          error: "Failed to parse Python output",
          raw: output,
    });
  }
});


app.get('/get-user', (req, res) => {
  res.json({ name: req.session.name || 'Guest' });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// wss.on('connection', (ws) => {
//   console.log('WebSocket client connected');
//   ws.on('message', (message) => {
//   });

//   wss.clients.forEach((client) => {
//     if (client.readyState === 1) {
//       client.send(JSON.stringify({ frame: null, seen: 'Waiting for detection...' }));
//     }
//   });
// });

// import('ws').then(({ WebSocket }) => {
//   const pythonWs = new WebSocket('ws://localhost:3001');
//   pythonWs.on('message', (data) => {
//       try {
//         const str = data.toString().trim();
//         const message = JSON.parse(str);
//         wss.clients.forEach((client) => {
//           if (client.readyState === 1) {
//             client.send(JSON.stringify(message));
//           }
//         });
//       } catch (err) {
//         console.error('[WebSocket] JSON parse error:', err, '\nRaw data:', data.toString());
//       }
//   });
// });


    console.log('Running:', scriptPath);
});

app.listen(port, () =>  {
    console.log(`Server listening on port ${port}`);
    import('open').then((module) => {
    const open = module.default;
    open(`http://localhost:${port}`);
    });
});

