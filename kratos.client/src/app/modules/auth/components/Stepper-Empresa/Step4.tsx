import { FC } from 'react'
import { EmpresaDataForm } from '../../../../interfaces/Configuracion/EmpresaDataForm';
import {ActividadEconomica } from '../../../../interfaces/Configuracion/ActividadEconomica';
import { RegimenTributario } from '../../../../interfaces/Configuracion/RegimenTributario';
import { TipoSociedad} from '../../../../interfaces/Configuracion/TipoSociedad';

type Props = {
  data: EmpresaDataForm
  actividadEconimica: ActividadEconomica[]
  regimenTributario: RegimenTributario[]
  tipoSociedad: TipoSociedad[]
}

const Step4: FC<Props> = ({ 
  data, 
  actividadEconimica,
  regimenTributario,
  tipoSociedad
}) => {

  // Formatear el número a moneda
  const formatCurrency = (number: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(number)
  }

  const actividadEconomicaSeleccionada = actividadEconimica.find(a => a.id === data.step3.actividadId); 
  const regimenTributarioSeleccionado = regimenTributario.find(r => r.id === data.step3.regimenId);
  const tipoSociedadSeleccionada = tipoSociedad.find(t => t.id === data.step3.tiposociedadId);
  
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO')
  }
  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div className='w-100 overflow-auto' style={{ maxHeight: '400px' }}>

        {/* creddenciales de la empresa */}
        <div style={{backgroundColor: 'rgba(17, 48, 184, 0.5)'}} className='card card-flush mb-6'>
          <div  className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-info-circle me-2'></i>
              Credenciales de la Empresa
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Email:</label>
                <div className='fw-bold fs-6'>{data.step1.email}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Contraseña:</label>
                <div className='fw-bold fs-6'>{data.step1.contraseña}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Confirmar Contraseña:</label>
                <div className='fw-bold fs-6'>{data.step1.confirmarContraseña}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Token:</label>
                <div className='fw-bold fs-6'>{data.step1.token}</div>
              </div>
            </div>
          </div>
        </div>

        {/* datos de  contacto */}
        <div style={{backgroundColor: 'rgba(17, 48, 184, 0.5)'}} className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-users me-2'></i>
              Datos de Contacto
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Telefono:</label>
                <div className='fw-bold fs-6'>
                  {data.step2.telefono ? data.step2.telefono : 'No asignado'}
                </div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Representante Legal:</label>
                <div className='fw-bold fs-6'>
                  {data.step2.representanteLegal ? data.step2.representanteLegal : 'No asignado'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fechas y Ubicación */}
        <div style={{backgroundColor: 'rgba(17, 48, 184, 0.5)'}} className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-calendar me-2'></i>
                Datos de la Empresa
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-12 mb-5'>
                <label className='form-label fs-12 fw-semibold text-gray-600'>Actividad Economica:</label>
                <div className='fw-bold fs-12'>
                  {actividadEconomicaSeleccionada ? `${actividadEconomicaSeleccionada.nombre}` : 'No asignada'}
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Tipo de Sociedad:</label>
                <div className='fw-bold fs-6 '>{tipoSociedadSeleccionada ? `${tipoSociedadSeleccionada.nombre}`: 'No asignado' }</div>
              </div>
              
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Regimen Tributario:</label>
                <div className='fw-bold fs-6'>
                  {regimenTributarioSeleccionado ? `${regimenTributarioSeleccionado.nombre}` : 'No asignado'}
                </div>
              </div>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Razon Social:</label>
                <div className='fw-bold fs-6'>{data.step3.razonSocial}</div>
              </div>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Nombre Comercial:</label>
                <div className='fw-bold fs-6'>{data.step3.nombreComercial}</div>
              </div>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>NIT:</label>
                <div className='fw-bold fs-6'>{data.step3.nit}</div>
              </div>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>DV:</label>
                <div className='fw-bold fs-6'>{data.step3.dv}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div style={{backgroundColor: 'rgba(17, 48, 184, 0.5)'}} className='card card-flush mb-6'>
        <div  className='notice d-flex bg-light-success rounded border-success border border-dashed p-6'>
          <div className='d-flex flex-stack flex-grow-1'>
            <div className='fw-semibold'>
              <div className='fs-6 text-gray-700'>
                <i className='fas fa-check-circle text-success me-2'></i>
                Todos los datos están completos y listos para guardar la Orden de Servicio.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}


export { Step4 } 