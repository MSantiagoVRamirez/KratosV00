import { Rol } from '../seguridad/Rol';
import { Modulo } from '../Configuracion/Modulo';

export interface Permiso {
  id: number;

  rolesId: number;
  permisosrolesId?: Rol | null;

  modulosId: number;
  permisosmodulosId?: Modulo | null;

  nombre: string;
  descripcion: string;
  codigo: string;

  consultar: boolean;
  leer: boolean;
  insertar: boolean;
  editar: boolean;
  eliminar: boolean;
  importar: boolean;
  exportar: boolean;
}