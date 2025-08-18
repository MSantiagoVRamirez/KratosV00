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
  
  const contrato = contratos.find(c => c.id === data.step1.contratoId)
  const empresa = empresas.find(e => e.id === contrato?.empresaId)
  const coordinador = usuarios.find(u => u.id === data.step2.coordinadorODSId)
  const supervisorTecnico = usuarios.find(u => u.id === data.step2.supervisorTecnicoId)
  const liderServicio = usuarios.find(u => u.id === data.step2.liderServicioId)
  const SyCcontratista = usuarios.find(u => u.id === data.step2.SyCcontratistaId)

  const getComplejidadText = (complejidad: number | null) => {
    switch (complejidad) {
      case 0: return 'Baja'
      case 1: return 'Media'
      case 2: return 'Alta'
      default: return 'No especificada'
    }
  }

  const getAreaSupervisionText = (area: number | null) => {
    switch (area) {
      case 0: return 'Jefatura Ingeniería'
      case 1: return 'Jefatura Planeación de Proyectos'
      default: return 'No especificada'
    }
  }

  const getPaqueteModularText = (paquete: number | null) => {
    switch (paquete) {
      case 0: return 'A'
      case 1: return 'B'
      case 2: return 'C'
      default: return 'No especificado'
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO')
  }

  const getTipoODSTexto = (tipo: number) => {
    return tipo === 0 ? 'Dedicada' : 'De Agregación de Demanda'
  }

  return (
    <div className='w-100' data-kt-stepper-element='content'>
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
                <label className='form-label fs-6 fw-semibold text-gray-600'>Número Seguimiento Cenit:</label>
                <div className='fw-bold fs-6'>{data.step1.numeroSeguimientoCenit}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Número Seguimiento Contratista:</label>
                <div className='fw-bold fs-6'>{data.step1.numeroSeguimientoContratista}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Tipo:</label>
                <div className='fw-bold fs-6'>{getTipoODSTexto(data.step1.tipoODS)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Complejidad:</label>
                <div className='fw-bold fs-6'>{getComplejidadText(data.step1.complejidad)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Contrato:</label>
                <div className='fw-bold fs-6'>{contrato?.numero || 'No especificado'}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Contratista:</label>
                <div className='fw-bold fs-6'>{empresa?.nombre || 'No especificado'}</div>
              </div>
              <div className='col-12 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Descripción:</label>
                <div className='fw-bold fs-6'>{data.step1.descripcion}</div>
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
                <label className='form-label fs-6 fw-semibold text-gray-600'>Coordinador ODS:</label>
                <div className='fw-bold fs-6'>
                  {coordinador ? `${coordinador.nombres} ${coordinador.apellidos}` : 'No asignado'}
                </div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Supervisor Técnico:</label>
                <div className='fw-bold fs-6'>
                  {supervisorTecnico ? `${supervisorTecnico.nombres} ${supervisorTecnico.apellidos}` : 'No asignado'}
                </div>
              </div>

              {data.step1.tipoODS === 1 && (
                <>
                  <div className='col-md-6 mb-5'>
                    <label className='form-label fs-6 fw-semibold text-gray-600'>S&C Contratista:</label>
                    <div className='fw-bold fs-6'>
                      {SyCcontratista ? `${SyCcontratista.nombres} ${SyCcontratista.apellidos}` : 'No asignado'}
                    </div>
                  </div>
                  <div className='col-md-6 mb-5'>
                    <label className='form-label fs-6 fw-semibold text-gray-600'>Líder de Servicio:</label>
                    <div className='fw-bold fs-6'>
                      {liderServicio ? `${liderServicio.nombres} ${liderServicio.apellidos}` : 'No asignado'}
                    </div>
                  </div>
                </>
              )}

              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Área Supervisión Técnica:</label>
                <div className='fw-bold fs-6'>{getAreaSupervisionText(data.step2.areaSupervisionTecnica)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Paquete Modular:</label>
                <div className='fw-bold fs-6'>{getPaqueteModularText(data.step2.paqueteModular)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fechas y Ubicación */}
        <div className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-calendar me-2'></i>
              Fechas y Ubicación
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Plazo:</label>
                <div className='fw-bold fs-6 text-primary'>{data.step3.plazoEnDias} días calendario</div>
              </div>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Fecha de Inicio:</label>
                <div className='fw-bold fs-6'>
                  {data.step3.fechaInicio ? formatFecha(data.step3.fechaInicio) : 'No especificada'}
                </div>
              </div>
              <div className='col-md-4 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Fecha de Fin:</label>
                <div className='fw-bold fs-6'>
                  {data.step3.fechaFin ? formatFecha(data.step3.fechaFin) : 'No especificada'}
                </div>
              </div>

              {data.step1.tipoODS === 0 && (
                <>
                  <div className='col-md-12 mb-5'>
                    <label className='form-label fs-6 fw-semibold text-gray-600'>Conexo a Obra:</label>
                    <div className='fw-bold fs-6'>{data.step3.conexoObra ? 'Sí' : 'No'}</div>
                  </div>

                  {(data.step3.listaPlanta || data.step3.listaSistema) && (
                    <>
                      {data.step3.listaPlanta && (
                        <div className='col-md-6 mb-5'>
                          <label className='form-label fs-6 fw-semibold text-gray-600'>Estaciones:</label>
                          <div className='fw-bold fs-6'>{data.step3.listaPlanta}</div>
                        </div>
                      )}
                      {data.step3.listaSistema && (
                        <div className='col-md-6 mb-5'>
                          <label className='form-label fs-6 fw-semibold text-gray-600'>Sistemas:</label>
                          <div className='fw-bold fs-6'>{data.step3.listaSistema}</div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
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
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Valor HH:</label>
                <div className='fw-bold fs-6'>{formatCurrency(data.step4.valorHH)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Valor Viajes:</label>
                <div className='fw-bold fs-6'>{formatCurrency(data.step4.valorViaje)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Valor Estudios:</label>
                <div className='fw-bold fs-6'>{formatCurrency(data.step4.valorEstudio)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Valor Gasto Reembolsable:</label>
                <div className='fw-bold fs-6'>{formatCurrency(data.step4.valorGastoReembolsable)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Suma Global Fija:</label>
                <div className='fw-bold fs-6 text-primary'>{formatCurrency(data.step4.valorHH + data.step4.valorViaje + data.step4.valorEstudio)}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Valor Total ODS:</label>
                <div className='fw-bold fs-3 text-success'>{formatCurrency(data.step4.valorHH + data.step4.valorViaje + data.step4.valorEstudio + data.step4.valorGastoReembolsable)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className='notice d-flex bg-light-success rounded border-success border border-dashed p-6'>
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
  )
}

export { Step5 } 