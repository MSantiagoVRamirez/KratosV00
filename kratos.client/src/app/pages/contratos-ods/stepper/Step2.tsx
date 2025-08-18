import { FC } from 'react'
import { IContratoFormData } from '../../../interfaces/contratos-ods/ContratoFormData'
import { Empresa } from '../../../interfaces/seguridad/Empresa'
import { Usuario } from '../../../interfaces/seguridad/Usuario'
import { useAuth } from '../../../modules/auth/AuthContext'

type Props = {
  data: IContratoFormData
  updateData: (fieldsToUpdate: Partial<IContratoFormData>) => void
  hasError: boolean
  empresas: Empresa[]
  usuarios: Usuario[]
}

const Step2: |FC<Props> = ({ data, updateData, hasError, empresas, usuarios }) => {
  const updateStep2 = (field: keyof IContratoFormData['step2'], value: number) => {
    updateData({
      step2: {
        ...data.step2,
        [field]: value
      }
    })
  }

  const { user } = useAuth()
  const currentUserId = usuarios.find(u => u.usuario === user)?.id || 0

  const filteredUsuariosByEmpresa = usuarios.filter(usuario => usuario.empresaId === data.step2.empresaId).sort((a, b) => `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`))
  const filteredUsuariosJefeIngenieria = usuarios.filter(usuario => usuario.rolId === 7).sort((a, b) => `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`))

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      {/* <div className='text-center mb-10'>
        <h2 className='text-dark mb-3'>Asignaciones</h2>
        <div className='text-gray-400 fw-semibold fs-5'>
          Seleccione el consultor y los responsables del contrato
        </div>
      </div> */}
      
      <div className='w-100'>
        <div className='fv-row mb-7'>
          <label className='form-label required fs-6 fw-semibold'>Consultor</label>
          <select
            className={`form-select form-select-solid ${hasError && data.step2.empresaId === 0 ? 'is-invalid' : ''}`}
            value={data.step2.empresaId}
            onChange={(e) => updateStep2('empresaId', parseInt(e.target.value))}
          >
            <option value={0}>Seleccione una empresa</option>
                            {empresas.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
          </select>
          {hasError && data.step2.empresaId === 0 && (
            <div className='invalid-feedback'>El consultor es requerido</div>
          )}
        </div>

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label fs-6 fw-semibold'>Originador</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step2.originadorId === 0 ? 'is-invalid' : ''}`}
                value={currentUserId}
                onChange={(e) => updateStep2('originadorId', parseInt(e.target.value))}
                disabled
              >
                <option value={0}>Seleccione un originador</option>
                {usuarios.sort((a, b) => a.usuario.localeCompare(b.usuario)).map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.usuario}
                  </option>
                ))}
              </select>
              {hasError && data.step2.originadorId === 0 && (
                <div className='invalid-feedback'>El originador es requerido</div>
              )}
            </div>
          </div>

          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Representante del Contrato</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step2.adminContratoId === 0 ? 'is-invalid' : ''}`}
                value={data.step2.adminContratoId}
                onChange={(e) => updateStep2('adminContratoId', parseInt(e.target.value))}
              >
                <option value={0}>Seleccione un representante</option>
                {filteredUsuariosByEmpresa.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombres} {usuario.apellidos}
                  </option>
                ))}
              </select>
              {hasError && data.step2.adminContratoId === 0 && (
                <div className='invalid-feedback'>El representante de contrato es requerido</div>
              )}
            </div>
          </div>
        </div>

        <div className='fv-row mb-7'>
          <label className='form-label required fs-6 fw-semibold'>Jefe de Ingeniería</label>
          <select
            className={`form-select form-select-solid ${hasError && data.step2.jefeIngenieriaId === 0 ? 'is-invalid' : ''}`}
            value={data.step2.jefeIngenieriaId}
            onChange={(e) => updateStep2('jefeIngenieriaId', parseInt(e.target.value))}
          >
            <option value={0}>Seleccione un jefe de ingeniería</option>
            {filteredUsuariosJefeIngenieria.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombres} {usuario.apellidos}
              </option>
            ))}
          </select>
          {hasError && data.step2.jefeIngenieriaId === 0 && (
            <div className='invalid-feedback'>El jefe de ingeniería es requerido</div>
          )}
        </div>
      </div>
    </div>
  )
}

export { Step2 } 