import { UAParser } from 'ua-parser-js';
import { ClientInfo, DeviceInfo, LocationData } from './types';

// Utility function to extract client info from request
export function extractClientInfo(req: any): ClientInfo {
  let userAgent = '';
  let ipAddress = '';

  if (req) {
    userAgent = req.headers?.['user-agent'] || '';

    // Try multiple headers for IP address
    ipAddress = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers?.['x-real-ip'] ||
      req.headers?.['cf-connecting-ip'] || // Cloudflare
      req.headers?.['x-client-ip'] ||
      req.socket?.remoteAddress ||
      req.connection?.remoteAddress ||
      '';
  }

  // Clean up IP address (remove IPv6 prefix if present)
  if (ipAddress && ipAddress.startsWith('::ffff:')) {
    ipAddress = ipAddress.substring(7);
  }

  return { userAgent, ipAddress };
}

// Helper function to get current session token from request
export function getCurrentSessionToken(request: any): string | null {
  return request.cookies?.get('next-auth.session-token')?.value ||
    request.cookies?.get('__Secure-next-auth.session-token')?.value ||
    null;
}

// Helper function to get current session token from browser cookies
export function getCurrentSessionTokenFromBrowser(): string | null {
  if (typeof document === 'undefined') return null;
  
  // Try to get session token from cookies
  const cookies = document.cookie.split('; ');
  
  // Check for both development and production cookie names
  const sessionToken = cookies.find(row => row.startsWith('next-auth.session-token='))?.split('=')[1] ||
                      cookies.find(row => row.startsWith('__Secure-next-auth.session-token='))?.split('=')[1];
  
  return sessionToken || null;
}

// Parse device information from user agent
export function parseDeviceInfo(userAgent: string): DeviceInfo {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();
  
  // Better device type detection
  const deviceType = device.type || 
                    (userAgent.toLowerCase().includes('mobile') ? 'mobile' : 
                     userAgent.toLowerCase().includes('tablet') ? 'tablet' : 'desktop');
  
  // Better device model detection with fallbacks
  let deviceModel = '';
  if (device.vendor && device.model) {
    deviceModel = `${device.vendor} ${device.model}`.trim();
  } else if (device.model) {
    deviceModel = device.model;
  } else if (os.name) {
    deviceModel = `${os.name} ${os.version || ''}`.trim();
  } else if (browser.name) {
    deviceModel = `${browser.name} ${browser.version || ''}`.trim();
  }

  return {
    deviceType: deviceType || 'desktop',
    deviceModel: deviceModel || '',
    browser: browser.name ? `${browser.name} ${browser.version || ''}`.trim() : undefined,
    os: os.name ? `${os.name} ${os.version || ''}`.trim() : undefined
  };
}

// Capitalize first character of device type
export function capitalizeDeviceType(deviceType: string | null | undefined): string {
  if (!deviceType) return 'N/A';
  
  return deviceType.charAt(0).toUpperCase() + deviceType.slice(1).toLowerCase();
}

// Format location display with proper handling for localhost
export function formatLocation(city?: string | null, country?: string | null, ipAddress?: string | null): string {
  // Check if it's localhost or local IP
  if (ipAddress && (
    ipAddress === '127.0.0.1' || 
    ipAddress === 'localhost' || 
    ipAddress.startsWith('192.168.') || 
    ipAddress.startsWith('10.') || 
    ipAddress.startsWith('172.') ||
    ipAddress === '::1'
  )) {
    return 'Localhost';
  }
  
  // If we have both city and country
  if (city && country) {
    return `${city}, ${country}`;
  }
  
  // If we have only city
  if (city) {
    return city;
  }
  
  // If we have only country
  if (country) {
    return country;
  }
  
  // If we have IP but no location data
  if (ipAddress) {
    return 'Unknown Location';
  }
  
  return 'N/A';
}

// Format IP address display
export function formatIpAddress(ipAddress?: string | null): string {
  if (!ipAddress) return 'N/A';
  
  // Handle localhost cases
  if (ipAddress === '127.0.0.1' || ipAddress === 'localhost' || ipAddress === '::1') {
    return '127.0.0.1 (Localhost)';
  }
  
  // Handle local network IPs
  if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
    return `${ipAddress} (Local Network)`;
  }
  
  return ipAddress;
}

// Get browser and OS information from user agent
export function getBrowserInfo(userAgent: string): string {
  if (!userAgent) return 'N/A';
  
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  
  let browserName = 'Unknown';
  let osName = 'Unknown';
  
  if (browser.name) {
    browserName = browser.name;
    if (browser.version) {
      browserName += ` ${browser.version}`;
    }
  }
  
  if (os.name) {
    osName = os.name;
    if (os.version) {
      osName += ` ${os.version}`;
    }
  }
  
  return `${browserName} on ${osName}`;
}

// Check if a session is the current session
export function isCurrentSession(sessionToken: string): boolean {
  const currentToken = getCurrentSessionTokenFromBrowser();
  return sessionToken === currentToken;
} 