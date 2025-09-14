import { Constants } from "../utils/constants";

export const Sound = (function () {
    return class Sound {
        src: string;
        loaded: boolean;
        buffer: AudioBuffer | null;
        volume: number;
        loadPromise: Promise<void>;

        static AudioCache = new Map<string, AudioBuffer>();
        static GlobalAudioContext: AudioContext = new AudioContext();

        constructor (src: string, volume: number = 1.0) {
            this.src = src;
            this.loaded = false;
            this.buffer = null;
            this.volume = volume;

            // Start loading immediately and store the promise
            this.loadPromise = this.load(Sound.GlobalAudioContext);
        }

        async load (audioContext: AudioContext): Promise<void> {
            if (this.loaded) return;

            const cached = Sound.AudioCache.get(this.src);

            if (cached) {
                this.buffer = cached;
                this.loaded = true;
                return;
            }

            try {
                const response = await fetch(`${Constants.ORIGIN}${this.src}`);
                const arrayBuffer = await response.arrayBuffer();
                this.buffer = await audioContext.decodeAudioData(arrayBuffer);
                this.loaded = true;

                Sound.AudioCache.set(this.src, this.buffer);
            } catch (error) {
                console.error(`Failed to load sound: ${this.src}`, error);
                throw error;
            }
        }

        async play (audioContext: AudioContext = Sound.GlobalAudioContext): Promise<void> {
            // Wait for loading to complete
            await this.loadPromise;
            
            if (!this.loaded || !this.buffer) {
                throw new Error('Sound not loaded');
            }

            // Create new source node each time (AudioBufferSourceNode can only be used once)
            const source = audioContext.createBufferSource();
            source.buffer = this.buffer;

            const gain = audioContext.createGain();
            gain.gain.value = this.volume;

            source.connect(gain);
            gain.connect(audioContext.destination);
            
            source.start(0);
        }

        // Alternative synchronous play method that doesn't throw if not loaded
        tryPlay (audioContext: AudioContext = Sound.GlobalAudioContext): void {
            if (this.loaded && this.buffer) {
                const source = audioContext.createBufferSource();
                source.buffer = this.buffer;

                const gain = audioContext.createGain();
                gain.gain.value = this.volume;

                source.connect(gain);
                gain.connect(audioContext.destination);
                
                source.start(0);
            }
            // Silently fail if not loaded yet
        }
    }
})();