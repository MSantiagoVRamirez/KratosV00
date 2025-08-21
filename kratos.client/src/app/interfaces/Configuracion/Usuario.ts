export interface Usuario {
  id: number;

  rolesId: number;
  usuariosrolesFk?: any | null; // opcional, si luego defines Rol puedes tiparlo

  contraseña: string;
  confirmarContraseña: string;

  token: string;
  email: string;

  nombres: string;
  apellidos: string;

  telefono: string;
  estado: boolean;

  creadoEn?: string;       // fechas como ISO strings
  actualizadoEn?: string;

  imagenUrl?: string | null;     // coincide con ImagenUrl del backend (case-insensitive en JSON)
  imagenArchivo?: File | null;   // IFormFile en backend
}