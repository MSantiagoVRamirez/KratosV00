export interface Producto {
    id: number;

  codigo: string;
  nombre: string;
  descripcion: string;

  categoriaId: number;
  subCategoriaId: number;

  precio: number;   // decimal(18,2)
  costo: number;    // decimal(18,2)

  stockMinimo: number;

  // En tu modelo existen ambas:
  imagenUrl?: string | null;  // camelCase
  ImagenUrl?: string | null;  // PascalCase (por compatibilidad)

  activo: boolean;

  creadoEn?: string;      // ISO string
  actualizadoEn?: string; // ISO string

  // Para subir archivo (IFormFile en back):
  ImagenArchivo?: File | null;
    
}