// Simplified renderer.js for testing
document.addEventListener('DOMContentLoaded', () => {
    console.log('DevSpark IDE initialized');
    
    // Set up UI event listeners
    setupUIEventListeners();
    
    // Set up IPC handlers
    setupIPCHandlers();
    
    // Initialize Monaco Editor placeholder
    initEditorPlaceholder();
});

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
        });
        
        const closeButton = tab.querySelector('.close-tab');
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
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
}

// Set up IPC handlers
function setupIPCHandlers() {
    // Handle menu events from main process
    window.electronAPI.onMenuEvent((event) => {
        console.log('Menu event received:', event);
        
        switch (event) {
            case 'newFile':
                showNotification('New File', 'Creating new file...');
                break;
            case 'openFile':
                openFile();
                break;
            case 'save':
                saveFile();
                break;
        }
    });
}

// Initialize a placeholder for Monaco Editor
function initEditorPlaceholder() {
    const editorContainer = document.getElementById('monaco-editor');
    
    // Create a simple editor placeholder
    editorContainer.innerHTML = `
        <div style="padding: 20px; font-family: monospace; white-space: pre; color: #cccccc; height: 100%; overflow: auto;">
// Welcome to DevSpark IDE
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
console.log('Total:', total);
        </div>
    `;
}

// Open a file
async function openFile() {
    try {
        const result = await window.electronAPI.openFile();
        if (result) {
            showNotification('File Opened', `Opened: ${result.filePath}`);
            // In a real implementation, this would load the file into the editor
        }
    } catch (error) {
        console.error('Error opening file:', error);
        showNotification('Error', 'Failed to open file');
    }
}

// Save a file
async function saveFile() {
    try {
        const content = document.querySelector('#monaco-editor div').textContent;
        const result = await window.electronAPI.saveFile({
            defaultPath: 'untitled.js',
            content: content
        });
        
        if (result) {
            showNotification('File Saved', 'File saved successfully');
        }
    } catch (error) {
        console.error('Error saving file:', error);
        showNotification('Error', 'Failed to save file');
    }
}

// Show a notification
function showNotification(title, message) {
    console.log(`Notification: ${title} - ${message}`);
    
    // Create a simple notification
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
    
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
        <div>${message}</div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}
