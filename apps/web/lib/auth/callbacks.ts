import { PrismaClient } from "@prisma/client";
import { updateSessionWithDeviceInfo } from '@/lib/auth/session-manager';
import { getLocationFromIP } from '@/lib/location-utils';

const prisma = new PrismaClient();

// Session callback
export async function sessionCallback({ session, token, user }: any) {
  // Add user info to the session
  if (user) {
    session.user.id = user.id;
    session.user.name = user.name || undefined;
    session.user.email = user.email || undefined;
    session.user.image = user.image || undefined;
    session.user.role = user.role;
  }
  
  return session;
}

// Sign in callback
export async function signInCallback(params: any) {
  const { user, account, profile } = params;
  
  try {
    if (account?.provider === 'google') {
      if (!user.email) {
        console.error('❌ No email found in user object from Google OAuth');
        
        return false; 
      }

      // Check if user exists with this email
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
        include: { accounts: true }
      });

      if (!existingUser) {
        // Create a new user with default values
        const newUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || user.email.split('@')[0], 
            image: user.image,
            role: 'USER',
            emailVerified: new Date(),

            isActive: true,
            password: null, // Since it's a Google sign-in
            resetToken: null,
            resetTokenExpiry: null,
            accounts: {
              create: {
                type: 'oauth',
                provider: 'google',
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token
              }
            }
          },
          include: { accounts: true }
        });
        
        user.id = newUser.id;
        user.role = newUser.role;
      } else {
        // Check if user has a Google account linked
        const hasGoogleAccount = existingUser.accounts.some(
          acc => acc.provider === 'google' && acc.providerAccountId === account.providerAccountId
        );

        if (!hasGoogleAccount) {
          // Link the Google account to the existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: 'oauth',
              provider: 'google',
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token
            }
          });
        }
        
        // Update the user object with existing user's data
        user.id = existingUser.id;
        user.role = existingUser.role;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error in signIn callback:', error);
    
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Full error stack:', error.stack);
    }
    
    // Return true to allow the sign-in to continue even if there's an error
    return true;
  }
}

// Events callbacks
export const eventsCallbacks = {
  async signIn(message: any) {

    
    try {
      // Update the most recent session with device info and location if available
      if (message.user?.id) {
        // Get the most recent session for this user
        const session = await prisma.session.findFirst({
          where: { 
            userId: message.user.id,
            expires: { gt: new Date() }
          },
          orderBy: { createdAt: 'desc' }
        });
        
        if (session) {
  
          
          // Parse user agent for device info
          const userAgent = session.userAgent || '';
          const deviceInfo = parseDeviceInfo(userAgent);
          
          // Get IP address from session
          const ipAddress = session.ipAddress;
          
          // Get location data if we have an IP address
          let locationData: { city?: string; country?: string; latitude?: number; longitude?: number } = {};
          if (ipAddress && ipAddress !== '127.0.0.1' && ipAddress !== 'localhost' && ipAddress !== '::1') {
            locationData = await getLocationFromIP(ipAddress);
          } else if (ipAddress) {
            locationData = {
              city: 'Localhost',
              country: 'Development',
              latitude: undefined,
              longitude: undefined
            }
          }

          // Update the session with device info and location
          await prisma.session.update({
            where: { id: session.id },
            data: {
              deviceType: capitalizeDeviceType(deviceInfo.deviceType),
              deviceModel: deviceInfo.deviceModel || '',
              city: locationData.city || null,
              country: locationData.country || null,
              latitude: locationData.latitude || null,
              longitude: locationData.longitude || null,
              updatedAt: new Date()
            }
          });
          

        } else {

        }
      }
    } catch (error) {
      // Error updating session in signIn event
    }
  },
  
  async signOut(message: any) {
    // Handle sign out events if needed
  }
};

// Helper functions (copied from session-manager.ts to avoid circular imports)
function parseDeviceInfo(userAgent: string) {
  if (!userAgent) {
    return { deviceType: 'Unknown', deviceModel: '' };
  }

  const ua = userAgent.toLowerCase();
  
  // Mobile detection
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
    if (ua.includes('iphone')) {
      return { deviceType: 'Mobile', deviceModel: 'iPhone' };
    } else if (ua.includes('ipad')) {
      return { deviceType: 'Tablet', deviceModel: 'iPad' };
    } else if (ua.includes('android')) {
      return { deviceType: 'Mobile', deviceModel: 'Android' };
    } else {
      return { deviceType: 'Mobile', deviceModel: 'Mobile Device' };
    }
  }
  
  // Desktop detection
  if (ua.includes('windows')) {
    return { deviceType: 'Desktop', deviceModel: 'Windows PC' };
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    return { deviceType: 'Desktop', deviceModel: 'Mac' };
  } else if (ua.includes('linux')) {
    return { deviceType: 'Desktop', deviceModel: 'Linux PC' };
  }
  
  return { deviceType: 'Desktop', deviceModel: 'Desktop' };
}

function capitalizeDeviceType(deviceType: string): string {
  if (!deviceType) return 'Unknown';
  return deviceType.charAt(0).toUpperCase() + deviceType.slice(1).toLowerCase();
} 