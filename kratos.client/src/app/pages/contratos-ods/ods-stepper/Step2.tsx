import { FC } from 'react'
import { IODSFormData } from '../../../interfaces/contratos-ods/ODSFormData'
import { Usuario } from '../../../interfaces/seguridad/Usuario'

type Props = {
  data: IODSFormData
  updateData: (fieldsToUpdate: Partial<IODSFormData>) => void
  hasError: boolean
  usuariosCenit: Usuario[]
  usuariosContratista: Usuario[]
}

const Step2: FC<Props> = ({ 
  data, 
  updateData, 
  hasError, 
  usuariosCenit,
  usuariosContratista 
}) => {
  const updateStep2 = (field: keyof IODSFormData['step2'], value: number | null) => {
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
              <label className='form-label required fs-6 fw-semibold'>Coordinador ODS</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step2.coordinadorODSId === null ? 'is-invalid' : ''}`}
                value={data.step2.coordinadorODSId ?? ''}
                onChange={(e) => updateStep2('coordinadorODSId', parseInt(e.target.value) || null)}
              >
                <option value="">Seleccione un coordinador</option>
                {usuariosContratista.sort((a, b) => `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`)).map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombres} {usuario.apellidos}
                  </option>
                ))}
              </select>
              {hasError && data.step2.coordinadorODSId === null && (
                <div className='invalid-feedback'>El coordinador ODS es requerido</div>
              )}
            </div>
          </div>
          
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Supervisor Técnico</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step2.supervisorTecnicoId === null ? 'is-invalid' : ''}`}
                value={data.step2.supervisorTecnicoId ?? ''}
                onChange={(e) => updateStep2('supervisorTecnicoId', parseInt(e.target.value) || null)}
              >
                <option value="">Seleccione un supervisor</option>
                {usuariosCenit.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombres} {usuario.apellidos}
                  </option>
                ))}
              </select>
              {hasError && data.step2.supervisorTecnicoId === null && (
                <div className='invalid-feedback'>El supervisor técnico es requerido</div>
              )}
            </div>
          </div>
        </div>

        {data.step1.tipoODS === 1 && (
          <div className='row'>
            <div className='col-md-6'>
              <div className='fv-row mb-7'>
                <label className='form-label required fs-6 fw-semibold'>S&C Contratista</label>
                <select
                  className={`form-select form-select-solid ${hasError && data.step2.SyCcontratistaId === null ? 'is-invalid' : ''}`}
                  value={data.step2.SyCcontratistaId ?? ''}
                  onChange={(e) => updateStep2('SyCcontratistaId', parseInt(e.target.value) || null)}
                >
                  <option value="">Seleccione</option>
                  {usuariosContratista.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombres} {usuario.apellidos}
                    </option>
                  ))}
                </select>
                {hasError && data.step2.SyCcontratistaId === null && (
                  <div className='invalid-feedback'>S&C Contratista es requerido para ODS de Agregación de Demanda</div>
                )}
              </div>
            </div>

            <div className='col-md-6'>
              <div className='fv-row mb-7'>
                <label className='form-label required fs-6 fw-semibold'>Líder de Servicio</label>
                <select
                  className={`form-select form-select-solid ${hasError && data.step2.liderServicioId === null ? 'is-invalid' : ''}`}
                  value={data.step2.liderServicioId ?? ''}
                  onChange={(e) => updateStep2('liderServicioId', parseInt(e.target.value) || null)}
                >
                  <option value="">Seleccione</option>
                  {usuariosCenit.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombres} {usuario.apellidos}
                    </option>
                  ))}
                </select>
                {hasError && data.step2.liderServicioId === null && (
                  <div className='invalid-feedback'>Líder de servicio es requerido para ODS de Agregación de Demanda</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Área Supervisión Técnica</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step2.areaSupervisionTecnica === null ? 'is-invalid' : ''}`}
                value={data.step2.areaSupervisionTecnica ?? ''}
                onChange={(e) => updateStep2('areaSupervisionTecnica', parseInt(e.target.value))}
              >
                <option value="">Seleccione un área</option>
                <option value={0}>Jefatura Ingeniería</option>
                <option value={1}>Jefatura Planeación de Proyectos</option>
              </select>
              {hasError && data.step2.areaSupervisionTecnica === null && (
                <div className='invalid-feedback'>El área de supervisión técnica es requerida</div>
              )}
            </div>
          </div>

          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Paquete Modular</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step2.paqueteModular === null ? 'is-invalid' : ''}`}
                value={data.step2.paqueteModular ?? ''}
                onChange={(e) => updateStep2('paqueteModular', parseInt(e.target.value))}
              >
                <option value="">Seleccione un paquete modular</option>
                <option value={0}>A</option>
                <option value={1}>B</option>
                <option value={2}>C</option>
              </select>
              {hasError && data.step2.paqueteModular === null && (
                <div className='invalid-feedback'>El paquete modular es requerido</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step2 } 