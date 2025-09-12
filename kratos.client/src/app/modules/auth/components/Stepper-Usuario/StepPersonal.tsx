import {FC} from 'react'
import {UsuarioDataForm} from '../../../../interfaces/seguridad/UsuarioDataForm'

type Props = {
  data: UsuarioDataForm
  updateData: (fieldsToUpdate: Partial<UsuarioDataForm>) => void
  hasError: boolean
}

export const StepPersonal: FC<Props> = ({data, updateData, hasError}) => {
  const update = (field: keyof UsuarioDataForm['step2'], value: string) =>
    updateData({step2: {...data.step2, [field]: value}})

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div style={{marginLeft: '7%', marginTop: '2%'}}>
        <div className='w-100 user-card' style={{padding: '1rem'}}>
          <div className='row'>
            <div className='col-md-4'>
              <div className='fv-row mb-7'>
                <label className='required fs-6 fw-semibold'>Nombres</label>
                <input
                  className={`form-control form-control-solid ${hasError && !data.step2.nombres ? 'is-invalid' : ''}`}
                  placeholder='Nombres'
                  value={data.step2.nombres}
                  onChange={(e)=>update('nombres', e.target.value)}
                />
              </div>
            </div>
            <div className='col-md-4'>
              <div className='fv-row mb-7'>
                <label className='required fs-6 fw-semibold'>Apellidos</label>
                <input
                  className={`form-control form-control-solid ${hasError && !data.step2.apellidos ? 'is-invalid' : ''}`}
                  placeholder='Apellidos'
                  value={data.step2.apellidos}
                  onChange={(e)=>update('apellidos', e.target.value)}
                />
              </div>
            </div>
            <div className='col-md-4'>
              <div className='fv-row mb-7'>
                <label className='required fs-6 fw-semibold'>Teléfono</label>
                <input
                  className={`form-control form-control-solid ${hasError && !data.step2.telefono ? 'is-invalid' : ''}`}
                  placeholder='Teléfono'
                  value={data.step2.telefono}
                  onChange={(e)=>update('telefono', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

