import { FC } from 'react'
import { EmpresaDataForm } from '../../../../interfaces/Configuracion/EmpresaDataForm';

type Props = {
  data: EmpresaDataForm
  updateData: (fieldsToUpdate: Partial<EmpresaDataForm>) => void
  hasError: boolean
  isEditMode: boolean
}
const Step1: FC<Props> = ({ 
  data, 
  updateData, 
  hasError, 
  isEditMode
}) => {
  const updateStep1 = (field: keyof EmpresaDataForm['step1'], value: string | number | null) => {
    updateData({
      step1: {
        ...data.step1,
        [field]: value
      }
    })
  }
  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='row'>
          <div className='col-md-9'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Email</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step1.email ? 'is-invalid' : ''}`}
                placeholder="email"
                value={data.step1.email}
                onChange={(e) => updateStep1('email', e.target.value)}
              />
              {hasError && !data.step1.email && (
                <div className='invalid-feedback'>La dirección de correo Electronico Es Requerida</div>
              )}
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Contraseña</label>
              <input
                type="password"
                className={`form-control form-control-solid ${hasError && !data.step1.contraseña ? 'is-invalid' : ''}`}
                placeholder="contraseña"
                value={data.step1.contraseña}
                onChange={(e) => updateStep1('contraseña', e.target.value)}
              />
              {hasError && !data.step1.contraseña && (
                <div className='invalid-feedback'>La Contraseña Es Requerida</div>
              )}
            </div>
          </div>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Confirmar Contraseña</label>
              <input
                type="password"
                className={`form-control form-control-solid ${hasError && !data.step1.confirmarContraseña ? 'is-invalid' : ''}`}
                placeholder="confirmar contraseña"
                value={data.step1.contraseña}
                onChange={(e) => updateStep1('confirmarContraseña', e.target.value)}
              />
              {hasError && !data.step1.contraseña && (
                <div className='invalid-feedback'>La confirmacion de la Contraseña es Requerida</div>
              )}
            </div>
          </div>
        </div>
        <div className='row'>
            <div className='col-md-6'>
                <div className='fv-row mb-7'>
                <label className='form-label required fs-6 fw-semibold'>Token</label>
                <input
                    type="text"
                    className={`form-control form-control-solid ${hasError && !data.step1.Token ? 'is-invalid' : ''}`}
                    placeholder="Token"
                    value={data.step1.Token}
                    onChange={(e) => updateStep1('Token', e.target.value)}
                />
                {hasError && !data.step1.Token && (
                    <div className='invalid-feedback'>El Token Es Requerido</div>
                )}
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
export { Step1 } 
