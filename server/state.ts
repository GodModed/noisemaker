type Control =
    | { type: 'slider'; min: number; max: number }
    | { type: 'checkbox' };

class Setting {
    private _selector = `cls-${Math.random().toString(36).substring(2, 9)}`;

    constructor(
        public attribute: string,
        public value: number,
        public control: Control,
    ) {}

    getHTML(): string {
        return `
            <div class="${this._selector}">
                <p>
                    ${this.attribute}: ${this.value}
                </p>
                ${this.getInput()
            }
            </div>
            <style>
                .${this._selector} {
                    border: 1px solid black;
                    margin: 4px auto;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                }
            </style>
            <script>
            
            (() => {
                const setting = document.querySelector(".${this._selector}");
                const label = setting.querySelector("p");
                const input = setting.querySelector("input");

                let value = ${this.value};

                input.addEventListener('input', (e) => {
                    const target = e.target;
                    const nextValue = target.type === 'checkbox'
                        ? Number(target.checked)
                        : Number(target.value);

                    if (target.type === 'checkbox') {
                        target.checked = Boolean(value);
                    } else {
                        target.value = value;
                    }

                    ws.send(JSON.stringify({
                        [${JSON.stringify(this.attribute)}]: nextValue
                    }));
                    
                });

                ws.addEventListener('message', (e) => {
                    const newSettings = JSON.parse(e.data);
                    const nextValue = newSettings[${JSON.stringify(this.attribute)}];

                    if (nextValue !== undefined) {
                        value = nextValue;
                        label.textContent = ${JSON.stringify(this.attribute + ': ')} + nextValue;
                        input.type === 'checkbox'
                            ? input.checked = Boolean(nextValue)
                            : input.value = nextValue;
                    }
                });

            })();

            </script>
        `;
    }

    private getInput(): string {
        if (this.control.type === 'checkbox') {
            return `<input type="checkbox" ${this.value ? 'checked' : ''} />`;
        }

        const { min, max } = this.control;
        const step = Math.min(1, (max - min) / 100);
        return `<input type="range" min="${min}" max="${max}" value="${this.value}" step="${step}" />`;
    }
}

type SettingKey = 'volume' | 'frequency' | 'playing' | 'sampleRate';
type SettingState = Partial<Record<SettingKey, number>>;

export default class State {
    volume = new Setting('volume', 0.5, { type: 'slider', min: 0, max: 1 });
    frequency = new Setting('frequency', 1000, { type: 'slider', min: 300, max: 17500 });
    playing = new Setting('playing', 1, { type: 'checkbox' });
    sampleRate = new Setting('sampleRate', 16000, { type: 'slider', min: 8000, max: 48000 });

    private _listeners = new Set<(state: State) => void>();

    entries(): [SettingKey, Setting][] {
        return [
            ['volume', this.volume],
            ['frequency', this.frequency],
            ['playing', this.playing],
            ['sampleRate', this.sampleRate],
        ];
    }

    setState(newState: SettingState) {
        for (const [key, setting] of this.entries()) {
            const value = newState[key];
            if (typeof value === 'number' && Number.isFinite(value)) {
                setting.value = value;
            }
        }
        this.notifyListeners();
    }

    getValues() {
        return this.entries().map(([, setting]) => setting);
    }

    addListener(listener: (state: State) => void) {
        this._listeners.add(listener);
    }

    removeListener(listener: (state: State) => void) {
        this._listeners.delete(listener);
    }

    notifyListeners() {
        for (const listener of this._listeners) {
            listener(this);
        }
    }

}