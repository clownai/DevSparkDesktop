// Authentication System Test Script for DevSparkDesktop
// This script tests the OAuth service and login functionality in Electron

const { BrowserWindow } = require('electron');
const assert = require('assert');
const oauthService = require('../main/oauth-service');

// Test configuration
const testConfig = {
    google: {
        clientId: 'test-google-client-id',
        redirectUri: 'https://devspark.app/auth/google/callback'
    },
    github: {
        clientId: 'test-github-client-id',
        redirectUri: 'https://devspark.app/auth/github/callback'
    },
    microsoft: {
        clientId: 'test-microsoft-client-id',
        redirectUri: 'https://devspark.app/auth/microsoft/callback'
    },
    apple: {
        clientId: 'test-apple-client-id',
        redirectUri: 'https://devspark.app/auth/apple/callback'
    }
};

// Mock fetch for testing
global.fetch = async (url, options) => {
    console.log(`Mock fetch called with URL: ${url}`);
    console.log('Options:', options);
    
    // Simulate successful token response
    if (url.includes('token')) {
        return {
            ok: true,
            json: async () => ({
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                expires_in: 3600,
                token_type: 'Bearer'
            })
        };
    }
    
    // Simulate successful user profile response
    if (url.includes('userinfo') || url.includes('user') || url.includes('me')) {
        return {
            ok: true,
            json: async () => ({
                id: 'user123',
                sub: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                picture: 'https://example.com/avatar.jpg'
            })
        };
    }
    
    // Simulate successful login response
    if (url.includes('login')) {
        return {
            ok: true,
            json: async () => ({
                token: 'mock-jwt-token',
                user: {
                    id: 'user123',
                    name: 'Test User',
                    email: 'test@example.com'
                }
            })
        };
    }
    
    return {
        ok: false,
        json: async () => ({ message: 'Not found' })
    };
};

// Mock BrowserWindow for testing
let mockAuthWindow = null;
BrowserWindow.prototype.loadURL = function(url) {
    console.log(`Mock BrowserWindow loading URL: ${url}`);
    mockAuthWindow = this;
    
    // Simulate the OAuth redirect after a short delay
    setTimeout(() => {
        const provider = url.includes('google') ? 'google' : 
                        url.includes('github') ? 'github' : 
                        url.includes('microsoft') ? 'microsoft' : 'apple';
        
        const redirectUri = testConfig[provider].redirectUri;
        const callbackUrl = `${redirectUri}?code=test-auth-code&state=test-state`;
        
        // Trigger the will-redirect event
        if (this.webContents && this.webContents.emit) {
            this.webContents.emit('will-redirect', { preventDefault: () => {} }, callbackUrl);
        }
    }, 100);
    
    return Promise.resolve();
};

BrowserWindow.prototype.close = function() {
    console.log('Mock BrowserWindow closed');
    mockAuthWindow = null;
};

// Test initialization
function testInit() {
    console.log('Testing OAuth service initialization...');
    oauthService.init(testConfig);
    console.log('OAuth service initialized with test configuration');
}

// Test authorization URL generation
function testAuthorizationUrl() {
    console.log('Testing authorization URL generation...');
    
    const providers = ['google', 'github', 'microsoft', 'apple'];
    
    providers.forEach(provider => {
        try {
            const authUrl = oauthService.getAuthorizationUrl(provider);
            console.log(`${provider} authorization URL: ${authUrl}`);
            
            // Verify URL contains required parameters
            const urlObj = new URL(authUrl);
            const params = urlObj.searchParams;
            
            assert(params.has('client_id'), `${provider} URL missing client_id`);
            assert(params.has('redirect_uri'), `${provider} URL missing redirect_uri`);
            assert(params.has('scope'), `${provider} URL missing scope`);
            assert(params.has('response_type'), `${provider} URL missing response_type`);
            assert(params.has('state'), `${provider} URL missing state`);
            
            console.log(`${provider} authorization URL generation: SUCCESS`);
        } catch (error) {
            console.error(`${provider} authorization URL generation: FAILED`, error);
        }
    });
}

// Test OAuth flow in Electron
async function testOAuthFlow() {
    console.log('Testing OAuth flow in Electron...');
    
    const testProvider = 'google';
    const mockParentWindow = new BrowserWindow({ width: 800, height: 600 });
    
    try {
        const result = await oauthService.initiateOAuth(testProvider, mockParentWindow);
        
        console.log('OAuth flow result:', result);
        
        // Verify result contains expected properties
        assert(result.provider === testProvider, 'Result has incorrect provider');
        assert(result.accessToken === 'mock-access-token', 'Result missing access token');
        assert(result.refreshToken === 'mock-refresh-token', 'Result missing refresh token');
        assert(result.expiresIn === 3600, 'Result has incorrect expires_in');
        assert(result.userProfile, 'Result missing user profile');
        
        console.log('OAuth flow in Electron: SUCCESS');
    } catch (error) {
        console.error('OAuth flow in Electron: FAILED', error);
    }
}

// Test email/password login
async function testEmailPasswordLogin() {
    console.log('Testing email/password login...');
    
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    try {
        const result = await oauthService.loginWithEmailPassword(testEmail, testPassword);
        
        console.log('Email/password login result:', result);
        
        // Verify result contains expected properties
        assert(result.token === 'mock-jwt-token', 'Result missing JWT token');
        assert(result.user, 'Result missing user data');
        assert(result.user.email === testEmail, 'Result has incorrect user email');
        
        console.log('Email/password login: SUCCESS');
    } catch (error) {
        console.error('Email/password login: FAILED', error);
    }
}

// Test authentication token storage
function testAuthTokenStorage() {
    console.log('Testing authentication token storage...');
    
    try {
        // Test storing token
        oauthService.storeAuthToken('test-auth-token');
        
        // Test retrieving token
        const token = oauthService.getAuthToken();
        console.log('Retrieved token:', token);
        
        // Test isAuthenticated
        const isAuthenticated = oauthService.isAuthenticated();
        console.log('Is authenticated:', isAuthenticated);
        
        // Test logout
        oauthService.logout();
        
        console.log('Authentication token storage: SUCCESS');
    } catch (error) {
        console.error('Authentication token storage: FAILED', error);
    }
}

// Run all tests
async function runTests() {
    console.log('Starting OAuth service tests for desktop application...');
    
    testInit();
    testAuthorizationUrl();
    await testOAuthFlow();
    await testEmailPasswordLogin();
    testAuthTokenStorage();
    
    console.log('All desktop application authentication tests completed');
}

// Execute tests
runTests().catch(error => {
    console.error('Test execution failed:', error);
});

module.exports = {
    runTests,
    testInit,
    testAuthorizationUrl,
    testOAuthFlow,
    testEmailPasswordLogin,
    testAuthTokenStorage
};
