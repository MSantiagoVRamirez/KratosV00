export interface UsuarioDataForm {
  tipoUsuario?: 'cliente' | 'empleado'
  step1: {
    email: string
    contraseña: string
    confirmarContraseña: string
    token: string
  }
  step2: {
    nombres: string
    apellidos: string
    telefono: string
    rolesId: number
  }
  step3: {
    // datos personales ahora estarán aquí visualmente, pero mantenemos por compatibilidad
    // el contenedor de imagen pasa a step4
  }
  step4: {
    imagenFile?: File | null
    imagenPreview?: string | null
  }
}

export const defaultDataUsuario: UsuarioDataForm = {
  tipoUsuario: undefined,
  step1: { email: '', contraseña: '', confirmarContraseña: '', token: '' },
  step2: { nombres: '', apellidos: '', telefono: '', rolesId: 1 },
  step3: {},
  step4: { imagenFile: null, imagenPreview: null },
}
