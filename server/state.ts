export default class State {
    volume: number;
    frequency: number
    playing: boolean;
    sampleRate: number;

    private listeners: Set<(state: State) => void> = new Set();

    constructor() {
        this.volume = 1;
        this.frequency = 440;
        this.playing = false;
        this.sampleRate = 44100;
    }

    setState(newState: Partial<State>) {
        Object.assign(this, newState);
        this.notifyListeners();
    }

    getValues() {
        return [this.volume, this.frequency, this.playing, this.sampleRate];
    }

    addListener(listener: (state: State) => void) {
        this.listeners.add(listener);
    }

    removeListener(listener: (state: State) => void) {
        this.listeners.delete(listener);
    }

    notifyListeners() {
        for (const listener of this.listeners) {
            listener(this);
        }
    }

}