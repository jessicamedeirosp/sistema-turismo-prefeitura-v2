import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      first_login: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    first_login: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    first_login: boolean
  }
}
