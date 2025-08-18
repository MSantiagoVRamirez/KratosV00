import { FC } from 'react'
import { ITallerFormData } from '../../../interfaces/talleres-hallazgos/TallerFormData'
import { ODS } from '../../../interfaces/contratos-ods/ODS'
import { TipoTaller } from '../../../interfaces/talleres-hallazgos/TipoTaller'
import { Empresa } from '../../../interfaces/seguridad/Empresa'
import { HitoPago } from '../../../interfaces/contratos-ods/HitoPago'

type Props = {
  data: ITallerFormData
  ordenesServicio: ODS[]
  tiposTaller: TipoTaller[]
  empresas: Empresa[]
  hitosDePago: HitoPago[]
}

const Step4: FC<Props> = ({ 
  data,
  ordenesServicio,
  tiposTaller,
  empresas,
  hitosDePago
}) => {

  const selectedODS = ordenesServicio.find(ods => ods.id === data.step1.odsId)
  const selectedTipo = tiposTaller.find(tipo => tipo.id === data.step1.tipoId)
  const selectedHito = hitosDePago.find(hito => hito.id === data.step2.hitoPagoId)
  const contratista = selectedODS?.contratista || ''
  const selectedEmpresa = empresas.find(empresa => empresa.nombre === contratista)

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO')
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
                <label className='form-label fs-6 fw-semibold text-gray-600'>Fecha:</label>
                <div className='fw-bold fs-6'>{data.step1.fecha ? formatFecha(data.step1.fecha) : 'No especificada'}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Tipo de Taller:</label>
                <div className='fw-bold fs-6'>{selectedTipo?.nombre || 'No especificado'}</div>
              </div>
              <div className='col-12 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>ODS:</label>
                <div className='fw-bold fs-6'>{selectedODS?.nombre || 'No especificada'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Asignaciones */}
        <div className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-users me-2'></i>
              Asignaciones y Proyecto
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Consultor:</label>
                <div className='fw-bold fs-6'>{selectedEmpresa?.nombre || 'No asignado'}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Hito de Pago:</label>
                <div className='fw-bold fs-6'>{selectedHito?.numero || 'No especificado'}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Proyecto/Iniciativa:</label>
                <div className='fw-bold fs-6'>{data.step2.proyecto || 'No especificado'}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Líder de Proyecto:</label>
                <div className='fw-bold fs-6'>{data.step2.liderProyecto || 'No especificado'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        {(data.step3.ejerciciosPrevios || data.step3.comentarios) && (
          <div className='card card-flush mb-6'>
            <div className='card-header'>
              <div className='card-title fw-bold text-primary'>
                <i className='fas fa-file-alt me-2'></i>
                Información Adicional
              </div>
            </div>
            <div className='card-body pt-0'>
              <div className='row'>
                {data.step3.ejerciciosPrevios && (
                  <div className='col-12 mb-5'>
                    <label className='form-label fs-6 fw-semibold text-gray-600'>Ejercicios Previos:</label>
                    <div className='fw-bold fs-6'>{data.step3.ejerciciosPrevios}</div>
                  </div>
                )}
                {data.step3.comentarios && (
                  <div className='col-12 mb-5'>
                    <label className='form-label fs-6 fw-semibold text-gray-600'>Comentarios:</label>
                    <div className='fw-bold fs-6'>{data.step3.comentarios}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className='notice d-flex bg-light-success rounded border-success border border-dashed p-6'>
          <div className='d-flex flex-stack flex-grow-1'>
            <div className='fw-semibold'>
              <div className='fs-6 text-gray-700'>
                <i className='fas fa-check-circle text-success me-2'></i>
                Todos los datos están completos y listos para guardar el taller.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step4 } 