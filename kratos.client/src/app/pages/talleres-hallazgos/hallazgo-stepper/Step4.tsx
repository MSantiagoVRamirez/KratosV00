import { FC } from 'react'
import { IHallazgoFormData } from '../../../interfaces/talleres-hallazgos/HallazgoFormData'

type Props = {
  data: IHallazgoFormData
  updateData: (fieldsToUpdate: Partial<IHallazgoFormData>) => void
  hasError: boolean
  isEditMode: boolean
}

const Step4: FC<Props> = ({ 
  data, 
  updateData, 
  hasError,
  isEditMode
}) => {
  const updateStep4 = (field: keyof IHallazgoFormData['step4'], value: string | null) => {
    updateData({
      step4: {
        ...data.step4,
        [field]: value
      }
    })
  }

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='row'>
          <div className='col-md-12'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Recomendación</label>
              <textarea
                className={`form-control form-control-solid ${hasError && !data.step4.recomendacion ? 'is-invalid' : ''}`}
                placeholder="Ingrese la recomendación para el hallazgo"
                value={data.step4.recomendacion}
                onChange={(e) => updateStep4('recomendacion', e.target.value)}
                rows={4}
              />
              {hasError && !data.step4.recomendacion && (
                <div className='invalid-feedback'>La recomendación es requerida</div>
              )}
              <div className='form-text'>Describa detalladamente la recomendación para resolver el hallazgo</div>
            </div>
          </div>
        </div>

        {isEditMode && (
          <>
            <div className='row'>
              <div className='col-md-12'>
                <div className='fv-row mb-7'>
                  <label className='form-label fs-6 fw-semibold'>Descripción Acción de Cierre</label>
                  <textarea
                    className='form-control form-control-solid'
                    placeholder="Descripción de la acción de cierre (opcional)"
                    value={data.step4.descripcionAccionCierre || ''}
                    onChange={(e) => updateStep4('descripcionAccionCierre', e.target.value || null)}
                    rows={3}
                  />
                  <div className='form-text'>Describa las acciones tomadas para cerrar el hallazgo</div>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='col-md-12'>
                <div className='fv-row mb-7'>
                  <label className='form-label fs-6 fw-semibold'>Último Comentario Verificación</label>
                  <textarea
                    className='form-control form-control-solid'
                    placeholder="Comentario de verificación (opcional)"
                    value={data.step4.ultimoComentarioVerificacionCierre || ''}
                    onChange={(e) => updateStep4('ultimoComentarioVerificacionCierre', e.target.value || null)}
                    rows={3}
                  />
                  <div className='form-text'>Comentarios sobre la verificación del cierre del hallazgo</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { Step4 } 