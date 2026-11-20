import { Hono } from 'hono';
import { logger } from 'hono/logger'
import { upgradeWebSocket, websocket } from '@hono/bun'
import type { WSContext } from 'hono/ws';
import State from './state';

const app = new Hono();
app.use(logger());

const wsConnections = new Set<WSContext>();
const state = new State();

app.get('/', (c) => {
    return c.html(`
        <!doctype html>
        <html>
            <head>
                <title>Noisemaker Manager</title>
            </head>
            <body>
                <h1>Noisemaker Manager</h1>

                <script>
                    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
                    const ws = new WebSocket(\`\${protocol}//\${location.host}/ws\`);
                </script>
                ${state.entries().map(([key, value]) => value.getHTML()).join('')}

            </body>
        </html>
    `);
});

app.get('/ws', upgradeWebSocket(c => {
    return {
        onOpen(event, ws) {
            wsConnections.add(ws);
        },
        onMessage(event, ws) {
            const partialState = JSON.parse(event.data.toString());
            state.setState(partialState);
        },
        onClose(event, ws) {
            console.log('WebSocket closed:', event.code, event.reason);
            wsConnections.delete(ws);
        }
    }
}));

state.addListener(newState => {
    for (const ws of wsConnections) {
        ws.send(JSON.stringify(newState.entries().reduce((result, [key, value]) => {
            result[key] = value.value;
            return result;
        }, {} as Record<string, unknown>)));
    }
});

export default {
    fetch: app.fetch,
    websocket: {
        ...websocket,
        idleTimeout: 30,
        sendPings: true
    },
};