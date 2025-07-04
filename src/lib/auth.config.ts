import type { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { getServerSession as getServerSessionHelper } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authConfig: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/login',
    error: '/auth/error', // Custom error page
  },
  events: {
    // Standard NextAuth events
    async signIn(message) {
      console.log('Sign in successful', { user: message.user?.email });
    },
    async signOut(message) {
      console.log('User signed out', { session: message.session });
    },
    async createUser(message) {
      console.log('User created', { user: message.user });
    },
    async updateUser(message) {
      console.log('User updated', { user: message.user });
    },
    async linkAccount(message) {
      console.log('Account linked', { user: message.user, account: message.account });
    }
    // Note: 'session' is not an event, it's a callback - moved to callbacks section
  },
  
  // Session configuration
  session: {
    strategy: 'jwt',
    // Default session expiration (30 days when remember me is checked, otherwise browser session)
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Use session cookies for better security
    updateAge: 24 * 60 * 60, // 24 hours - how often to update the session
  },
  // Enable JWT sessions
  jwt: {
    // You can add custom JWT encryption here if needed
  },
  
  // Callbacks for JWT and session handling
  callbacks: {
    async jwt({ token, user, trigger, session: sessionTrigger }) {
      // Handle user data
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.sub = user.id;
      }

      // Handle remember me
      if (trigger === 'signIn' || trigger === 'signUp') {
        const rememberMe = token.rememberMe as boolean | undefined;
        if (rememberMe === true) {
          // 30 days expiration for "Remember Me"
          token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
        } else {
          // Browser session (expires when browser is closed)
          token.exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
        }
      }

      // Update session if triggered
      if (trigger === 'update' && sessionTrigger?.expires) {
        token.exp = sessionTrigger.expires;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = (token.role as 'user' | 'partner' | 'admin') || 'user';
        session.expires = token.expires as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      
      // Default redirect based on user role
      const role = url.includes('admin') ? 'admin' : 
                  url.includes('partner') ? 'partner' : 'user';
      
      switch (role) {
        case 'admin':
          return `${baseUrl}/admin/dashboard`;
        case 'partner':
          return `${baseUrl}/partner/dashboard`;
        default:
          return `${baseUrl}/dashboard`;
      }
    },
  },
  
  // Global error handler
  logger: {
    error(code, metadata) {
      console.error('Auth error:', { code, metadata });
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember me', type: 'checkbox' }
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials) return null;
        
        const { email, rememberMe } = credentials;
        
        try {
          // Add your user lookup and password verification logic here
          // Example:
          // const user = await findUserByEmail(email);
          // if (!user || !await verifyPassword(password, user.password)) {
          //   throw new Error('Invalid credentials');
          // }
          // return { id: user.id, email: user.email, role: user.role };
          
          // For now, return a dummy user (remove this in production)
          return { 
            id: '1', 
            email: email, 
            role: 'user',
            rememberMe: rememberMe === 'true'
          };
          
        } catch (error) {
          console.error('Authorization error:', error);
          throw new Error('Failed to authenticate user');
        }
      },
    })
  ],
};

export const auth = (): Promise<Session | null> => getServerSession();

export async function getServerSession(): Promise<Session | null> {
  return await getServerSessionHelper(authConfig);
}

export default auth;