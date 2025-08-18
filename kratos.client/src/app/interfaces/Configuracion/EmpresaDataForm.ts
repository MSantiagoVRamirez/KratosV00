export interface EmpresaDataForm {
    step1: {
        email: string
        contraseña: string
        confirmarContraseña: string 
        Token: string
    };
    step2: {
        telefono: string
        representanteLegal: string
    };
    step3: {
        tiposociedadId: number
        actividadId: number
        regimenId: number
        razonSocial: string
        nombreComercial: string
        nit: string
        dv: string
    };
    step4:{
        activo: boolean
        creadoEn: string
        actualizadoEn: string
    };
}
export const defaultDataEmpresa : EmpresaDataForm = {
    step1: {
        email: '',
        contraseña: '',
        confirmarContraseña: '',
        Token: ''
    },
    step2: {
        telefono: '',
        representanteLegal: ''
    },
    step3: {
        tiposociedadId: 0,
        actividadId: 0,
        regimenId: 0,
        razonSocial: '',
        nombreComercial: '',
        nit: '',
        dv: ''
    },
    step4:{
        activo: true,
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString()
    }
} 