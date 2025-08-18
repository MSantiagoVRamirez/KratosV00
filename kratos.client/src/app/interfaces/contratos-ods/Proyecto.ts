import { Usuario } from '../seguridad/Usuario'

export interface Proyecto {
  id: number
  nombre: string
  liderId: number
  liderProyectoFk?: Usuario
  descripcion: string
}
