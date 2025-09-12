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
      <div style={{ marginLeft: '7%', marginTop: '2%' }}>
        <div className='w-100 user-card' style={{ padding: '1rem' }}>
          <div className='row'>
            <div className='col-md-12'>
              <div className='fv-row mb-7'>
                <label style={{color: 'rgb(18, 30, 130)'}} className='required fs-6 fw-semibold'>Teléfono</label>
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
            <div className='col-md-12'>
              <div className='fv-row mb-7'>
                <label style={{color: 'rgb(18, 30, 130)'}} className=' required fs-6 fw-semibold'>Representante Legal</label>
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

            {/* Imagen de perfil (opcional) */}
            <div className='col-md-12'>
              <div className='fv-row mb-7'>
                <label style={{color: 'rgb(18, 30, 130)'}} className='fs-6 fw-semibold'>Imagen de perfil (opcional)</label>
                <input
                  type='file'
                  accept='image/*'
                  className='form-control form-control-solid'
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    const preview = file ? URL.createObjectURL(file) : null
                    updateData({
                      step2: {
                        ...data.step2,
                        imagenFile: file,
                        imagenPreview: preview,
                      },
                    })
                  }}
                />
                {data.step2.imagenPreview && (
                  <div style={{marginTop: '10px'}}>
                    <img
                      src={data.step2.imagenPreview}
                      alt='Vista previa'
                      style={{maxWidth: '180px', borderRadius: 8, boxShadow: '0 4px 10px rgba(0,0,0,.2)'}}
                    />
                    <div>
                      <button
                        type='button'
                        className='btn btn-sm btn-light mt-2'
                        onClick={() => updateData({ step2: { ...data.step2, imagenFile: null, imagenPreview: null } })}
                      >
                        Quitar imagen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  )
}
export { Step2 }
