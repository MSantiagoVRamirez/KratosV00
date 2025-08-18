import { Rol } from './Rol'
import { Empresa } from './Empresa'

export interface Usuario {
  id: number
  usuario: string
  password: string
  confirmPassword: string
  nombres: string
  apellidos: string
  correo: string
  telefono: string
  fechaCreacion: string | null
  fechaExpiracion: string | null
  empresaId: number
  empresaUsuarioFk?: Empresa
  rolId: number
  rolUsuarioFk?: Rol
}
