import { FC } from 'react'
import { ITallerFormData } from '../../../interfaces/talleres-hallazgos/TallerFormData'

type Props = {
  data: ITallerFormData
  updateData: (fieldsToUpdate: Partial<ITallerFormData>) => void
  hasError: boolean
}

const Step3: FC<Props> = ({ 
  data, 
  updateData
}) => {
  const updateStep3 = (field: keyof ITallerFormData['step3'], value: string | null) => {
    updateData({
      step3: {
        ...data.step3,
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
              <label className='form-label fs-6 fw-semibold'>Ejercicios Previos</label>
              <textarea
                className='form-control form-control-solid'
                placeholder="Información sobre ejercicios previos (opcional)"
                value={data.step3.ejerciciosPrevios || ''}
                onChange={(e) => updateStep3('ejerciciosPrevios', e.target.value || null)}
                rows={4}
              />
              <div className='form-text'>Ingrese información sobre ejercicios o talleres previos relacionados</div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <div className='fv-row mb-7'>
              <label className='form-label fs-6 fw-semibold'>Comentarios</label>
              <textarea
                className='form-control form-control-solid'
                placeholder="Comentarios adicionales (opcional)"
                value={data.step3.comentarios || ''}
                onChange={(e) => updateStep3('comentarios', e.target.value || null)}
                rows={4}
              />
              <div className='form-text'>Agregue cualquier comentario o observación adicional</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step3 } 