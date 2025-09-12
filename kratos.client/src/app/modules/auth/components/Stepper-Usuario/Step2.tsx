import {FC} from 'react'
import {UsuarioDataForm} from '../../../../interfaces/seguridad/UsuarioDataForm'

type Props = {
  data: UsuarioDataForm
  updateData: (fieldsToUpdate: Partial<UsuarioDataForm>) => void
  hasError: boolean
}

export const Step2: FC<Props> = ({data, updateData, hasError}) => {
  const update = (field: keyof UsuarioDataForm['step1'], value: string) =>
    updateData({step1: {...data.step1, [field]: value}})

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div style={{marginLeft: '7%', marginTop: '2%'}}>
        <div className='w-100 user-card' style={{padding: '1rem'}}>
          <div className='row'>
            <div className='col-md-6'>
              <div className='fv-row mb-7'>
                <label className='required fs-6 fw-semibold'>Email</label>
                <input
                  type='email'
                  className={`form-control form-control-solid ${hasError && !data.step1.email ? 'is-invalid' : ''}`}
                  placeholder='Email'
                  value={data.step1.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </div>
            </div>
            <div className='col-md-3'>
              <div className='fv-row mb-7'>
                <label className='required fs-6 fw-semibold'>Contraseña</label>
                <input
                  type='password'
                  className={`form-control form-control-solid ${hasError && !data.step1.contraseña ? 'is-invalid' : ''}`}
                  placeholder='Contraseña'
                  value={data.step1.contraseña}
                  onChange={(e) => update('contraseña', e.target.value)}
                />
              </div>
            </div>
            <div className='col-md-3'>
              <div className='fv-row mb-7'>
                <label className='required fs-6 fw-semibold'>Confirmar</label>
                <input
                  type='password'
                  className={`form-control form-control-solid ${hasError && !data.step1.confirmarContraseña ? 'is-invalid' : ''}`}
                  placeholder='Confirmar'
                  value={data.step1.confirmarContraseña}
                  onChange={(e) => update('confirmarContraseña', e.target.value)}
                />
              </div>
            </div>
            <div className='col-md-6'>
              <div className='fv-row mb-7'>
                <label className='required fs-6 fw-semibold'>Token Empresa</label>
                <input
                  className={`form-control form-control-solid ${hasError && !data.step1.token ? 'is-invalid' : ''}`}
                  placeholder='Token'
                  value={data.step1.token}
                  onChange={(e) => update('token', e.target.value)}
                  disabled={data.tipoUsuario === 'cliente'}
                />
                {data.tipoUsuario === 'cliente' && (
                  <div className='form-text'>Asignado automáticamente: 123456789</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
