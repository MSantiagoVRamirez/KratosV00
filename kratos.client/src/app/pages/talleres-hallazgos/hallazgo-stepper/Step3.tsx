import { FC } from 'react'
import { IHallazgoFormData } from '../../../interfaces/talleres-hallazgos/HallazgoFormData'

type Props = {
  data: IHallazgoFormData
  updateData: (fieldsToUpdate: Partial<IHallazgoFormData>) => void
  hasError: boolean
  isEditMode: boolean
}

const Step3: FC<Props> = ({ 
  data, 
  updateData, 
  hasError,
  isEditMode
}) => {
  const updateStep3 = (field: keyof IHallazgoFormData['step3'], value: string | null) => {
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
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Fecha de Cierre Planeada</label>
              <input
                type="date"
                className={`form-control form-control-solid ${hasError && !data.step3.fechaCierrePlaneada ? 'is-invalid' : ''}`}
                value={data.step3.fechaCierrePlaneada ? data.step3.fechaCierrePlaneada.split('T')[0] : ''}
                onChange={(e) => updateStep3('fechaCierrePlaneada', e.target.value)}
              />
              {hasError && !data.step3.fechaCierrePlaneada && (
                <div className='invalid-feedback'>La fecha de cierre planeada es requerida</div>
              )}
            </div>
          </div>
          
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label fs-6 fw-semibold'>Fecha de Cierre Real</label>
              <input
                type="date"
                className='form-control form-control-solid'
                value={data.step3.fechaCierreReal ? data.step3.fechaCierreReal.split('T')[0] : ''}
                onChange={(e) => updateStep3('fechaCierreReal', e.target.value || null)}
              />
              <div className='form-text'>Solo si el hallazgo ya fue cerrado</div>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <div className='fv-row mb-7'>
              <label className='form-label fs-6 fw-semibold'>Documento</label>
              {isEditMode && data.step3.documento && (
                <div className="mb-2">
                  <span className="badge badge-light-info me-2">Actual:</span>
                  <span>{data.step3.documento}</span>
                </div>
              )}
              <input
                type="file"
                className='form-control form-control-solid'
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    updateStep3('documento', e.target.files[0].name);
                  }
                }}
              />
              <div className='form-text'>Seleccione un archivo PDF relacionado con el hallazgo (opcional)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step3 } 