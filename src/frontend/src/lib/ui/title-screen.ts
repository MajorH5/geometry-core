export class TitleScreen {
    private container: HTMLDivElement;
    private playerCountInterval?: NodeJS.Timeout;
    private onStartGame?: () => void;
    private onJoinServer?: () => void;
    private onShowInfo?: () => void;
    private onShowSettings?: () => void;
    private onShowCredits?: () => void;

    constructor(
        container: HTMLDivElement,
        callbacks?: {
            onStartGame?: () => void;
            onJoinServer?: () => void;
            onShowInfo?: () => void;
            onShowSettings?: () => void;
            onShowCredits?: () => void;
        }
    ) {
        this.container = container;
        this.onStartGame = callbacks?.onStartGame;
        this.onJoinServer = callbacks?.onJoinServer;
        this.onShowInfo = callbacks?.onShowInfo;
        this.onShowSettings = callbacks?.onShowSettings;
        this.onShowCredits = callbacks?.onShowCredits;
        
        this.setupHTML();
        this.setupEventListeners();
        this.startPlayerCountUpdates();
    }

    private setupHTML(): void {
        this.container.innerHTML = `
            <div class="title-screen">
                <div class="grid-background"></div>
                
                <!-- Floating background elements -->
                <div class="floating-elements">
                    <div class="float-shape shape-1"></div>
                    <div class="float-shape shape-2"></div>
                    <div class="float-shape shape-3"></div>
                    <div class="float-shape shape-4"></div>
                    <div class="float-shape shape-5"></div>
                </div>

                <!-- Header with branding -->
                <header class="header">
                    <div class="brand-section">
                        <div class="game-jam-logos">
                            <div class="logo-placeholder">LOGO 1</div>
                            <div class="logo-placeholder">LOGO 2</div>
                            <div class="logo-placeholder">LOGO 3</div>
                        </div>
                    </div>
                    
                    <div class="player-stats">
                        <div class="online-count">
                            <span class="online-number" id="playerCount">1,247</span> players online
                        </div>
                        <div class="server-status">
                            <div class="status-dot"></div>
                            Server Online
                        </div>
                    </div>
                </header>

                <!-- Main content -->
                <main class="main-content">
                    <div class="game-info">
                        <h1 class="game-title">GEOMETRIC CORE</h1>
                        <p class="game-subtitle">Co-op MMO Experience</p>
                        
                        <div class="menu-container">
                            <button class="menu-button play-button" data-action="start-game">
                                Play Now
                            </button>
                            
                            <button class="menu-button" data-action="join-server">
                                Join Server
                            </button>
                            
                            <div class="secondary-menu">
                                <button class="secondary-button" data-action="show-info">
                                    Game Info
                                </button>
                                <button class="secondary-button" data-action="show-settings">
                                    Settings
                                </button>
                                <button class="secondary-button" data-action="show-credits">
                                    Credits
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                <!-- Version info -->
                <div class="version-info">
                    v0.1.0 Alpha • HopHacks 2025
                </div>
            </div>
        `;
    }

    private setupEventListeners(): void {
        const titleScreen = this.container.querySelector('.title-screen') as HTMLElement;
        
        // Button click handlers
        titleScreen.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const action = target.getAttribute('data-action');
            
            switch (action) {
                case 'start-game':
                    this.handleStartGame();
                    break;
                case 'join-server':
                    this.handleJoinServer();
                    break;
                case 'show-info':
                    this.handleShowInfo();
                    break;
                case 'show-settings':
                    this.handleShowSettings();
                    break;
                case 'show-credits':
                    this.handleShowCredits();
                    break;
            }
        });

        // Mouse parallax effect
        titleScreen.addEventListener('mousemove', (e) => {
            this.handleMouseParallax(e);
        });
    }

    private handleStartGame(): void {
        console.log('Starting game...');
        if (this.onStartGame) {
            this.onStartGame();
        } else {
            // Default behavior - fade out title screen
            this.fadeOut();
        }
    }

    private handleJoinServer(): void {
        console.log('Join server clicked');
        if (this.onJoinServer) {
            this.onJoinServer();
        }
    }

    private handleShowInfo(): void {
        console.log('Show info clicked');
        if (this.onShowInfo) {
            this.onShowInfo();
        }
    }

    private handleShowSettings(): void {
        console.log('Show settings clicked');
        if (this.onShowSettings) {
            this.onShowSettings();
        }
    }

    private handleShowCredits(): void {
        console.log('Show credits clicked');
        if (this.onShowCredits) {
            this.onShowCredits();
        }
    }

    private handleMouseParallax(e: MouseEvent): void {
        const shapes = this.container.querySelectorAll('.float-shape');
        const rect = this.container.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width;
        const mouseY = (e.clientY - rect.top) / rect.height;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            (shape as HTMLElement).style.transform += ` translate(${x}px, ${y}px)`;
        });
    }

    private startPlayerCountUpdates(): void {
        this.updatePlayerCount();
        this.playerCountInterval = setInterval(() => {
            this.updatePlayerCount();
        }, 30000); // Update every 30 seconds
    }

    private updatePlayerCount(): void {
        const count = this.container.querySelector('#playerCount') as HTMLElement;
        if (count) {
            const baseCount = 1200;
            const variation = Math.floor(Math.random() * 100);
            const newCount = baseCount + variation;
            count.textContent = newCount.toLocaleString();
        }
    }

    public async fadeOut(duration = 800): Promise<void> {
        return new Promise((resolve) => {
            const titleScreen = this.container.querySelector('.title-screen') as HTMLElement;
            titleScreen.style.opacity = '0';
            titleScreen.style.transition = `opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            
            setTimeout(() => {
                titleScreen.style.display = 'none';
                resolve();
            }, duration);
        });
    }

    public show(): void {
        const titleScreen = this.container.querySelector('.title-screen') as HTMLElement;
        titleScreen.style.display = 'flex';
        titleScreen.style.opacity = '1';
    }

    public hide(): void {
        const titleScreen = this.container.querySelector('.title-screen') as HTMLElement;
        titleScreen.style.display = 'none';
        titleScreen.style.opacity = '0';
    }

    public updateServerStatus(online: boolean): void {
        const statusDot = this.container.querySelector('.status-dot') as HTMLElement;
        const statusText = this.container.querySelector('.server-status') as HTMLElement;
        
        if (statusDot && statusText) {
            if (online) {
                statusDot.style.background = '#4CAF50';
                statusText.innerHTML = '<div class="status-dot"></div>Server Online';
            } else {
                statusDot.style.background = '#f44336';
                statusText.innerHTML = '<div class="status-dot"></div>Server Offline';
            }
        }
    }

    public setLogos(logoUrls: string[]): void {
        const logos = this.container.querySelectorAll('.logo-placeholder');
        logoUrls.forEach((url, index) => {
            if (logos[index]) {
                const logoElement = logos[index] as HTMLElement;
                logoElement.style.backgroundImage = `url(${url})`;
                logoElement.style.backgroundSize = 'cover';
                logoElement.style.backgroundPosition = 'center';
                logoElement.textContent = ''; // Remove placeholder text
            }
        });
    }

    public updateVersion(version: string, subtitle?: string): void {
        const versionInfo = this.container.querySelector('.version-info') as HTMLElement;
        if (versionInfo) {
            versionInfo.textContent = subtitle ? `${version} • ${subtitle}` : version;
        }
    }

    public updateTitle(title: string, subtitle?: string): void {
        const titleElement = this.container.querySelector('.game-title') as HTMLElement;
        const subtitleElement = this.container.querySelector('.game-subtitle') as HTMLElement;
        
        if (titleElement) {
            titleElement.textContent = title;
        }
        
        if (subtitleElement && subtitle) {
            subtitleElement.textContent = subtitle;
        }
    }

    public destroy(): void {
        if (this.playerCountInterval) {
            clearInterval(this.playerCountInterval);
        }
        this.container.innerHTML = '';
    }
}