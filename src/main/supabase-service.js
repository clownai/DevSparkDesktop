// Supabase Integration Service for DevSparkDesktop
// This service handles authentication using Supabase in Electron

const { BrowserWindow } = require('electron');
const { createClient } = require('@supabase/supabase-js');
const url = require('url');
const keytar = require('keytar'); // For secure token storage
const SERVICE_NAME = 'DevSparkDesktop';

class SupabaseService {
    constructor() {
        this.supabaseUrl = 'https://your-project-url.supabase.co'; // Replace with actual project URL
        this.supabaseKey = 'sbp_ee949a019ab58d9264b37fb1373de33c5172b1d7';
        this.supabase = null;
        this.authWindow = null;
        
        // OAuth providers supported by Supabase
        this.providers = [
            'google',
            'github',
            'microsoft',
            'apple',
            'twitter',
            'discord',
            'facebook',
            'gitlab',
            'bitbucket',
            'figma',
            'kakao',
            'keycloak'
        ];
    }

    // Initialize Supabase client
    init(config = {}) {
        if (config.supabaseUrl) {
            this.supabaseUrl = config.supabaseUrl;
        }
        
        if (config.supabaseKey) {
            this.supabaseKey = config.supabaseKey;
        }
        
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
        
        console.log('Supabase client initialized for desktop application');
        
        return this.supabase;
    }
    
    // Get the Supabase client instance
    getClient() {
        if (!this.supabase) {
            this.init();
        }
        return this.supabase;
    }
    
    // Get current session
    async getSession() {
        try {
            const { data, error } = await this.getClient().auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
                return null;
            }
            return data.session;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }
    
    // Get current user
    async getUser() {
        try {
            const { data, error } = await this.getClient().auth.getUser();
            if (error) {
                console.error('Error getting user:', error);
                return null;
            }
            return data.user;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }
    
    // Sign up with email and password
    async signUp(email, password, options = {}) {
        try {
            const { data, error } = await this.getClient().auth.signUp({
                email,
                password,
                options
            });
            
            if (error) {
                console.error('Error signing up:', error);
                throw error;
            }
            
            if (data.session) {
                await this.storeSession(data.session);
            }
            
            return data;
        } catch (error) {
            console.error('Error in signUp:', error);
            throw error;
        }
    }
    
    // Sign in with email and password
    async signInWithPassword(email, password) {
        try {
            const { data, error } = await this.getClient().auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                console.error('Error signing in:', error);
                throw error;
            }
            
            if (data.session) {
                await this.storeSession(data.session);
            }
            
            return data;
        } catch (error) {
            console.error('Error in signInWithPassword:', error);
            throw error;
        }
    }
    
    // Sign in with OAuth provider in Electron
    async signInWithOAuth(provider, parentWindow) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.providers.includes(provider)) {
                    throw new Error(`Provider ${provider} not supported`);
                }
                
                // Get the OAuth URL from Supabase
                const { data, error } = await this.getClient().auth.signInWithOAuth({
                    provider,
                    options: {
                        redirectTo: 'https://devspark.app/auth/callback'
                    }
                });
                
                if (error) {
                    throw error;
                }
                
                const authUrl = data.url;
                
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
                    if (callbackUrl.includes('/auth/callback')) {
                        event.preventDefault();
                        
                        try {
                            // Extract the hash or query parameters from the callback URL
                            const urlObj = new URL(callbackUrl);
                            const params = new URLSearchParams(urlObj.hash ? urlObj.hash.substring(1) : urlObj.search);
                            
                            // Get the access token and refresh token
                            const accessToken = params.get('access_token');
                            const refreshToken = params.get('refresh_token');
                            
                            if (accessToken && refreshToken) {
                                // Set the session in Supabase
                                const { data, error } = await this.getClient().auth.setSession({
                                    access_token: accessToken,
                                    refresh_token: refreshToken
                                });
                                
                                if (error) {
                                    throw error;
                                }
                                
                                // Store the session securely
                                if (data.session) {
                                    await this.storeSession(data.session);
                                }
                                
                                // Close the auth window
                                this.authWindow.close();
                                this.authWindow = null;
                                
                                // Resolve the promise with the session
                                resolve(data);
                            } else {
                                // Check if there's an error in the URL
                                const errorMessage = params.get('error_description') || params.get('error') || 'Authentication failed';
                                throw new Error(errorMessage);
                            }
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
    
    // Sign out
    async signOut() {
        try {
            const { error } = await this.getClient().auth.signOut();
            
            if (error) {
                console.error('Error signing out:', error);
                throw error;
            }
            
            // Clear stored session
            await this.clearSession();
            
            return true;
        } catch (error) {
            console.error('Error in signOut:', error);
            throw error;
        }
    }
    
    // Reset password
    async resetPassword(email) {
        try {
            const { data, error } = await this.getClient().auth.resetPasswordForEmail(email, {
                redirectTo: 'https://devspark.app/reset-password'
            });
            
            if (error) {
                console.error('Error resetting password:', error);
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error('Error in resetPassword:', error);
            throw error;
        }
    }
    
    // Update user
    async updateUser(attributes) {
        try {
            const { data, error } = await this.getClient().auth.updateUser(attributes);
            
            if (error) {
                console.error('Error updating user:', error);
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error('Error in updateUser:', error);
            throw error;
        }
    }
    
    // Store session securely using keytar
    async storeSession(session) {
        try {
            if (!session) return;
            
            // Store access token
            await keytar.setPassword(
                SERVICE_NAME,
                'access_token',
                session.access_token
            );
            
            // Store refresh token
            await keytar.setPassword(
                SERVICE_NAME,
                'refresh_token',
                session.refresh_token
            );
            
            // Store user ID
            if (session.user && session.user.id) {
                await keytar.setPassword(
                    SERVICE_NAME,
                    'user_id',
                    session.user.id
                );
            }
            
            console.log('Session stored securely');
        } catch (error) {
            console.error('Error storing session:', error);
        }
    }
    
    // Retrieve session from secure storage
    async retrieveSession() {
        try {
            const accessToken = await keytar.getPassword(SERVICE_NAME, 'access_token');
            const refreshToken = await keytar.getPassword(SERVICE_NAME, 'refresh_token');
            
            if (!accessToken || !refreshToken) {
                return null;
            }
            
            // Set the session in Supabase
            const { data, error } = await this.getClient().auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            
            if (error) {
                console.error('Error setting session:', error);
                await this.clearSession();
                return null;
            }
            
            return data.session;
        } catch (error) {
            console.error('Error retrieving session:', error);
            return null;
        }
    }
    
    // Clear stored session
    async clearSession() {
        try {
            await keytar.deletePassword(SERVICE_NAME, 'access_token');
            await keytar.deletePassword(SERVICE_NAME, 'refresh_token');
            await keytar.deletePassword(SERVICE_NAME, 'user_id');
            console.log('Session cleared');
        } catch (error) {
            console.error('Error clearing session:', error);
        }
    }
    
    // Check if user is authenticated
    async isAuthenticated() {
        const session = await this.getSession();
        return !!session;
    }
    
    // Listen to auth state changes
    onAuthStateChange(callback) {
        return this.getClient().auth.onAuthStateChange(callback);
    }
    
    // Get user profile from profiles table
    async getUserProfile(userId) {
        try {
            const { data, error } = await this.getClient()
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error) {
                console.error('Error getting user profile:', error);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error in getUserProfile:', error);
            return null;
        }
    }
    
    // Update user profile in profiles table
    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await this.getClient()
                .from('profiles')
                .update(updates)
                .eq('id', userId);
                
            if (error) {
                console.error('Error updating user profile:', error);
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error('Error in updateUserProfile:', error);
            throw error;
        }
    }
    
    // Create user profile in profiles table
    async createUserProfile(profile) {
        try {
            const { data, error } = await this.getClient()
                .from('profiles')
                .insert([profile]);
                
            if (error) {
                console.error('Error creating user profile:', error);
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error('Error in createUserProfile:', error);
            throw error;
        }
    }
}

// Export the service
module.exports = new SupabaseService();
