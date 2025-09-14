import { Constants } from "../utils/constants";

export const Sound = (function () {
    return class Sound {
        src: string;
        loaded: boolean;
        buffer: AudioBuffer | null;
        source: AudioBufferSourceNode;
        gain: GainNode;
        volume: number;

        static AudioCache = new Map<string, AudioBuffer>();
        static GlobalAudioContext: AudioContext = new AudioContext();

        constructor (src: string, volume: number = 1.0) {
            this.src = src;
            this.loaded = false;
            this.buffer = null;
            this.volume = volume;

            this.source = Sound.GlobalAudioContext.createBufferSource();
            this.source.buffer = this.buffer;

            this.gain = Sound.GlobalAudioContext.createGain();
            this.gain.gain.value = this.volume;

            this.source.connect(this.gain);
            this.gain.connect(Sound.GlobalAudioContext.destination);

            this.load(Sound.GlobalAudioContext);
        }

        async load (audioContext: AudioContext): Promise<void> {
            if (this.loaded) return;

            const cached = Sound.AudioCache.get(this.src);

            if (cached) {
                this.buffer = cached;
                this.loaded = true;
                return;
            }

            const response = await fetch(`${Constants.ORIGIN}${this.src}`);
            const arrayBuffer = await response.arrayBuffer();
            this.buffer = await audioContext.decodeAudioData(arrayBuffer);
            this.source.buffer = this.buffer;
            this.loaded = true;

            Sound.AudioCache.set(this.src, this.buffer);
        }

        play (audioContext: AudioContext = Sound.GlobalAudioContext): void {
            if (!this.loaded || !this.buffer) throw new Error('Sound not loaded');
            
            this.source.start(0);
        }
            
    }
})();