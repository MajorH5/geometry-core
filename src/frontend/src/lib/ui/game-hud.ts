export class GameHUD {
    private container: HTMLDivElement;
    private hudElement: HTMLDivElement;
    private isVisible: boolean = true;
    
    // Player stats
    private playerName: string = 'Player';
    private health: number = 100;
    private maxHealth: number = 100;
    private level: number = 1;
    private experience: number = 0;
    private maxExperience: number = 100;
    
    // Upgrade system
    private upgrades: { [key: string]: number } = {
        damage: 0,
        speed: 0,
        health: 0,
        fireRate: 0,
        shield: 0
    };
    
    // Game stats
    private playersOnline: number = 0;
    private waveNumber: number = 1;
    private score: number = 0;
    private gameTime: number = 0;
    
    private animationFrame?: number;

    constructor(container: HTMLDivElement) {
        this.container = container;
        this.setupHTML();
        this.setupEventListeners();
        this.startUpdateLoop();
    }

    private setupHTML(): void {
        this.hudElement = document.createElement('div');
        this.hudElement.className = 'game-hud';
        
        this.hudElement.innerHTML = `
            <!-- Top HUD Bar -->
            <div class="hud-top-bar">
                <div class="player-info-section">
                    <div class="player-avatar">
                        <div class="avatar-core"></div>
                        <div class="avatar-ring"></div>
                    </div>
                    
                    <div class="player-details">
                        <div class="player-name" id="playerName">${this.playerName}</div>
                        <div class="player-level">LVL ${this.level}</div>
                        
                        <div class="health-container">
                            <div class="stat-bar health-bar">
                                <div class="bar-fill health-fill" id="healthFill" style="width: 100%"></div>
                                <div class="bar-text">
                                    <span id="healthText">${this.health}</span>/<span id="maxHealthText">${this.maxHealth}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="xp-container">
                            <div class="stat-bar xp-bar">
                                <div class="bar-fill xp-fill" id="xpFill" style="width: 0%"></div>
                                <div class="bar-text">
                                    <span id="xpText">${this.experience}</span>/<span id="maxXpText">${this.maxExperience}</span> XP
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="game-stats-section">
                    <div class="stat-item">
                        <div class="stat-icon wave-icon"></div>
                        <div class="stat-value">
                            <div class="stat-label">Wave</div>
                            <div class="stat-number" id="waveNumber">${this.waveNumber}</div>
                        </div>
                    </div>
                    
                    <div class="stat-item">
                        <div class="stat-icon score-icon"></div>
                        <div class="stat-value">
                            <div class="stat-label">Score</div>
                            <div class="stat-number" id="scoreNumber">${this.score.toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div class="stat-item">
                        <div class="stat-icon time-icon"></div>
                        <div class="stat-value">
                            <div class="stat-label">Time</div>
                            <div class="stat-number" id="gameTime">00:00</div>
                        </div>
                    </div>
                </div>
                
                <div class="server-info-section">
                    <div class="online-players">
                        <div class="online-dot"></div>
                        <span id="onlineCount">${this.playersOnline}</span> online
                    </div>
                </div>
            </div>
            
            <!-- Right Side Upgrades Panel -->
            <div class="upgrades-panel" id="upgradesPanel">
                <div class="panel-header">
                    <div class="panel-title">UPGRADES</div>
                    <button class="panel-toggle" id="upgradesToggle">
                        <div class="toggle-icon"></div>
                    </button>
                </div>
                
                <div class="panel-content" id="upgradesContent">
                    <div class="upgrade-item" data-upgrade="damage">
                        <div class="upgrade-icon damage-icon"></div>
                        <div class="upgrade-info">
                            <div class="upgrade-name">Damage</div>
                            <div class="upgrade-level">Level ${this.upgrades.damage}</div>
                        </div>
                        <div class="upgrade-dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                    
                    <div class="upgrade-item" data-upgrade="speed">
                        <div class="upgrade-icon speed-icon"></div>
                        <div class="upgrade-info">
                            <div class="upgrade-name">Speed</div>
                            <div class="upgrade-level">Level ${this.upgrades.speed}</div>
                        </div>
                        <div class="upgrade-dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                    
                    <div class="upgrade-item" data-upgrade="health">
                        <div class="upgrade-icon health-icon"></div>
                        <div class="upgrade-info">
                            <div class="upgrade-name">Health</div>
                            <div class="upgrade-level">Level ${this.upgrades.health}</div>
                        </div>
                        <div class="upgrade-dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                    
                    <div class="upgrade-item" data-upgrade="fireRate">
                        <div class="upgrade-icon firerate-icon"></div>
                        <div class="upgrade-info">
                            <div class="upgrade-name">Fire Rate</div>
                            <div class="upgrade-level">Level ${this.upgrades.fireRate}</div>
                        </div>
                        <div class="upgrade-dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                    
                    <div class="upgrade-item" data-upgrade="shield">
                        <div class="upgrade-icon shield-icon"></div>
                        <div class="upgrade-info">
                            <div class="upgrade-name">Shield</div>
                            <div class="upgrade-level">Level ${this.upgrades.shield}</div>
                        </div>
                        <div class="upgrade-dots">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Bottom Action Bar -->
            <div class="action-bar">
                <div class="action-slots">
                    <div class="action-slot" data-slot="1">
                        <div class="slot-key">1</div>
                        <div class="slot-icon primary-weapon"></div>
                    </div>
                    <div class="action-slot" data-slot="2">
                        <div class="slot-key">2</div>
                        <div class="slot-icon secondary-weapon"></div>
                    </div>
                    <div class="action-slot" data-slot="3">
                        <div class="slot-key">3</div>
                        <div class="slot-icon special-ability"></div>
                    </div>
                    <div class="action-slot" data-slot="4">
                        <div class="slot-key">4</div>
                        <div class="slot-icon shield-ability"></div>
                    </div>
                </div>
                
                <div class="core-status">
                    <div class="core-icon"></div>
                    <div class="core-info">
                        <div class="core-label">CORE INTEGRITY</div>
                        <div class="stat-bar core-bar">
                            <div class="bar-fill core-fill" id="coreFill" style="width: 100%"></div>
                            <div class="bar-text">100%</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Minimap -->
            <div class="minimap-container">
                <div class="minimap-header">MAP</div>
                <div class="minimap" id="minimap">
                    <div class="minimap-grid"></div>
                    <div class="minimap-player" id="minimapPlayer"></div>
                    <div class="minimap-core" id="minimapCore"></div>
                    <div class="minimap-enemies" id="minimapEnemies"></div>
                </div>
            </div>
        `;
        
        this.container.appendChild(this.hudElement);
    }

    private setupEventListeners(): void {
        // Toggle upgrades panel
        const upgradesToggle = this.hudElement.querySelector('#upgradesToggle') as HTMLButtonElement;
        const upgradesContent = this.hudElement.querySelector('#upgradesContent') as HTMLDivElement;
        const upgradesPanel = this.hudElement.querySelector('#upgradesPanel') as HTMLDivElement;
        
        upgradesToggle?.addEventListener('click', () => {
            upgradesPanel.classList.toggle('collapsed');
        });
        
        // Upgrade item hover effects
        const upgradeItems = this.hudElement.querySelectorAll('.upgrade-item');
        upgradeItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.classList.add('hovered');
            });
            
            item.addEventListener('mouseleave', () => {
                item.classList.remove('hovered');
            });
            
            item.addEventListener('click', () => {
                const upgradeType = item.getAttribute('data-upgrade');
                if (upgradeType && this.upgrades[upgradeType] < 5) {
                    this.upgradeSkill(upgradeType);
                }
            });
        });
        
        // Action slot clicks
        const actionSlots = this.hudElement.querySelectorAll('.action-slot');
        actionSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectActionSlot(index + 1);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                    this.selectActionSlot(parseInt(e.key));
                    break;
                case 'Tab':
                    e.preventDefault();
                    this.toggleHUD();
                    break;
                case 'u':
                case 'U':
                    upgradesPanel.classList.toggle('collapsed');
                    break;
            }
        });
    }

    private startUpdateLoop(): void {
        const update = () => {
            this.updateAnimations();
            this.animationFrame = requestAnimationFrame(update);
        };
        update();
    }

    private updateAnimations(): void {
        const time = Date.now() * 0.001;
        
        // Animate avatar ring
        const avatarRing = this.hudElement.querySelector('.avatar-ring') as HTMLElement;
        if (avatarRing) {
            avatarRing.style.transform = `rotate(${time * 30}deg)`;
        }
        
        // Animate core icon
        const coreIcon = this.hudElement.querySelector('.core-icon') as HTMLElement;
        if (coreIcon) {
            const pulse = Math.sin(time * 2) * 0.1 + 1;
            coreIcon.style.transform = `scale(${pulse}) rotate(${time * 20}deg)`;
        }
        
        // Animate upgrade icons
        const upgradeIcons = this.hudElement.querySelectorAll('.upgrade-icon');
        upgradeIcons.forEach((icon, index) => {
            const element = icon as HTMLElement;
            const offset = index * 0.5;
            const rotation = Math.sin(time + offset) * 5;
            element.style.transform = `rotate(${rotation}deg)`;
        });
    }

    // Public API methods
    public updatePlayerStats(stats: {
        name?: string;
        health?: number;
        maxHealth?: number;
        level?: number;
        experience?: number;
        maxExperience?: number;
    }): void {
        if (stats.name !== undefined) {
            this.playerName = stats.name;
            this.updateElement('playerName', this.playerName);
        }
        
        if (stats.health !== undefined) {
            this.health = Math.max(0, stats.health);
            this.updateElement('healthText', this.health.toString());
            this.updateHealthBar();
        }
        
        if (stats.maxHealth !== undefined) {
            this.maxHealth = stats.maxHealth;
            this.updateElement('maxHealthText', this.maxHealth.toString());
            this.updateHealthBar();
        }
        
        if (stats.level !== undefined) {
            this.level = stats.level;
            this.updateElement('playerLevel', `LVL ${this.level}`);
        }
        
        if (stats.experience !== undefined) {
            this.experience = stats.experience;
            this.updateElement('xpText', this.experience.toString());
            this.updateXPBar();
        }
        
        if (stats.maxExperience !== undefined) {
            this.maxExperience = stats.maxExperience;
            this.updateElement('maxXpText', this.maxExperience.toString());
            this.updateXPBar();
        }
    }

    public updateGameStats(stats: {
        playersOnline?: number;
        waveNumber?: number;
        score?: number;
        gameTime?: number;
    }): void {
        if (stats.playersOnline !== undefined) {
            this.playersOnline = stats.playersOnline;
            this.updateElement('onlineCount', this.playersOnline.toString());
        }
        
        if (stats.waveNumber !== undefined) {
            this.waveNumber = stats.waveNumber;
            this.updateElement('waveNumber', this.waveNumber.toString());
        }
        
        if (stats.score !== undefined) {
            this.score = stats.score;
            this.updateElement('scoreNumber', this.score.toLocaleString());
        }
        
        if (stats.gameTime !== undefined) {
            this.gameTime = stats.gameTime;
            const minutes = Math.floor(stats.gameTime / 60);
            const seconds = stats.gameTime % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.updateElement('gameTime', timeString);
        }
    }

    public upgradeSkill(skillName: string): void {
        if (this.upgrades[skillName] < 5) {
            this.upgrades[skillName]++;
            this.updateUpgradeDisplay(skillName);
        }
    }

    public updateCoreHealth(percentage: number): void {
        const coreFill = this.hudElement.querySelector('#coreFill') as HTMLElement;
        const coreText = coreFill?.parentElement?.querySelector('.bar-text') as HTMLElement;
        
        if (coreFill) {
            coreFill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
        }
        if (coreText) {
            coreText.textContent = `${Math.round(percentage)}%`;
        }
    }

    public selectActionSlot(slotNumber: number): void {
        const slots = this.hudElement.querySelectorAll('.action-slot');
        slots.forEach((slot, index) => {
            if (index + 1 === slotNumber) {
                slot.classList.add('active');
            } else {
                slot.classList.remove('active');
            }
        });
    }

    public toggleHUD(): void {
        this.isVisible = !this.isVisible;
        this.hudElement.style.opacity = this.isVisible ? '1' : '0.3';
    }

    public updateMinimap(playerPos: { x: number, y: number }, corePos: { x: number, y: number }, enemies: Array<{ x: number, y: number }>): void {
        const minimapPlayer = this.hudElement.querySelector('#minimapPlayer') as HTMLElement;
        const minimapCore = this.hudElement.querySelector('#minimapCore') as HTMLElement;
        const minimapEnemies = this.hudElement.querySelector('#minimapEnemies') as HTMLElement;
        
        // Update player position (center the minimap on player)
        if (minimapPlayer) {
            minimapPlayer.style.left = '50%';
            minimapPlayer.style.top = '50%';
        }
        
        // Update core position relative to player
        if (minimapCore) {
            const relativeX = ((corePos.x - playerPos.x) / 20) + 50; // Scale and center
            const relativeY = ((corePos.y - playerPos.y) / 20) + 50;
            minimapCore.style.left = `${Math.max(0, Math.min(100, relativeX))}%`;
            minimapCore.style.top = `${Math.max(0, Math.min(100, relativeY))}%`;
        }
        
        // Update enemy positions
        if (minimapEnemies) {
            minimapEnemies.innerHTML = '';
            enemies.forEach(enemy => {
                const enemyDot = document.createElement('div');
                enemyDot.className = 'minimap-enemy';
                const relativeX = ((enemy.x - playerPos.x) / 20) + 50;
                const relativeY = ((enemy.y - playerPos.y) / 20) + 50;
                enemyDot.style.left = `${Math.max(0, Math.min(100, relativeX))}%`;
                enemyDot.style.top = `${Math.max(0, Math.min(100, relativeY))}%`;
                minimapEnemies.appendChild(enemyDot);
            });
        }
    }

    private updateHealthBar(): void {
        const healthFill = this.hudElement.querySelector('#healthFill') as HTMLElement;
        if (healthFill) {
            const percentage = (this.health / this.maxHealth) * 100;
            healthFill.style.width = `${percentage}%`;
            
            // Change color based on health percentage
            if (percentage > 60) {
                healthFill.className = 'bar-fill health-fill high';
            } else if (percentage > 30) {
                healthFill.className = 'bar-fill health-fill medium';
            } else {
                healthFill.className = 'bar-fill health-fill low';
            }
        }
    }

    private updateXPBar(): void {
        const xpFill = this.hudElement.querySelector('#xpFill') as HTMLElement;
        if (xpFill) {
            const percentage = (this.experience / this.maxExperience) * 100;
            xpFill.style.width = `${percentage}%`;
        }
    }

    private updateUpgradeDisplay(skillName: string): void {
        const upgradeItem = this.hudElement.querySelector(`[data-upgrade="${skillName}"]`) as HTMLElement;
        if (upgradeItem) {
            const levelElement = upgradeItem.querySelector('.upgrade-level') as HTMLElement;
            const dots = upgradeItem.querySelectorAll('.dot');
            
            if (levelElement) {
                levelElement.textContent = `Level ${this.upgrades[skillName]}`;
            }
            
            dots.forEach((dot, index) => {
                if (index < this.upgrades[skillName]) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
    }

    private updateElement(id: string, content: string): void {
        const element = this.hudElement.querySelector(`#${id}`) as HTMLElement;
        if (element) {
            element.textContent = content;
        }
    }

    public show(): void {
        this.hudElement.style.display = 'block';
        this.isVisible = true;
    }

    public hide(): void {
        this.hudElement.style.display = 'none';
        this.isVisible = false;
    }

    public destroy(): void {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.hudElement.remove();
    }
}