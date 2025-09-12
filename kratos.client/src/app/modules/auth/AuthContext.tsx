import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react'

export type AuthSessionData = {
  isAuth?: boolean
  user?: string | null
  role?: string | null
  tipoLogin?: 'empresa' | 'usuario' | null
  id?: number | null
  empresaId?: number | null
  empresaNombre?: string | null
  roleId?: number | null
  avatarUrl?: string | null
}

type AuthContextValue = {
  isAuth: boolean
  user: string | null
  role: string | null
  tipoLogin: 'empresa' | 'usuario' | null
  id: number | null
  empresaId: number | null
  empresaNombre: string | null
  roleId: number | null
  avatarUrl: string | null
  hydrated: boolean
  invertAuth: () => void
  saveUser: (user: string) => void
  saveRole: (role: string) => void
  setSession: (data: AuthSessionData) => void
  clearSession: () => void
}

const STORAGE_KEY = 'authSession'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [isAuth, setIsAuth] = useState(false)
  const [user, setUser] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [tipoLogin, setTipoLogin] = useState<'empresa' | 'usuario' | null>(null)
  const [id, setId] = useState<number | null>(null)
  const [empresaId, setEmpresaId] = useState<number | null>(null)
  const [empresaNombre, setEmpresaNombre] = useState<string | null>(null)
  const [roleId, setRoleId] = useState<number | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState<boolean>(false)

  const invertAuth = () => setIsAuth((prev) => !prev)
  const saveUser = (u: string) => setUser(u)
  const saveRole = (r: string) => setRole(r)

  const setSession = (data: AuthSessionData) => {
    if (typeof data.isAuth === 'boolean') setIsAuth(data.isAuth)
    if (data.user !== undefined) setUser(data.user ?? null)
    if (data.role !== undefined) setRole(data.role ?? null)
    if (data.tipoLogin !== undefined) setTipoLogin(data.tipoLogin ?? null)
    if (data.id !== undefined) setId(data.id ?? null)
    if (data.empresaId !== undefined) setEmpresaId(data.empresaId ?? null)
    if (data.empresaNombre !== undefined) setEmpresaNombre(data.empresaNombre ?? null)
    if (data.roleId !== undefined) setRoleId(data.roleId ?? null)
    if (data.avatarUrl !== undefined) setAvatarUrl(data.avatarUrl ?? null)

    try {
      const prevRaw = localStorage.getItem(STORAGE_KEY)
      const prev: AuthSessionData = prevRaw ? JSON.parse(prevRaw) : {}
      const next: AuthSessionData = {...prev, ...data}
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  const clearSession = () => {
    setIsAuth(false)
    setUser(null)
    setRole(null)
    setTipoLogin(null)
    setId(null)
    setEmpresaId(null)
    setEmpresaNombre(null)
    setRoleId(null)
    setAvatarUrl(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw) as AuthSessionData
        if (typeof s.isAuth === 'boolean') setIsAuth(s.isAuth)
        if (s.user !== undefined) setUser(s.user ?? null)
        if (s.role !== undefined) setRole(s.role ?? null)
        if (s.tipoLogin !== undefined) setTipoLogin(s.tipoLogin ?? null)
        if (s.id !== undefined) setId(s.id ?? null)
        if (s.empresaId !== undefined) setEmpresaId(s.empresaId ?? null)
        if (s.empresaNombre !== undefined) setEmpresaNombre(s.empresaNombre ?? null)
        if (s.roleId !== undefined) setRoleId(s.roleId ?? null)
        if (s.avatarUrl !== undefined) setAvatarUrl(s.avatarUrl ?? null)
      }
    } catch {}
    setHydrated(true)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        user,
        role,
        tipoLogin,
        id,
        empresaId,
        empresaNombre,
        roleId,
        avatarUrl,
        hydrated,
        invertAuth,
        saveUser,
        saveRole,
        setSession,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de un AuthProvider')
  return ctx
}

