// DevSpark IDE Renderer Process
// This file handles the renderer process functionality for the DevSpark IDE desktop application

// Import required modules
const monaco = require('monaco-editor');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Monaco Editor
    initMonacoEditor();
    
    // Set up UI event listeners
    setupUIEventListeners();
    
    // Set up IPC communication with main process
    setupIPCHandlers();
    
    // Initialize file explorer functionality
    initFileExplorer();
    
    // Initialize terminal functionality
    initTerminal();
    
    // Initialize AI assistant functionality
    initAIAssistant();
});

// Initialize Monaco Editor
function initMonacoEditor() {
    // Create Monaco Editor instance
    const editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: `// Welcome to DevSpark IDE
function calculateTotal(items) {
    return items.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
}

// Example usage
const items = [
    { name: 'Product 1', price: 10, quantity: 2 },
    { name: 'Product 2', price: 15, quantity: 1 },
    { name: 'Product 3', price: 20, quantity: 3 }
];

const total = calculateTotal(items);
console.log('Total:', total);`,
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: {
            enabled: true
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "'Consolas', 'Courier New', monospace",
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        tabSize: 4,
        insertSpaces: true
    });
    
    // Add editor to window for debugging
    window.editor = editor;
    
    // Handle editor resize
    window.addEventListener('resize', () => {
        editor.layout();
    });
    
    // Set up editor commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        saveCurrentFile();
    });
}

// Set up UI event listeners
function setupUIEventListeners() {
    // Sidebar navigation
    const sidebarButtons = document.querySelectorAll('.sidebar-icon');
    const panels = document.querySelectorAll('.panel');
    
    sidebarButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            sidebarButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding panel
            const panelId = button.id.replace('-btn', '-panel');
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.classList.contains(panelId)) {
                    panel.classList.add('active');
                }
            });
        });
    });
    
    // Tab handling
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // In a real implementation, this would load the corresponding file
        });
        
        const closeButton = tab.querySelector('.close-tab');
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            // In a real implementation, this would close the tab and unload the file
            tab.remove();
        });
    });
    
    // File explorer folder toggle
    const folderToggles = document.querySelectorAll('.folder-toggle');
    folderToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const folderHeader = toggle.parentElement;
            const folderContent = folderHeader.nextElementSibling;
            
            if (toggle.classList.contains('expanded')) {
                toggle.classList.remove('expanded');
                toggle.textContent = '►';
                folderContent.style.display = 'none';
            } else {
                toggle.classList.add('expanded');
                toggle.textContent = '▼';
                folderContent.style.display = 'block';
            }
        });
    });
    
    // File click handler
    const files = document.querySelectorAll('.file');
    files.forEach(file => {
        file.addEventListener('click', () => {
            // In a real implementation, this would open the file in the editor
            const fileName = file.textContent;
            openFile(fileName);
        });
    });
    
    // AI Assistant panel toggle
    const aiButton = document.getElementById('ai-btn');
    const aiPanel = document.querySelector('.ai-assistant-panel');
    const closeAiPanel = document.querySelector('.close-ai-panel');
    
    aiButton.addEventListener('click', () => {
        aiPanel.style.display = aiPanel.style.display === 'none' ? 'flex' : 'none';
    });
    
    closeAiPanel.addEventListener('click', () => {
        aiPanel.style.display = 'none';
    });
    
    // AI Assistant send message
    const aiInput = document.querySelector('.ai-assistant-input textarea');
    const sendButton = document.querySelector('.send-ai-message');
    
    sendButton.addEventListener('click', () => {
        sendAIMessage(aiInput.value);
        aiInput.value = '';
    });
    
    aiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendAIMessage(aiInput.value);
            aiInput.value = '';
        }
    });
    
    // Terminal tabs
    const terminalTabs = document.querySelectorAll('.terminal-tab');
    terminalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            terminalTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // In a real implementation, this would switch terminal views
        });
    });
    
    // New file button
    const newFileBtn = document.getElementById('new-file-btn');
    newFileBtn.addEventListener('click', () => {
        createNewFile();
    });
    
    // New folder button
    const newFolderBtn = document.getElementById('new-folder-btn');
    newFolderBtn.addEventListener('click', () => {
        createNewFolder();
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    refreshBtn.addEventListener('click', () => {
        refreshFileExplorer();
    });
    
    // Collapse all button
    const collapseAllBtn = document.getElementById('collapse-all-btn');
    collapseAllBtn.addEventListener('click', () => {
        collapseAllFolders();
    });
}

// Set up IPC handlers for communication with main process
function setupIPCHandlers() {
    // Handle menu events from main process
    window.electronAPI.onUpdateAvailable(() => {
        showNotification('Update Available', 'A new version of DevSpark IDE is available.');
    });
    
    window.electronAPI.onUpdateDownloaded(() => {
        showNotification('Update Ready', 'Update has been downloaded. Restart to install.', true);
    });
    
    window.electronAPI.onUncaughtException((message) => {
        showNotification('Error', `An error occurred: ${message}`, false);
    });
}

// Initialize file explorer functionality
function initFileExplorer() {
    // In a real implementation, this would load the file system
    console.log('File explorer initialized');
}

// Initialize terminal functionality
function initTerminal() {
    // In a real implementation, this would set up a real terminal
    console.log('Terminal initialized');
    
    // Simulate terminal input
    const terminal = document.querySelector('.terminal');
    const currentLine = document.querySelector('.current-line');
    const terminalInput = document.querySelector('.terminal-input');
    const terminalCursor = document.querySelector('.terminal-cursor');
    
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
            if (e.key.length === 1) {
                terminalInput.textContent += e.key;
            } else if (e.key === 'Backspace') {
                terminalInput.textContent = terminalInput.textContent.slice(0, -1);
            } else if (e.key === 'Enter') {
                executeTerminalCommand(terminalInput.textContent);
                terminalInput.textContent = '';
            }
        }
    });
}

// Initialize AI assistant functionality
function initAIAssistant() {
    // In a real implementation, this would connect to an AI service
    console.log('AI Assistant initialized');
}

// Open a file in the editor
function openFile(fileName) {
    console.log(`Opening file: ${fileName}`);
    // In a real implementation, this would read the file and load it into the editor
    
    // For demo purposes, we'll simulate opening a file
    const tabs = document.querySelector('.tabs');
    const existingTab = Array.from(tabs.querySelectorAll('.tab')).find(tab => tab.querySelector('span').textContent === fileName);
    
    if (existingTab) {
        // If tab already exists, just activate it
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        existingTab.classList.add('active');
    } else {
        // Create a new tab
        const newTab = document.createElement('div');
        newTab.className = 'tab';
        newTab.innerHTML = `<span>${fileName}</span><button class="close-tab">×</button>`;
        tabs.appendChild(newTab);
        
        // Activate the new tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        newTab.classList.add('active');
        
        // Add event listeners to the new tab
        newTab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            newTab.classList.add('active');
        });
        
        const closeButton = newTab.querySelector('.close-tab');
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            newTab.remove();
        });
    }
}

// Save the current file
function saveCurrentFile() {
    console.log('Saving current file');
    // In a real implementation, this would save the current file
    
    // For demo purposes, we'll show a notification
    showNotification('File Saved', 'Your file has been saved successfully.');
}

// Create a new file
function createNewFile() {
    console.log('Creating new file');
    // In a real implementation, this would create a new file
    
    // For demo purposes, we'll show a dialog
    const fileName = prompt('Enter file name:');
    if (fileName) {
        // Add the file to the explorer
        const fileExplorer = document.querySelector('.file-explorer');
        const newFile = document.createElement('div');
        newFile.className = 'file';
        newFile.textContent = fileName;
        fileExplorer.appendChild(newFile);
        
        // Add event listener to the new file
        newFile.addEventListener('click', () => {
            openFile(fileName);
        });
        
        // Open the file
        openFile(fileName);
    }
}

// Create a new folder
function createNewFolder() {
    console.log('Creating new folder');
    // In a real implementation, this would create a new folder
    
    // For demo purposes, we'll show a dialog
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        // Add the folder to the explorer
        const fileExplorer = document.querySelector('.file-explorer');
        const newFolder = document.createElement('div');
        newFolder.className = 'folder';
        newFolder.innerHTML = `
            <div class="folder-header">
                <span class="folder-toggle expanded">▼</span>
                <span class="folder-name">${folderName}</span>
            </div>
            <div class="folder-content"></div>
        `;
        fileExplorer.appendChild(newFolder);
        
        // Add event listener to the new folder toggle
        const toggle = newFolder.querySelector('.folder-toggle');
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const folderHeader = toggle.parentElement;
            const folderContent = folderHeader.nextElementSibling;
            
            if (toggle.classList.contains('expanded')) {
                toggle.classList.remove('expanded');
                toggle.textContent = '►';
                folderContent.style.display = 'none';
            } else {
                toggle.classList.add('expanded');
                toggle.textContent = '▼';
                folderContent.style.display = 'block';
            }
        });
    }
}

// Refresh the file explorer
function refreshFileExplorer() {
    console.log('Refreshing file explorer');
    // In a real implementation, this would refresh the file explorer
    
    // For demo purposes, we'll show a notification
    showNotification('Refreshed', 'File explorer has been refreshed.');
}

// Collapse all folders
function collapseAllFolders() {
    console.log('Collapsing all folders');
    // In a real implementation, this would collapse all folders
    
    const folderToggles = document.querySelectorAll('.folder-toggle.expanded');
    folderToggles.forEach(toggle => {
        toggle.classList.remove('expanded');
        toggle.textContent = '►';
        const folderHeader = toggle.parentElement;
        const folderContent = folderHeader.nextElementSibling;
        folderContent.style.display = 'none';
    });
}

// Send a message to the AI assistant
function sendAIMessage(message) {
    if (!message.trim()) return;
    
    console.log(`Sending message to AI: ${message}`);
    // In a real implementation, this would send the message to an AI service
    
    // Add user message to the chat
    const aiContent = document.querySelector('.ai-assistant-content');
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `
        <div class="user-avatar">You</div>
        <div class="user-message-content">
            <p>${message}</p>
        </div>
    `;
    aiContent.appendChild(userMessage);
    
    // Simulate AI response
    setTimeout(() => {
        const aiResponse = document.createElement('div');
        aiResponse.className = 'ai-message';
        aiResponse.innerHTML = `
            <div class="ai-avatar">AI</div>
            <div class="ai-message-content">
                <p>I've analyzed your request: "${message}"</p>
                <p>Here's a sample response that would be generated by the AI assistant based on your input. In a real implementation, this would be a response from an AI service.</p>
            </div>
        `;
        aiContent.appendChild(aiResponse);
        
        // Scroll to bottom
        aiContent.scrollTop = aiContent.scrollHeight;
    }, 1000);
    
    // Scroll to bottom
    aiContent.scrollTop = aiContent.scrollHeight;
}

// Execute a terminal command
function executeTerminalCommand(command) {
    console.log(`Executing command: ${command}`);
    // In a real implementation, this would execute the command
    
    // Add the command to the terminal
    const terminal = document.querySelector('.terminal');
    const currentLine = document.querySelector('.current-line');
    
    // Create a new line for the executed command
    const commandLine = document.createElement('div');
    commandLine.className = 'terminal-line';
    commandLine.innerHTML = `
        <span class="terminal-prompt">$</span>
        <span class="terminal-command">${command}</span>
    `;
    terminal.insertBefore(commandLine, currentLine);
    
    // Add command output
    const output = document.createElement('div');
    output.className = 'terminal-output';
    
    // Simulate different command outputs
    if (command === 'help') {
        output.innerHTML = `
            <div>Available commands:</div>
            <div>help - Show this help message</div>
            <div>clear - Clear the terminal</div>
            <div>version - Show DevSpark IDE version</div>
            <div>ls - List files in current directory</div>
        `;
    } else if (command === 'clear') {
        // Clear all terminal content except the current line
        const terminalLines = terminal.querySelectorAll('.terminal-line:not(.current-line), .terminal-output');
        terminalLines.forEach(line => line.remove());
        return;
    } else if (command === 'version') {
        output.innerHTML = `<div>DevSpark IDE v${window.devsparkVersion.version}</div>`;
    } else if (command === 'ls') {
        output.innerHTML = `
            <div>src/</div>
            <div>package.json</div>
            <div>README.md</div>
        `;
    } else {
        output.innerHTML = `<div>Command not found: ${command}</div>`;
    }
    
    terminal.insertBefore(output, currentLine);
    
    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;
}

// Show a notification
function showNotification(title, message, showAction = false) {
    console.log(`Notification: ${title} - ${message}`);
    // In a real implementation, this would show a notification
    
    // For demo purposes, we'll create a simple notification
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--bg-tertiary)';
    notification.style.color = 'var(--text-primary)';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '300px';
    
    let notificationContent = `
        <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
        <div>${message}</div>
    `;
    
    if (showAction) {
        notificationContent += `
            <div style="margin-top: 10px;">
                <button id="notification-action" style="background-color: var(--accent-primary); color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    Restart Now
                </button>
            </div>
        `;
    }
    
    notification.innerHTML = notificationContent;
    document.body.appendChild(notification);
    
    // Add action button event listener
    if (showAction) {
        const actionButton = document.getElementById('notification-action');
        actionButton.addEventListener('click', () => {
            window.electronAPI.installUpdate();
        });
    }
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}
