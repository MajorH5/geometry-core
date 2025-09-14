export class SplashScreen {
    private container: HTMLDivElement;
    private currentStep = 0;

    constructor(container: HTMLDivElement) {
        this.container = container;
    }

    public async start(): Promise<void> {
        return new Promise((resolve) => {
            this.playSequence(resolve);
        });
    }

    private playSequence(onComplete: () => void): void {
        // The container IS the splash screen element
        const splash = this.container;
        const logo1 = this.container.querySelector('.logo-1') as HTMLElement;
        const logo2 = this.container.querySelector('.logo-2') as HTMLElement;
        const floatingElements = this.container.querySelector('.floating-elements') as HTMLElement;

        if (!logo1 || !logo2 || !floatingElements) {
            console.error('Could not find required elements');
            onComplete();
            return;
        }

        // Ensure splash is visible
        splash.style.opacity = '1';

        // Start floating elements animation immediately
        floatingElements.style.animation = 'floatingElements 8s ease-in-out infinite';

        // Sequence timeline with proper timing
        const timeline = [
            // Show first logo with zoom and fade in
            { time: 500, action: () => {
                console.log('Showing logo 1');
                logo1.classList.add('zoom-in');
            }},
            // Hide first logo
            { time: 2500, action: () => {
                console.log('Hiding logo 1');
                logo1.classList.remove('zoom-in');
                logo1.classList.add('fade-out');
            }},
            // Show second logo
            { time: 3200, action: () => {
                console.log('Showing logo 2');
                logo2.classList.add('zoom-in');
            }},
            // Hide second logo
            { time: 5200, action: () => {
                console.log('Hiding logo 2');
                logo2.classList.remove('zoom-in');
                logo2.classList.add('fade-out');
            }},
            // Complete fade out of entire splash
            { time: 6000, action: () => {
                console.log('Fading out splash');
                splash.style.opacity = '0';
                splash.style.transition = 'opacity 0.5s ease-out';
            }},
            // Finish
            { time: 6500, action: () => {
                console.log('Animation complete');
                onComplete();
            }}
        ];

        // Execute timeline
        timeline.forEach(step => {
            setTimeout(step.action, step.time);
        });
    }

    public destroy(): void {
        this.container.innerHTML = '';
    }
}