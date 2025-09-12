import {FC} from 'react'
import {UsuarioDataForm} from '../../../../interfaces/seguridad/UsuarioDataForm'

type Props = {
  data: UsuarioDataForm
  updateData: (fieldsToUpdate: Partial<UsuarioDataForm>) => void
}

export const Step3: FC<Props> = ({data, updateData}) => {
  const onFile = (file: File | null) => {
    const preview = file ? URL.createObjectURL(file) : null
    updateData({step3: {...data.step3, imagenFile: file, imagenPreview: preview}})
  }

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div style={{marginLeft: '7%', marginTop: '2%'}}>
        <div className='w-100 user-card' style={{padding: '1rem'}}>
          <div className='row'>
            <div className='col-md-6'>
              <div className='fv-row mb-7'>
                <label className='fs-6 fw-semibold'>Imagen de perfil (opcional)</label>
                <input type='file' accept='image/*' className='form-control form-control-solid'
                       onChange={(e)=>onFile(e.target.files?.[0] ?? null)} />
                {data.step3.imagenPreview && (
                  <img src={data.step3.imagenPreview} alt='preview' style={{maxWidth: 180, marginTop: 10, borderRadius: 8}} />
                )}
              </div>
            </div>
            <div className='col-md-6'>
              <div className='alert alert-primary'>
                <div><strong>Email:</strong> {data.step1.email}</div>
                <div><strong>Nombres:</strong> {data.step2.nombres} {data.step2.apellidos}</div>
                <div><strong>Teléfono:</strong> {data.step2.telefono}</div>
                <div><strong>RolId:</strong> {data.step2.rolesId}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

