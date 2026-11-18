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
        <html>
            <head>
                <title>WebSocket Example</title>
            </head>
            <body>
                <h1>WebSocket Example</h1>
                <p>Open the console to see WebSocket messages.</p>
                <input type="range" id="frequencySlider" min="400" max="5000" value="${state.frequency}">
                <span id="frequencyLabel">Frequency: ${state.frequency} Hz</span>
                <script>
                    const input = document.getElementById('frequencySlider');
                    const label = document.getElementById('frequencyLabel');
                    input.addEventListener('input', () => {
                        const value = input.value;
                        label.textContent = 'Frequency: ' + value + ' Hz';
                        fetch('/set-frequency?value=' + value);
                    });

                    const ws = new WebSocket('ws://' + location.host + '/ws');
                    ws.onmessage = (event) => {
                        console.log('Received from server:', event.data);
                    };
                </script>
            </body>
        </html>
    `);
});

app.get('/set-frequency', (c) => {
    const frequency = parseFloat(c.req.query('value') || '440');
    state.setState({ frequency });
    return c.text(`Frequency set to ${frequency}`);
});

app.get('/ws', upgradeWebSocket(c => {
    return {
        onOpen(event, ws) {
            ws.send('WebSocket connection established');
            wsConnections.add(ws);
        },
        onClose(event, ws) {
            console.log('WebSocket closed:', event.code, event.reason);
            wsConnections.delete(ws);
        }
    }
}));

state.addListener(newState => {
    for (const ws of wsConnections) {
        ws.send(JSON.stringify(newState.frequency));
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