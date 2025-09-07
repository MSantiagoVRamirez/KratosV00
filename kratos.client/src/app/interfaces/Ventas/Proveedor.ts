export interface Proveedor {
  id: number;
  empresaId: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string | null;
}

