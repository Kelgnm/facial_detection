import { IncomingMessage, ServerResponse } from "http";
import { parse } from "path";
export const handler = async (req: IncomingMessage, res: ServerResponse) => {
    console.log(`---- HTTP Method: ${req.method}, URL: ${req.url}`);
    console.log(`host: ${req.headers.host}`);

    const parsedURL = new URL(req.url ?? "", `http://${req.headers.host}`);
    console.log(`protocol: ${parsedURL.protocol}`);
    console.log(`hostname: ${parsedURL.hostname}`);
    console.log(`port: ${parsedURL.port}`);
    console.log(`pathname: ${parsedURL.pathname}`);
    parsedURL.searchParams.forEach((val, key) => {
        console.log(`Search param: ${key}: ${val}`);
    });

    if (req.method !== "GET" || parsedURL.pathname == "/favicon.ico") {
        res.writeHead(404, "GONE");
    } else {
        res.writeHead(200, "Good");
        if (!parsedURL.searchParams.has("keyword")) {
            res.write("Hello HTTP!");
        } else {
            res.write(`Hello, ${parsedURL.searchParams.get("keyword")}`);
        }
    }

    res.end();
};
