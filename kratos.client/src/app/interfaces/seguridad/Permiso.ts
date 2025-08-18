import { Rol } from './Rol'
import { Modulo } from './Modulo'

export interface Permiso {
  id: number
  rolId: number
  rolPermisoFk?: Rol
  moduloId: number
  moduloPermisoFk?: Modulo
  leer: boolean
  editar: boolean
  consultar: boolean
  insertar: boolean
  eliminar: boolean
  exportar: boolean
  importar: boolean
}
