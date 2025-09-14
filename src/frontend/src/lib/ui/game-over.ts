export interface GameOverCallbacks {
    onPlayAgain: () => void;
    onReturnToTitle: () => void;
    onShowStats: () => void;
}

export interface GameStats {
    score: number;
    wave: number;
    timeAlive: number;
    enemiesKilled: number;
    damageDealt: number;
    accuracy: number;
}

export class GameOverScreen {
    private container: HTMLDivElement;
    private gameOverElement: HTMLDivElement;
    private isVisible: boolean = false;
    private callbacks: GameOverCallbacks;
    private animationFrame?: number;

    constructor(container: HTMLDivElement, callbacks: GameOverCallbacks) {
        this.container = container;
        this.callbacks = callbacks;
        this.setupHTML();
        this.setupEventListeners();
        this.hide(); // Start hidden
    }

    private setupHTML(): void {
        this.gameOverElement = document.createElement('div');
        this.gameOverElement.className = 'game-over-screen';
        
        this.gameOverElement.innerHTML = `
            <!-- Background overlay -->
            <div class="game-over-overlay"></div>
            
            <!-- Animated background elements -->
            <div class="background-particles"></div>
            <div class="grid-background"></div>
            
            <!-- Main content -->
            <div class="game-over-content">
                <!-- Death animation container -->
                <div class="death-animation">
                    <div class="explosion-rings">
                        <div class="ring ring-1"></div>
                        <div class="ring ring-2"></div>
                        <div class="ring ring-3"></div>
                    </div>
                    <div class="core-fragments">
                        <div class="fragment fragment-1"></div>
                        <div class="fragment fragment-2"></div>
                        <div class="fragment fragment-3"></div>
                        <div class="fragment fragment-4"></div>
                        <div class="fragment fragment-5"></div>
                        <div class="fragment fragment-6"></div>
                    </div>
                </div>
                
                <!-- Game Over Title -->
                <div class="game-over-title">
                    <h1 class="title-text">CORE BREACHED</h1>
                    <div class="title-subtitle">System Failure</div>
                </div>
                
                <!-- Stats Panel -->
                <div class="stats-panel">
                    <div class="stats-header">
                        <div class="stats-title">MISSION REPORT</div>
                        <div class="mission-status failed">FAILED</div>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-icon score-icon"></div>
                            <div class="stat-info">
                                <div class="stat-label">Final Score</div>
                                <div class="stat-value" id="finalScore">0</div>
                            </div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-icon wave-icon"></div>
                            <div class="stat-info">
                                <div class="stat-label">Wave Reached</div>
                                <div class="stat-value" id="finalWave">1</div>
                            </div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-icon time-icon"></div>
                            <div class="stat-info">
                                <div class="stat-label">Time Survived</div>
                                <div class="stat-value" id="timeAlive">00:00</div>
                            </div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-icon kill-icon"></div>
                            <div class="stat-info">
                                <div class="stat-label">Enemies Eliminated</div>
                                <div class="stat-value" id="enemiesKilled">0</div>
                            </div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-icon damage-icon"></div>
                            <div class="stat-info">
                                <div class="stat-label">Damage Dealt</div>
                                <div class="stat-value" id="damageDealt">0</div>
                            </div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-icon accuracy-icon"></div>
                            <div class="stat-info">
                                <div class="stat-label">Accuracy</div>
                                <div class="stat-value" id="accuracy">0%</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="action-buttons">
                    <button class="game-over-button primary-button" id="playAgainBtn">
                        <div class="button-icon restart-icon"></div>
                        <span>DEPLOY AGAIN</span>
                    </button>
                    
                    <button class="game-over-button secondary-button" id="titleBtn">
                        <div class="button-icon home-icon"></div>
                        <span>RETURN TO BASE</span>
                    </button>
                    
                    <button class="game-over-button secondary-button" id="statsBtn">
                        <div class="button-icon stats-icon"></div>
                        <span>DETAILED STATS</span>
                    </button>
                </div>
                
                <!-- Performance Rating -->
                <div class="performance-rating">
                    <div class="rating-label">Performance Rating</div>
                    <div class="rating-display" id="performanceRating">
                        <div class="rating-letter">C</div>
                        <div class="rating-description">Standard Performance</div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.appendChild(this.gameOverElement);
    }

    private setupEventListeners(): void {
        // Button event listeners
        const playAgainBtn = this.gameOverElement.querySelector('#playAgainBtn') as HTMLButtonElement;
        const titleBtn = this.gameOverElement.querySelector('#titleBtn') as HTMLButtonElement;
        const statsBtn = this.gameOverElement.querySelector('#statsBtn') as HTMLButtonElement;
        
        playAgainBtn?.addEventListener('click', () => {
            this.callbacks.onPlayAgain();
        });
        
        titleBtn?.addEventListener('click', () => {
            this.callbacks.onReturnToTitle();
        });
        
        statsBtn?.addEventListener('click', () => {
            this.callbacks.onShowStats();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            switch(e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this.callbacks.onPlayAgain();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.callbacks.onReturnToTitle();
                    break;
                case 'Tab':
                    e.preventDefault();
                    this.callbacks.onShowStats();
                    break;
            }
        });
    }

    private startAnimations(): void {
        const update = (time: number) => {
            this.updateParticles(time);
            this.updateFragments(time);
            
            if (this.isVisible) {
                this.animationFrame = requestAnimationFrame(update);
            }
        };
        
        this.animationFrame = requestAnimationFrame(update);
    }

    private updateParticles(time: number): void {
        const particles = this.gameOverElement.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            const element = particle as HTMLElement;
            const speed = 0.001 + (index * 0.0003);
            const offset = Math.sin(time * speed + index) * 20;
            element.style.transform = `translateY(${offset}px) rotate(${time * speed * 100}deg)`;
        });
    }

    private updateFragments(time: number): void {
        const fragments = this.gameOverElement.querySelectorAll('.fragment');
        fragments.forEach((fragment, index) => {
            const element = fragment as HTMLElement;
            const speed = 0.0005 + (index * 0.0002);
            const rotation = time * speed * 50;
            const float = Math.sin(time * speed * 2) * 5;
            element.style.transform = `rotate(${rotation}deg) translateY(${float}px)`;
        });
    }

    public show(stats?: GameStats): Promise<void> {
        return new Promise((resolve) => {
            this.isVisible = true;
            this.gameOverElement.style.display = 'block';
            
            // Update stats if provided
            if (stats) {
                this.updateStats(stats);
            }
            
            // Create floating particles
            this.createParticles();
            
            // Start animations
            this.startAnimations();
            
            // Trigger entrance animation
            requestAnimationFrame(() => {
                this.gameOverElement.classList.add('fade-in');
                
                // Stagger the appearance of elements
                setTimeout(() => {
                    this.gameOverElement.querySelector('.death-animation')?.classList.add('animate-in');
                }, 200);
                
                setTimeout(() => {
                    this.gameOverElement.querySelector('.game-over-title')?.classList.add('animate-in');
                }, 800);
                
                setTimeout(() => {
                    this.gameOverElement.querySelector('.stats-panel')?.classList.add('animate-in');
                }, 1200);
                
                setTimeout(() => {
                    this.gameOverElement.querySelector('.action-buttons')?.classList.add('animate-in');
                    this.gameOverElement.querySelector('.performance-rating')?.classList.add('animate-in');
                    resolve();
                }, 1600);
            });
        });
    }

    public hide(): Promise<void> {
        return new Promise((resolve) => {
            this.gameOverElement.classList.add('fade-out');
            
            setTimeout(() => {
                this.gameOverElement.style.display = 'none';
                this.gameOverElement.classList.remove('fade-in', 'fade-out');
                
                // Reset all animate-in classes
                const animatedElements = this.gameOverElement.querySelectorAll('.animate-in');
                animatedElements.forEach(el => el.classList.remove('animate-in'));
                
                this.isVisible = false;
                
                // Stop animations
                if (this.animationFrame) {
                    cancelAnimationFrame(this.animationFrame);
                }
                
                resolve();
            }, 600);
        });
    }

    private createParticles(): void {
        const particlesContainer = this.gameOverElement.querySelector('.background-particles') as HTMLElement;
        if (!particlesContainer) return;
        
        // Clear existing particles
        particlesContainer.innerHTML = '';
        
        // Create floating geometric particles
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = `particle particle-${i % 4 + 1}`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 3}s`;
            particlesContainer.appendChild(particle);
        }
    }

    private updateStats(stats: GameStats): void {
        // Update stat values
        this.updateElement('finalScore', stats.score.toLocaleString());
        this.updateElement('finalWave', stats.wave.toString());
        this.updateElement('enemiesKilled', stats.enemiesKilled.toLocaleString());
        this.updateElement('damageDealt', stats.damageDealt.toLocaleString());
        this.updateElement('accuracy', `${stats.accuracy.toFixed(1)}%`);
        
        // Format time
        const minutes = Math.floor(stats.timeAlive / 60);
        const seconds = stats.timeAlive % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.updateElement('timeAlive', timeString);
        
        // Calculate and update performance rating
        this.updatePerformanceRating(stats);
    }

    private updatePerformanceRating(stats: GameStats): void {
        const ratingElement = this.gameOverElement.querySelector('#performanceRating') as HTMLElement;
        if (!ratingElement) return;
        
        // Simple rating calculation based on multiple factors
        let ratingScore = 0;
        
        // Score contribution (0-30 points)
        ratingScore += Math.min(30, stats.score / 1000);
        
        // Wave contribution (0-25 points)
        ratingScore += Math.min(25, stats.wave * 2);
        
        // Time contribution (0-20 points)
        ratingScore += Math.min(20, stats.timeAlive / 30);
        
        // Accuracy contribution (0-15 points)
        ratingScore += stats.accuracy * 0.15;
        
        // Kill efficiency (0-10 points)
        ratingScore += Math.min(10, stats.enemiesKilled / 50);
        
        // Determine letter grade and description
        let letter = 'F';
        let description = 'Mission Failed';
        let ratingClass = 'rating-f';
        
        if (ratingScore >= 90) {
            letter = 'S';
            description = 'Perfect Execution';
            ratingClass = 'rating-s';
        } else if (ratingScore >= 80) {
            letter = 'A';
            description = 'Excellent Performance';
            ratingClass = 'rating-a';
        } else if (ratingScore >= 70) {
            letter = 'B';
            description = 'Good Performance';
            ratingClass = 'rating-b';
        } else if (ratingScore >= 60) {
            letter = 'C';
            description = 'Average Performance';
            ratingClass = 'rating-c';
        } else if (ratingScore >= 40) {
            letter = 'D';
            description = 'Below Average';
            ratingClass = 'rating-d';
        }
        
        const letterElement = ratingElement.querySelector('.rating-letter') as HTMLElement;
        const descriptionElement = ratingElement.querySelector('.rating-description') as HTMLElement;
        
        if (letterElement && descriptionElement) {
            letterElement.textContent = letter;
            descriptionElement.textContent = description;
            ratingElement.className = `rating-display ${ratingClass}`;
        }
    }

    private updateElement(id: string, content: string): void {
        const element = this.gameOverElement.querySelector(`#${id}`) as HTMLElement;
        if (element) {
            element.textContent = content;
        }
    }

    public fadeOut(): Promise<void> {
        return this.hide();
    }

    public destroy(): void {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.gameOverElement.remove();
    }
}