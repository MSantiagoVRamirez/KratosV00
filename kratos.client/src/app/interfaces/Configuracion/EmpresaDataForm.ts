export interface EmpresaDataForm {
    step1: {
        email: string
        contraseña: string
        confirmarContraseña: string 
        token: string
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
}
export const defaultDataEmpresa : EmpresaDataForm = {
    step1: {
        email: '',
        contraseña: '',
        confirmarContraseña: '',
        token: ''
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
} 