// OAuth Integration Service for DevSparkDesktop
// This service handles OAuth authentication for multiple providers in Electron

const { BrowserWindow } = require('electron');
const url = require('url');
const fetch = require('node-fetch');

class OAuthService {
    constructor() {
        this.providers = {
            google: {
                clientId: 'YOUR_GOOGLE_CLIENT_ID',
                redirectUri: 'https://devspark.app/auth/google/callback',
                authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenUrl: 'https://oauth2.googleapis.com/token',
                scope: 'email profile',
                responseType: 'code'
            },
            github: {
                clientId: 'YOUR_GITHUB_CLIENT_ID',
                redirectUri: 'https://devspark.app/auth/github/callback',
                authUrl: 'https://github.com/login/oauth/authorize',
                tokenUrl: 'https://github.com/login/oauth/access_token',
                scope: 'user:email',
                responseType: 'code'
            },
            microsoft: {
                clientId: 'YOUR_MICROSOFT_CLIENT_ID',
                redirectUri: 'https://devspark.app/auth/microsoft/callback',
                authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
                tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
                scope: 'openid profile email',
                responseType: 'code'
            },
            apple: {
                clientId: 'YOUR_APPLE_CLIENT_ID',
                redirectUri: 'https://devspark.app/auth/apple/callback',
                authUrl: 'https://appleid.apple.com/auth/authorize',
                tokenUrl: 'https://appleid.apple.com/auth/token',
                scope: 'name email',
                responseType: 'code'
            },
            twitter: {
                clientId: 'YOUR_TWITTER_CLIENT_ID',
                redirectUri: 'https://devspark.app/auth/twitter/callback',
                authUrl: 'https://twitter.com/i/oauth2/authorize',
                tokenUrl: 'https://api.twitter.com/2/oauth2/token',
                scope: 'tweet.read users.read',
                responseType: 'code'
            },
            discord: {
                clientId: 'YOUR_DISCORD_CLIENT_ID',
                redirectUri: 'https://devspark.app/auth/discord/callback',
                authUrl: 'https://discord.com/api/oauth2/authorize',
                tokenUrl: 'https://discord.com/api/oauth2/token',
                scope: 'identify email',
                responseType: 'code'
            }
        };
        
        this.authWindow = null;
    }

    // Initialize OAuth providers with environment-specific configuration
    init(config) {
        if (config) {
            Object.keys(config).forEach(provider => {
                if (this.providers[provider]) {
                    this.providers[provider] = {
                        ...this.providers[provider],
                        ...config[provider]
                    };
                }
            });
        }
        
        console.log('OAuth providers initialized for desktop application');
    }

    // Generate OAuth authorization URL for the specified provider
    getAuthorizationUrl(provider) {
        if (!this.providers[provider]) {
            throw new Error(`Provider ${provider} not supported`);
        }

        const providerConfig = this.providers[provider];
        const params = new URLSearchParams({
            client_id: providerConfig.clientId,
            redirect_uri: providerConfig.redirectUri,
            scope: providerConfig.scope,
            response_type: providerConfig.responseType,
            state: this.generateState()
        });

        return `${providerConfig.authUrl}?${params.toString()}`;
    }

    // Generate a random state parameter to prevent CSRF attacks
    generateState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // Exchange authorization code for access token
    async exchangeCodeForToken(provider, code) {
        if (!this.providers[provider]) {
            throw new Error(`Provider ${provider} not supported`);
        }

        const providerConfig = this.providers[provider];
        
        // In a real implementation, this would be done through a secure backend
        // to protect client secrets
        const response = await fetch(providerConfig.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                client_id: providerConfig.clientId,
                client_secret: 'CLIENT_SECRET_SHOULD_BE_SECURED',
                code: code,
                redirect_uri: providerConfig.redirectUri,
                grant_type: 'authorization_code'
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        return await response.json();
    }

    // Get user profile from provider using access token
    async getUserProfile(provider, accessToken) {
        let userInfoUrl;
        let headers = {
            'Authorization': `Bearer ${accessToken}`
        };

        switch (provider) {
            case 'google':
                userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
                break;
            case 'github':
                userInfoUrl = 'https://api.github.com/user';
                break;
            case 'microsoft':
                userInfoUrl = 'https://graph.microsoft.com/v1.0/me';
                break;
            case 'apple':
                // Apple doesn't have a user info endpoint, user info is in the ID token
                return { provider: 'apple' };
            case 'twitter':
                userInfoUrl = 'https://api.twitter.com/2/users/me';
                break;
            case 'discord':
                userInfoUrl = 'https://discord.com/api/users/@me';
                break;
            default:
                throw new Error(`Provider ${provider} not supported`);
        }

        const response = await fetch(userInfoUrl, { headers });
        
        if (!response.ok) {
            throw new Error('Failed to get user profile');
        }

        const userData = await response.json();
        return {
            provider,
            id: userData.id || userData.sub,
            name: userData.name || userData.display_name || userData.username,
            email: userData.email,
            avatar: userData.picture || userData.avatar_url || userData.avatar,
            raw: userData
        };
    }

    // Initiate OAuth flow for a provider in Electron
    initiateOAuth(provider, parentWindow) {
        return new Promise((resolve, reject) => {
            try {
                const authUrl = this.getAuthorizationUrl(provider);
                
                // Create a new browser window for the OAuth flow
                this.authWindow = new BrowserWindow({
                    width: 800,
                    height: 600,
                    show: true,
                    parent: parentWindow,
                    modal: true,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true
                    }
                });
                
                // Load the OAuth authorization URL
                this.authWindow.loadURL(authUrl);
                
                // Set up event handlers
                this.authWindow.webContents.on('will-redirect', async (event, callbackUrl) => {
                    if (callbackUrl.startsWith(this.providers[provider].redirectUri)) {
                        event.preventDefault();
                        
                        try {
                            // Extract the authorization code from the callback URL
                            const urlParts = url.parse(callbackUrl, true);
                            const code = urlParts.query.code;
                            
                            if (!code) {
                                throw new Error('No authorization code found in callback URL');
                            }
                            
                            // Exchange the code for an access token
                            const tokenResponse = await this.exchangeCodeForToken(provider, code);
                            
                            // Get the user profile
                            const userProfile = await this.getUserProfile(provider, tokenResponse.access_token);
                            
                            // Close the auth window
                            this.authWindow.close();
                            this.authWindow = null;
                            
                            // Resolve the promise with the authentication result
                            resolve({
                                provider,
                                accessToken: tokenResponse.access_token,
                                refreshToken: tokenResponse.refresh_token,
                                expiresIn: tokenResponse.expires_in,
                                userProfile
                            });
                        } catch (error) {
                            this.authWindow.close();
                            this.authWindow = null;
                            reject(error);
                        }
                    }
                });
                
                // Handle window close
                this.authWindow.on('closed', () => {
                    this.authWindow = null;
                    reject(new Error('Authentication window was closed'));
                });
                
            } catch (error) {
                if (this.authWindow) {
                    this.authWindow.close();
                    this.authWindow = null;
                }
                reject(error);
            }
        });
    }
    
    // Handle login with email and password
    async loginWithEmailPassword(email, password) {
        try {
            // In a real implementation, this would communicate with a secure backend
            const response = await fetch('https://api.devspark.app/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Login failed');
            }
            
            const data = await response.json();
            
            // Store the authentication token securely
            this.storeAuthToken(data.token);
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    // Store authentication token securely
    storeAuthToken(token) {
        // In a real implementation, this would use the system's secure storage
        // For Electron, you might use the keytar module or electron-store with encryption
        console.log('Storing auth token securely');
    }
    
    // Get the stored authentication token
    getAuthToken() {
        // In a real implementation, this would retrieve from secure storage
        console.log('Retrieving auth token from secure storage');
        return null; // Placeholder
    }
    
    // Check if the user is authenticated
    isAuthenticated() {
        const token = this.getAuthToken();
        return !!token;
    }
    
    // Log out the current user
    logout() {
        // Clear the stored authentication token
        console.log('Clearing auth token');
        // In a real implementation, this would remove the token from secure storage
    }
}

// Export the service
module.exports = new OAuthService();
