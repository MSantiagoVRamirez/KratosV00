import { FC, useEffect } from 'react'
import { IHallazgoFormData } from '../../../interfaces/talleres-hallazgos/HallazgoFormData'
import { Usuario } from '../../../interfaces/seguridad/Usuario'

type Props = {
  data: IHallazgoFormData
  updateData: (fieldsToUpdate: Partial<IHallazgoFormData>) => void
  hasError: boolean
  usuarios: Usuario[]
  currentUsername: string
}

const Step2: FC<Props> = ({ 
  data, 
  updateData, 
  hasError, 
  usuarios,
  currentUsername
}) => {
  const updateStep2 = (field: keyof IHallazgoFormData['step2'], value: number) => {
    updateData({
      step2: {
        ...data.step2,
        [field]: value
      }
    })
  }

  // Obtener usuario actual
  const currentUser = usuarios.find(u => u.usuario === currentUsername)
  const currentUserId = currentUser?.id || 0

  // Filtrar usuarios de Cenit para originador de brechas
  const usuariosCenit = usuarios.filter(usuario => usuario.empresaId === 1).sort((a, b) => `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`))

  // Actualizar responsableAccionId automáticamente
  useEffect(() => {
    if (currentUserId && currentUserId !== data.step2.responsableAccionId) {
      updateStep2('responsableAccionId', currentUserId)
    }
  }, [currentUserId])

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Responsable de Acción</label>
              <select
                className='form-select form-select-solid'
                value={currentUserId}
                disabled
              >
                                    <option value={0}>Seleccione un responsable</option>
                    {usuarios.sort((a, b) => `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`)).map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombres} {usuario.apellidos}
                      </option>
                    ))}
              </select>
              <div className='form-text'>Se asigna automáticamente según el usuario logueado</div>
            </div>
          </div>
          
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Originador de Brechas</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step2.originadorBrechasId === 0 ? 'is-invalid' : ''}`}
                value={data.step2.originadorBrechasId}
                onChange={(e) => updateStep2('originadorBrechasId', parseInt(e.target.value))}
              >
                <option value={0}>Seleccione un originador</option>
                {usuariosCenit.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombres} {usuario.apellidos}
                  </option>
                ))}
              </select>
              {hasError && data.step2.originadorBrechasId === 0 && (
                <div className='invalid-feedback'>El originador de brechas es requerido</div>
              )}
              <div className='form-text'>Solo usuarios de Cenit pueden ser originadores de brechas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step2 } 