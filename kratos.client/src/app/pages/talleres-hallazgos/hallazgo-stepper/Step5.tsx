import { FC } from 'react'
import { IHallazgoFormData } from '../../../interfaces/talleres-hallazgos/HallazgoFormData'
import { Taller } from '../../../interfaces/talleres-hallazgos/Taller'
import { Disciplina } from '../../../interfaces/talleres-hallazgos/Disciplina'
import { Usuario } from '../../../interfaces/seguridad/Usuario'

type Props = {
  data: IHallazgoFormData
  talleres: Taller[]
  disciplinas: Disciplina[]
  usuarios: Usuario[]
  isEditMode: boolean
}

const Step5: FC<Props> = ({ 
  data,
  talleres,
  disciplinas,
  usuarios,
  isEditMode
}) => {

  const selectedTaller = talleres.find(t => t.id === data.step1.tallerId)
  const selectedDisciplina = disciplinas.find(d => d.id === data.step1.disciplinaId)
  const responsableAccion = usuarios.find(u => u.id === data.step2.responsableAccionId)
  const originadorBrechas = usuarios.find(u => u.id === data.step2.originadorBrechasId)

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO')
  }

  const getTipoCategoriaTexto = (tipo: number) => {
    switch (tipo) {
      case 0: return 'Tipo 1'
      case 1: return 'Tipo 2'
      case 2: return 'Tipo 3'
      default: return 'No especificado'
    }
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
                <label className='form-label fs-6 fw-semibold text-gray-600'>Taller:</label>
                <div className='fw-bold fs-6'>{selectedTaller?.nombre || 'No especificado'}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Disciplina:</label>
                <div className='fw-bold fs-6'>{selectedDisciplina?.nombre || 'No especificada'}</div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Tipo de Categoría:</label>
                <div className='fw-bold fs-6'>{getTipoCategoriaTexto(data.step1.tipoCategoria ?? 0)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsables */}
        <div className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-users me-2'></i>
              Responsables
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Responsable de Acción:</label>
                <div className='fw-bold fs-6'>
                  {responsableAccion ? `${responsableAccion.nombres} ${responsableAccion.apellidos}` : 'No asignado'}
                </div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Originador de Brechas:</label>
                <div className='fw-bold fs-6'>
                  {originadorBrechas ? `${originadorBrechas.nombres} ${originadorBrechas.apellidos}` : 'No asignado'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fechas y Documentos */}
        <div className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-calendar me-2'></i>
              Fechas y Documentos
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Fecha de Cierre Planeada:</label>
                <div className='fw-bold fs-6 text-danger'>
                  {data.step3.fechaCierrePlaneada ? formatFecha(data.step3.fechaCierrePlaneada) : 'No especificada'}
                </div>
              </div>
              <div className='col-md-6 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Fecha de Cierre Real:</label>
                <div className='fw-bold fs-6'>
                  {data.step3.fechaCierreReal ? formatFecha(data.step3.fechaCierreReal) : 'Sin fecha'}
                </div>
              </div>
              {data.step3.documento && (
                <div className='col-md-12 mb-5'>
                  <label className='form-label fs-6 fw-semibold text-gray-600'>Documento:</label>
                  <div className='fw-bold fs-6'>{data.step3.documento}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Descripción y Comentarios */}
        <div className='card card-flush mb-6'>
          <div className='card-header'>
            <div className='card-title fw-bold text-primary'>
              <i className='fas fa-file-alt me-2'></i>
              Descripción y Comentarios
            </div>
          </div>
          <div className='card-body pt-0'>
            <div className='row'>
              <div className='col-12 mb-5'>
                <label className='form-label fs-6 fw-semibold text-gray-600'>Recomendación:</label>
                <div className='fw-bold fs-6'>{data.step4.recomendacion || 'No especificada'}</div>
              </div>
              {isEditMode && data.step4.descripcionAccionCierre && (
                <div className='col-12 mb-5'>
                  <label className='form-label fs-6 fw-semibold text-gray-600'>Descripción Acción de Cierre:</label>
                  <div className='fw-bold fs-6'>{data.step4.descripcionAccionCierre}</div>
                </div>
              )}
              {isEditMode && data.step4.ultimoComentarioVerificacionCierre && (
                <div className='col-12 mb-5'>
                  <label className='form-label fs-6 fw-semibold text-gray-600'>Último Comentario Verificación:</label>
                  <div className='fw-bold fs-6'>{data.step4.ultimoComentarioVerificacionCierre}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='notice d-flex bg-light-success rounded border-success border border-dashed p-6'>
          <div className='d-flex flex-stack flex-grow-1'>
            <div className='fw-semibold'>
              <div className='fs-6 text-gray-700'>
                <i className='fas fa-check-circle text-success me-2'></i>
                Todos los datos están completos y listos para guardar el hallazgo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step5 } 