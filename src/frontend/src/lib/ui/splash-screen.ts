export class SplashScreen {
    private container: HTMLDivElement;
    private currentStep = 0;

    constructor(container: HTMLDivElement) {
        this.container = container;
        this.setupHTML();
    }

    private setupHTML(): void {
        this.container.innerHTML = `
            <div class="splash-screen">
                <!-- Background grid pattern -->
                <div class="grid-background"></div>
                
                <!-- First logo -->
                <div class="logo-container logo-1">
                    <div class="geometric-logo">
                        <div class="triangle triangle-1"></div>
                        <div class="triangle triangle-2"></div>
                        <div class="triangle triangle-3"></div>
                        <div class="circle center-circle"></div>
                    </div>
                </div>
                
                <!-- Second logo -->
                <div class="logo-container logo-2">
                    <div class="geometric-logo-2">
                        <div class="hexagon"></div>
                        <div class="inner-shapes">
                            <div class="diamond diamond-1"></div>
                            <div class="diamond diamond-2"></div>
                            <div class="diamond diamond-3"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Floating geometric elements -->
                <div class="floating-elements">
                    <div class="float-shape triangle-float"></div>
                    <div class="float-shape circle-float"></div>
                    <div class="float-shape square-float"></div>
                    <div class="float-shape diamond-float"></div>
                </div>
            </div>
        `;
    }

    public async start(): Promise<void> {
        return new Promise((resolve) => {
            this.playSequence(resolve);
        });
    }

    private playSequence(onComplete: () => void): void {
        const splash = this.container.querySelector('.splash-screen') as HTMLElement;
        const logo1 = this.container.querySelector('.logo-1') as HTMLElement;
        const logo2 = this.container.querySelector('.logo-2') as HTMLElement;
        const floatingElements = this.container.querySelector('.floating-elements') as HTMLElement;

        // Start with everything hidden
        logo1.style.opacity = '1';
        logo2.style.opacity = '1';
        splash.style.opacity = '1';

        // Start floating elements animation
        floatingElements.style.animation = 'floatingElements 8s ease-in-out infinite';

        // Sequence timeline
        const timeline = [
            // Show first logo
            { time: 500, action: () => {
                logo1.classList.add('zoom-in');
            }},
            // Hide first logo
            { time: 2500, action: () => {
                logo1.classList.add('fade-out');
            }},
            // Show second logo
            { time: 3000, action: () => {
                logo2.classList.add('zoom-in');
            }},
            // Hide second logo and fade out splash
            { time: 5000, action: () => {
                logo2.classList.add('fade-out');
            }},
            // Complete fade out
            { time: 6000, action: () => {
                splash.style.opacity = '0';
                splash.style.transition = 'opacity 0.5s ease-out';
            }},
            // Finish
            { time: 6500, action: () => {
                onComplete();
            }}
        ];

        // Execute timeline
        timeline.forEach(step => {
            setTimeout(step.action, step.time);
        });
    }
}