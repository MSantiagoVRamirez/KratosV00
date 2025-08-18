import { FC } from 'react'
import { IContratoFormData } from '../../../interfaces/contratos-ods/ContratoFormData'
import { Empresa } from '../../../interfaces/seguridad/Empresa'
import { Usuario } from '../../../interfaces/seguridad/Usuario'

type Props = {
  data: IContratoFormData
  empresas: Empresa[]
  usuarios: Usuario[]
}

const Step5: FC<Props> = ({ data, empresas, usuarios }) => {
  // Formatear el número a moneda
  const formatCurrency = (number: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Obtener nombre de empresa
  const getNombreEmpresa = (id: number) => {
    const empresa = empresas.find(e => e.id === id);
    return empresa?.nombre || 'No asignado';
  };

  // Obtener nombre de usuario
  const getNombreUsuario = (id: number) => {
    const usuario = usuarios.find(u => u.id === id);
    return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'No asignado';
  };

  // Obtener texto del portafolio
  const getPortafolioTexto = (portafolio: number) => {
    switch (portafolio) {
      case 1: return 'Baja complejidad';
      case 2: return 'Media complejidad';
      case 3: return 'Alta complejidad';
      default: return 'No definido';
    }
  };

  // Calcular duración en días
  const calcularDuracion = () => {
    if (data.step3.fechaInicio && data.step3.fechaFin) {
      const inicio = new Date(data.step3.fechaInicio);
      const fin = new Date(data.step3.fechaFin);
      const differenceInTime = fin.getTime() - inicio.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
      return differenceInDays > 0 ? differenceInDays : 0;
    }
    return 0;
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      {/* <div className='text-center mb-10'>
        <h2 className='text-dark mb-3'>Revisión Final</h2>
        <div className='text-gray-400 fw-semibold fs-5'>
          Revise toda la información antes de guardar el contrato
        </div>
      </div> */}
      
      <div className='w-100 overflow-auto' style={{ maxHeight: '400px' }}>

        {/* Información Básica */}
        <div className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-info-circle me-2'></i>
              Información Básica
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Número:</label>
                <div className='fw-bold fs-6'>{data.step1.numero || 'Se asigna automáticamente'}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Portafolio:</label>
                <div className='fw-bold fs-6'>{getPortafolioTexto(data.step1.portafolio)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Número Seguimiento Cenit:</label>
                <div className='fw-bold fs-6'>{data.step1.numeroSeguimientoCenit || 'No especificado'}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Número Seguimiento Contratista:</label>
                <div className='fw-bold fs-6'>{data.step1.numeroSeguimientoContratista || 'No especificado'}</div>
              </div>
              <div className='col-12 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Objeto:</label>
                <div className='fw-bold fs-6'>{data.step1.objeto}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Asignaciones */}
        <div className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-users me-2'></i>
              Asignaciones
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Consultor:</label>
                <div className='fw-bold fs-6'>{getNombreEmpresa(data.step2.empresaId)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Administrador de Contrato:</label>
                <div className='fw-bold fs-6'>{getNombreUsuario(data.step2.adminContratoId)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Jefe de Ingeniería:</label>
                <div className='fw-bold fs-6'>{getNombreUsuario(data.step2.jefeIngenieriaId)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fechas y Plazos */}
        <div className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-calendar me-2'></i>
              Fechas y Plazos
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Fecha de Inicio:</label>
                <div className='fw-bold fs-6'>{formatFecha(data.step3.fechaInicio)}</div>
              </div>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Fecha de Fin:</label>
                <div className='fw-bold fs-6'>{formatFecha(data.step3.fechaFin)}</div>
              </div>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Duración:</label>
                <div className='fw-bold fs-6 text-primary'>{calcularDuracion()} días calendario</div>
              </div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-dollar-sign me-2'></i>
              Valores Monetarios
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Costo Directo:</label>
                <div className='fw-bold fs-6'>{formatCurrency(data.step4.valorCostoDirecto)}</div>
              </div>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Gastos Reembolsables:</label>
                <div className='fw-bold fs-6'>{formatCurrency(data.step4.valorGastosReembolsables)}</div>
              </div>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Valor Costo Directo más Gastos Reembolsables:</label>
                <div className='fw-bold fs-3 text-success'>{formatCurrency(data.step4.valorCostoDirecto + data.step4.valorGastosReembolsables)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className='notice d-flex bg-light-success rounded border-success border border-dashed p-6'>
          <div className='d-flex flex-stack flex-grow-1'>
            <div className='fw-semibold'>
              <div className='fs-6 text-gray-700'>
                <i className='fas fa-check-circle text-success me-2'></i>
                Todos los datos están completos y listos para guardar el contrato.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step5 } 