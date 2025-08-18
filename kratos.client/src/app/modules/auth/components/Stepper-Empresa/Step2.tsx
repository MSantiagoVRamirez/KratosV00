import { FC } from 'react'
import { EmpresaDataForm } from '../../../../interfaces/Configuracion/EmpresaDataForm';

type Props = {
  data: EmpresaDataForm
  updateData: (fieldsToUpdate: Partial<EmpresaDataForm>) => void
  hasError: boolean
  isEditMode: boolean
}
const Step2: FC<Props> = ({ 
  data, 
  updateData, 
  hasError, 
  isEditMode
}) => {
  const updateStep2 = (field: keyof EmpresaDataForm['step2'], value: string | number | null) => {
    updateData({
      step2: {
        ...data.step2,
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
              <label className='form-label required fs-6 fw-semibold'>Teléfono</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step2.telefono ? 'is-invalid' : ''}`}
                placeholder="Teléfono"
                value={data.step2.telefono}
                onChange={(e) => updateStep2('telefono', e.target.value)}
              />
              {hasError && !data.step2.telefono && (
                <div className='invalid-feedback'>El teléfono es requerido</div>
              )}
            </div>
          </div>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Representante Legal</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step2.representanteLegal ? 'is-invalid' : ''}`}
                placeholder="Representante Legal"
                value={data.step2.representanteLegal}
                onChange={(e) => updateStep2('representanteLegal', e.target.value)}
              />
              {hasError && !data.step2.representanteLegal && (
                <div className='invalid-feedback'>El representante legal es requerido</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export { Step2 }