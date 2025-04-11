// DevSpark Desktop - Dark Game Theme JavaScript
const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', function() {
    // Apply dark game theme
    initDarkGameTheme();
});

// Initialize dark game theme
function initDarkGameTheme() {
    // Add game-like UI elements and effects
    addGameLikeEffects();
    
    // Set up achievement system
    setupAchievementSystem();
    
    // Add AI assistant effects
    setupAIAssistantEffects();
    
    // Add terminal effects
    setupTerminalEffects();
    
    // Add sound effects (disabled by default)
    setupSoundEffects(false);
    
    console.log('Dark Game Theme initialized for Desktop');
}

// Add game-like UI elements and effects
function addGameLikeEffects() {
    // Add glow effects to buttons
    const buttons = document.querySelectorAll('button, .button');
    buttons.forEach(button => {
        button.classList.add('glow-effect');
    });
    
    // Add hover effects to sidebar icons
    const sidebarIcons = document.querySelectorAll('.sidebar-icon');
    sidebarIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.classList.add('animate-pulse');
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.classList.remove('animate-pulse');
        });
    });
    
    // Add hover effects to file items
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const icon = item.querySelector('.file-icon');
            if (icon) {
                icon.style.color = getRandomNeonColor();
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const icon = item.querySelector('.file-icon');
            if (icon) {
                icon.style.color = '';
            }
        });
    });
    
    // Add tab hover effects
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('mouseenter', () => {
            if (!tab.classList.contains('active')) {
                tab.style.boxShadow = 'var(--glow-small)';
            }
        });
        
        tab.addEventListener('mouseleave', () => {
            if (!tab.classList.contains('active')) {
                tab.style.boxShadow = '';
            }
        });
    });
    
    // Add status bar item hover effects
    const statusItems = document.querySelectorAll('.status-item');
    statusItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.color = 'var(--highlight)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.color = '';
        });
    });
    
    // Add startup animation
    addStartupAnimation();
}

// Add startup animation
function addStartupAnimation() {
    const appContainer = document.querySelector('.app-container');
    if (!appContainer) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'var(--bg-primary)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.transition = 'opacity 0.5s ease';
    
    // Create logo
    const logo = document.createElement('div');
    logo.textContent = 'DevSpark';
    logo.style.fontSize = '3rem';
    logo.style.fontWeight = 'bold';
    logo.style.marginBottom = '2rem';
    logo.style.background = 'linear-gradient(90deg, var(--accent-primary), var(--highlight))';
    logo.style.webkitBackgroundClip = 'text';
    logo.style.webkitTextFillColor = 'transparent';
    logo.style.textShadow = 'var(--glow-medium)';
    
    // Create loading spinner
    const spinner = document.createElement('div');
    spinner.classList.add('loading-spinner');
    
    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.textContent = 'Initializing...';
    loadingText.style.marginTop = '1rem';
    loadingText.style.color = 'var(--text-secondary)';
    
    // Add elements to overlay
    overlay.appendChild(logo);
    overlay.appendChild(spinner);
    overlay.appendChild(loadingText);
    
    // Add overlay to body
    document.body.appendChild(overlay);
    
    // Simulate loading progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            clearInterval(progressInterval);
            progress = 100;
            loadingText.textContent = 'Ready!';
            
            // Fade out overlay
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                }, 500);
            }, 500);
        } else {
            loadingText.textContent = `Initializing... ${Math.floor(progress)}%`;
        }
    }, 200);
}

// Set up achievement system
function setupAchievementSystem() {
    const achievements = [
        { id: 'first_file', title: 'First Contact', description: 'Opened your first file', icon: '📄' },
        { id: 'code_master', title: 'Code Master', description: 'Wrote 100 lines of code', icon: '⭐' },
        { id: 'bug_hunter', title: 'Bug Hunter', description: 'Fixed your first error', icon: '🐛' },
        { id: 'ai_friend', title: 'AI Friend', description: 'Used AI assistance for the first time', icon: '🤖' },
        { id: 'git_wizard', title: 'Git Wizard', description: 'Made your first commit', icon: '🧙' },
        { id: 'deployer', title: 'Deployer', description: 'Deployed your first application', icon: '🚀' },
        { id: 'night_owl', title: 'Night Owl', description: 'Coded for more than 2 hours', icon: '🦉' },
        { id: 'speed_demon', title: 'Speed Demon', description: 'Typed more than 100 WPM', icon: '⚡' }
    ];
    
    // Store unlocked achievements
    let unlockedAchievements = [];
    
    // Function to unlock an achievement
    window.unlockAchievement = function(achievementId) {
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement && !unlockedAchievements.includes(achievementId)) {
            unlockedAchievements.push(achievementId);
            showAchievementNotification(achievement);
            
            // Send to main process to store
            ipcRenderer.send('achievement-unlocked', achievementId);
        }
    };
    
    // Show achievement notification
    function showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked: ${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Play achievement sound if enabled
        playSound('achievement');
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
    }
    
    // Simulate some achievements for demo purposes
    setTimeout(() => {
        unlockAchievement('first_file');
    }, 10000);
    
    // Listen for achievements from main process
    ipcRenderer.on('trigger-achievement', (event, achievementId) => {
        unlockAchievement(achievementId);
    });
}

// Set up AI assistant effects
function setupAIAssistantEffects() {
    const aiButton = document.querySelector('.ai-button');
    const aiPanel = document.querySelector('.ai-assistant-panel');
    
    if (aiButton && aiPanel) {
        // Toggle AI panel
        aiButton.addEventListener('click', () => {
            aiPanel.classList.toggle('active');
            
            if (aiPanel.classList.contains('active')) {
                playSound('ai-open');
            } else {
                playSound('ai-close');
            }
        });
        
        // Close AI panel
        const closeButton = aiPanel.querySelector('.close-ai-panel');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                aiPanel.classList.remove('active');
                playSound('ai-close');
            });
        }
    }
    
    // AI thinking animation
    window.showAIThinking = function() {
        const aiContent = document.querySelector('.ai-assistant-content');
        if (!aiContent) return;
        
        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('ai-message', 'ai-thinking');
        thinkingMessage.innerHTML = `
            <div class="ai-message-content">
                <div class="loading-spinner" style="width: 20px; height: 20px;"></div>
                <span style="margin-left: 10px;">AI is thinking...</span>
            </div>
        `;
        
        aiContent.appendChild(thinkingMessage);
        aiContent.scrollTop = aiContent.scrollHeight;
        
        playSound('ai-thinking');
        
        return thinkingMessage;
    };
    
    // AI completion
    window.showAICompletion = function(thinkingMessage, content) {
        if (thinkingMessage) {
            thinkingMessage.remove();
        }
        
        const aiContent = document.querySelector('.ai-assistant-content');
        if (!aiContent) return;
        
        const message = document.createElement('div');
        message.classList.add('ai-message', 'ai-completion');
        message.innerHTML = `
            <div class="ai-message-content">${content}</div>
            <div class="ai-message-actions">
                <button class="ai-message-action copy-action">Copy</button>
                <button class="ai-message-action insert-action">Insert</button>
            </div>
        `;
        
        aiContent.appendChild(message);
        aiContent.scrollTop = aiContent.scrollHeight;
        
        playSound('ai-completion');
        
        // Add action handlers
        const copyButton = message.querySelector('.copy-action');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(content);
                showToast('Copied to clipboard');
            });
        }
        
        const insertButton = message.querySelector('.insert-action');
        if (insertButton) {
            insertButton.addEventListener('click', () => {
                // Send to main process to insert into editor
                ipcRenderer.send('insert-code', content);
                showToast('Inserted into editor');
            });
        }
    };
    
    // AI input handling
    const aiInput = document.querySelector('.ai-input');
    if (aiInput) {
        aiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                
                const content = aiInput.value.trim();
                if (content) {
                    // Add user message
                    const aiContent = document.querySelector('.ai-assistant-content');
                    if (aiContent) {
                        const userMessage = document.createElement('div');
                        userMessage.classList.add('ai-message', 'user-message');
                        userMessage.innerHTML = `
                            <div class="ai-message-content">${content}</div>
                        `;
                        
                        aiContent.appendChild(userMessage);
                        aiContent.scrollTop = aiContent.scrollHeight;
                    }
                    
                    // Clear input
                    aiInput.value = '';
                    
                    // Show AI thinking
                    const thinkingMessage = showAIThinking();
                    
                    // Simulate AI response (in real app, this would call the AI service)
                    setTimeout(() => {
                        const responses = [
                            "I can help you with that! Here's a code snippet that might work for your use case:\n\n```javascript\nfunction calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}\n```",
                            "Based on your code, I noticed a potential bug in the loop condition. Try changing `i <= array.length` to `i < array.length` to avoid an off-by-one error.",
                            "For this task, I recommend using the Observer pattern. It will help you maintain loose coupling between components.",
                            "Your approach looks good! One optimization you might consider is memoizing the results to avoid redundant calculations."
                        ];
                        
                        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                        showAICompletion(thinkingMessage, randomResponse);
                        
                        // Unlock achievement
                        unlockAchievement('ai_friend');
                    }, 1500);
                }
            }
        });
    }
}

// Set up terminal effects
function setupTerminalEffects() {
    const terminal = document.querySelector('.terminal-content');
    if (!terminal) return;
    
    // Add initial terminal content
    terminal.innerHTML = `
        <div class="terminal-line">Welcome to DevSpark Terminal</div>
        <div class="terminal-line">Version 1.0.0</div>
        <div class="terminal-line">Type 'help' for a list of commands</div>
        <div class="terminal-line">&nbsp;</div>
        <div class="terminal-input">
            <span class="terminal-prompt">$</span>
            <span class="terminal-text"></span>
            <span class="terminal-cursor"></span>
        </div>
    `;
    
    // Terminal input handling
    let currentCommand = '';
    let commandHistory = [];
    let historyIndex = -1;
    
    document.addEventListener('keydown', (e) => {
        // Only process if terminal is visible
        const terminalContainer = document.querySelector('.terminal-container');
        if (!terminalContainer || terminalContainer.style.display === 'none') return;
        
        const terminalText = terminal.querySelector('.terminal-text');
        
        if (e.key === 'Enter') {
            // Process command
            processCommand(currentCommand);
            
            // Add to history
            if (currentCommand.trim()) {
                commandHistory.push(currentCommand);
                historyIndex = commandHistory.length;
            }
            
            // Reset current command
            currentCommand = '';
            terminalText.textContent = '';
        } else if (e.key === 'Backspace') {
            // Remove last character
            if (currentCommand.length > 0) {
                currentCommand = currentCommand.slice(0, -1);
                terminalText.textContent = currentCommand;
                playSound('keypress');
            }
        } else if (e.key === 'ArrowUp') {
            // Navigate history up
            if (historyIndex > 0) {
                historyIndex--;
                currentCommand = commandHistory[historyIndex];
                terminalText.textContent = currentCommand;
            }
        } else if (e.key === 'ArrowDown') {
            // Navigate history down
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                currentCommand = commandHistory[historyIndex];
                terminalText.textContent = currentCommand;
            } else if (historyIndex === commandHistory.length - 1) {
                historyIndex = commandHistory.length;
                currentCommand = '';
                terminalText.textContent = '';
            }
        } else if (e.key.length === 1) {
            // Add character
            currentCommand += e.key;
            terminalText.textContent = currentCommand;
            playSound('keypress');
        }
    });
    
    // Process terminal command
    function processCommand(command) {
        const cmd = command.trim().toLowerCase();
        
        // Add command to terminal
        const newLine = document.createElement('div');
        newLine.className = 'terminal-line';
        newLine.innerHTML = `<span class="terminal-prompt">$</span> ${command}`;
        
        // Insert before the input line
        const inputLine = terminal.querySelector('.terminal-input');
        terminal.insertBefore(newLine, inputLine);
        
        // Process command
        let response = '';
        
        if (cmd === 'help') {
            response = `
                <div class="terminal-line">Available commands:</div>
                <div class="terminal-line">  help - Show this help message</div>
                <div class="terminal-line">  clear - Clear the terminal</div>
                <div class="terminal-line">  echo [text] - Echo text</div>
                <div class="terminal-line">  date - Show current date and time</div>
                <div class="terminal-line">  ls - List files</div>
                <div class="terminal-line">  achievement - Unlock a random achievement</div>
            `;
        } else if (cmd === 'clear') {
            // Clear terminal
            terminal.innerHTML = '';
            terminal.appendChild(inputLine);
            return;
        } else if (cmd.startsWith('echo ')) {
            const text = command.substring(5);
            response = `<div class="terminal-line">${text}</div>`;
        } else if (cmd === 'date') {
            const now = new Date();
            response = `<div class="terminal-line">${now.toString()}</div>`;
        } else if (cmd === 'ls') {
            response = `
                <div class="terminal-line">index.html</div>
                <div class="terminal-line">styles.css</div>
                <div class="terminal-line">main.js</div>
                <div class="terminal-line">README.md</div>
            `;
        } else if (cmd === 'achievement') {
            const achievements = ['first_file', 'code_master', 'bug_hunter', 'ai_friend', 'git_wizard', 'deployer', 'night_owl', 'speed_demon'];
            const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];
            unlockAchievement(randomAchievement);
            response = `<div class="terminal-line">Achievement unlocked!</div>`;
        } else if (cmd) {
            response = `<div class="terminal-line">Command not found: ${cmd}</div>`;
        }
        
        // Add response
        if (response) {
            const responseElement = document.createElement('div');
            responseElement.innerHTML = response;
            while (responseElement.firstChild) {
                terminal.insertBefore(responseElement.firstChild, inputLine);
            }
        }
        
        // Scroll to bottom
        terminal.scrollTop = terminal.scrollHeight;
    }
}

// Set up sound effects
function setupSoundEffects(enabled = false) {
    // Sound URLs (these would be actual sound files in a real app)
    const sounds = {
        'keypress': 'path/to/sounds/keypress.mp3',
        'achievement': 'path/to/sounds/achievement.mp3',
        'error': 'path/to/sounds/error.mp3',
        'success': 'path/to/sounds/success.mp3',
        'ai-thinking': 'path/to/sounds/ai-thinking.mp3',
        'ai-completion': 'path/to/sounds/ai-completion.mp3',
        'ai-open': 'path/to/sounds/ai-open.mp3',
        'ai-close': 'path/to/sounds/ai-close.mp3'
    };
    
    // Audio context for sound effects
    let audioContext = null;
    let soundBuffers = {};
    let soundEnabled = enabled;
    
    // Initialize audio context
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load sound files
            Object.keys(sounds).forEach(soundName => {
                // In a real app, we would load the actual sound files
                // For now, we'll just simulate it
                soundBuffers[soundName] = true;
            });
        }
    }
    
    // Play a sound
    window.playSound = function(name) {
        if (!soundEnabled || !soundBuffers[name]) return;
        
        // In a real app, we would play the actual sound
        // For now, we'll just log it
        console.log(`Playing sound: ${name}`);
    };
    
    // Toggle sound on/off
    window.toggleSound = function() {
        soundEnabled = !soundEnabled;
        
        // Show toast notification
        showToast(soundEnabled ? 'Sound effects enabled' : 'Sound effects disabled');
        
        return soundEnabled;
    };
    
    // Add sound toggle to status bar
    const statusBar = document.querySelector('.status-bar');
    if (statusBar) {
        const soundToggle = document.createElement('div');
        soundToggle.className = 'status-item sound-toggle';
        soundToggle.innerHTML = `<i class="fas fa-volume-mute"></i> Sound: Off`;
        soundToggle.addEventListener('click', () => {
            const isEnabled = toggleSound();
            soundToggle.innerHTML = isEnabled ? 
                `<i class="fas fa-volume-up"></i> Sound: On` : 
                `<i class="fas fa-volume-mute"></i> Sound: Off`;
        });
        
        statusBar.querySelector('.status-right').appendChild(soundToggle);
    }
    
    // Initialize on user interaction to comply with autoplay policies
    document.addEventListener('click', () => {
        initAudio();
    }, { once: true });
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '60px';
    toast.style.right = '20px';
    toast.style.backgroundColor = 'var(--bg-tertiary)';
    toast.style.color = 'var(--text-primary)';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = 'var(--glow-small)';
    toast.style.zIndex = '9999';
    toast.style.transition = 'opacity 0.3s ease';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Get random neon color
function getRandomNeonColor() {
    const colors = [
        'var(--accent-primary)',
        'var(--accent-secondary)',
        'var(--highlight)',
        'var(--success)',
        'var(--warning)'
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// Export theme functions
module.exports = {
    initDarkGameTheme,
    unlockAchievement: (id) => window.unlockAchievement(id),
    showAIThinking: () => window.showAIThinking(),
    showAICompletion: (thinking, content) => window.showAICompletion(thinking, content),
    playSound: (name) => window.playSound(name),
    toggleSound: () => window.toggleSound()
};
