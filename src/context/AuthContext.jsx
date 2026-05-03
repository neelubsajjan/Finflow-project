import { createContext, useContext, useState } from 'react'
import { db } from '../utils/db'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => db.getSession())

  const register = (name, email, password) => {
    const u = db.register(name, email, password)  // throws on validation error
    setUser(u)
    return u
  }

  const login = (email, password) => {
    const u = db.login(email, password)           // throws on invalid credentials
    setUser(u)
    return u
  }

  const logout = () => {
    db.logout()
    setUser(null)
  }

  const updateUser = updated => {
    setUser(updated)
    db.setSession(updated)
  }

  return <Ctx.Provider value={{ user, register, login, logout, updateUser }}>{children}</Ctx.Provider>
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
