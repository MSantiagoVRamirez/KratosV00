import { useState, FC } from 'react'
import { EmpresaDataForm } from '../../../../interfaces/Configuracion/EmpresaDataForm'
import { Visibility, VisibilityOff } from '@mui/icons-material'

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
  isEditMode,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const updateStep1 = (field: keyof EmpresaDataForm['step1'], value: string | number | null) => {
    updateData({
      step1: {
        ...data.step1,
        [field]: value,
      },
    })
  }

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div  style={{ marginLeft: '7%', marginTop: '2%'  }}>
      <div className='w-100'>
        <div className='row'>
          <div className='col-md-12'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold' style={{color: 'rgba(255, 255, 255, 1)'}}>Email</label>
              <input
                type='text'
                className={`form-control form-control-solid ${hasError && !data.step1.email ? 'is-invalid' : ''}`}
                placeholder='email'
                value={data.step1.email}
                onChange={(e) => updateStep1('email', e.target.value)}
              />
              {hasError && !data.step1.email && (
                <div className='invalid-feedback'>La dirección de correo electrónico es requerida</div>
              )}
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <div className='fv-row mb-7 position-relative'>
              <label className='form-label required fs-6 fw-semibold'>Contraseña</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control form-control-solid ${hasError && !data.step1.contraseña ? 'is-invalid' : ''}`}
                placeholder='contraseña'
                value={data.step1.contraseña}
                onChange={(e) => updateStep1('contraseña', e.target.value)}
              />
              {hasError && !data.step1.contraseña && (
                <div className='invalid-feedback'>La contraseña es requerida</div>
              )}
              <span
                onClick={() => setShowPassword((show) => !show)}
                style={{
                  position: 'absolute',
                  right: '3%',
                  top: '65%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                {showPassword ? <Visibility  /> : <VisibilityOff /> }
              </span>
            </div>
          </div>

          <div className='col-md-12'>
            <div className='fv-row mb-7 position-relative'>
              <label className='form-label required fs-6 fw-semibold'>Confirmar Contraseña</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-control form-control-solid ${hasError && !data.step1.confirmarContraseña ? 'is-invalid' : ''}`}
                placeholder='confirmar contraseña'
                value={data.step1.confirmarContraseña} 
                onChange={(e) => updateStep1('confirmarContraseña', e.target.value)}
              />
              {hasError && !data.step1.confirmarContraseña && (
                <div className='invalid-feedback'>La confirmación de la contraseña es requerida</div>
              )}
              <span
                onClick={() => setShowConfirmPassword((show) => !show)}
                style={{
                  position: 'absolute',
                  right: '3%',
                  top: '65%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                {showConfirmPassword ? <Visibility  /> : <VisibilityOff />}
              </span>
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Token</label>
              <input
                type='text'
                className={`form-control form-control-solid ${hasError && !data.step1.token ? 'is-invalid' : ''}`}
                placeholder='Token'
                value={data.step1.token}
                onChange={(e) => updateStep1('token', e.target.value)}
              />
              {hasError && !data.step1.token && (
                <div className='invalid-feedback'>El token es requerido</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  )
}

export { Step1 }
