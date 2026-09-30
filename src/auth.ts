import NextAuth from 'next-auth'
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'

const providers: NonNullable<NextAuthConfig['providers']> = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID ?? process.env.AUTH_GOOGLE_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? process.env.AUTH_GOOGLE_SECRET ?? '',
  }),
]

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // trustHost is required outside Vercel (localhost, Supabase, custom hosts);
  // without it the OAuth callback throws UntrustedHost -> 500 on sign-in.
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // Every record is keyed by email, so an email Google has not verified must
    // not be allowed to claim one.
    signIn({ account, profile }) {
      if (account?.provider === 'google') return profile?.email_verified === true
      return true
    },
  },
})
