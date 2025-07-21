// Validate required environment variables
export function validateEnvironmentVariables() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is required');
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET is required');
  }
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is required');
  }
  if (!process.env.NEXTAUTH_URL) {
    // console.warn('NEXTAUTH_URL is not set. This may cause issues in production.');
  }
}

// Cookie configuration
export const cookieConfig = {
  sessionToken: {
    name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    }
  },
  callbackUrl: {
    name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  },
  csrfToken: {
    name: process.env.NODE_ENV === 'production' ? '__Host-next-auth.csrf-token' : 'next-auth.csrf-token',
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  },
  pkceCodeVerifier: {
    name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.pkce.code_verifier' : 'next-auth.pkce.code_verifier',
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 15 // 15 minutes
    }
  },
  state: {
    name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.state' : 'next-auth.state',
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 15 // 15 minutes
    }
  },
  nonce: {
    name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.nonce' : 'next-auth.nonce',
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  }
};

// Session configuration
export const sessionConfig = {
  strategy: "database" as const,
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

// Pages configuration
export const pagesConfig = {
  signIn: '/login',
  error: '/login/error',
}; 