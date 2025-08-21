import { Empresa } from '../seguridad/Empresa';

export interface Rol {
  id: number;            // backend usa "id"
  nombre: string;
  descripcion: string;
  empresaId: number;
  rolempresaFk?: Empresa | null; // opcional, puede venir en el GET
}