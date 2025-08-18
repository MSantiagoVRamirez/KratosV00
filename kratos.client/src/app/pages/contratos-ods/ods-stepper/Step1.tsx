import { FC } from 'react'
import { IODSFormData } from '../../../interfaces/contratos-ods/ODSFormData'
import { Contrato } from '../../../interfaces/contratos-ods/Contrato'
import { Empresa } from '../../../interfaces/seguridad/Empresa'

type Props = {
  data: IODSFormData
  updateData: (fieldsToUpdate: Partial<IODSFormData>) => void
  hasError: boolean
  isEditMode: boolean
  contratos: Contrato[]
  empresas: Empresa[]
  selectedContratoId?: number
}

const Step1: FC<Props> = ({ 
  data, 
  updateData, 
  hasError, 
  isEditMode, 
  contratos, 
  empresas,
  selectedContratoId 
}) => {
  const updateStep1 = (field: keyof IODSFormData['step1'], value: string | number | null) => {
    updateData({
      step1: {
        ...data.step1,
        [field]: value
      }
    })
  }

  const contratistaId = contratos.find(c => c.id === data.step1.contratoId)?.empresaId
  const contratista = empresas.find(e => e.id === contratistaId)?.nombre

  const portafolioContrato = contratos.find(c => c.id === data.step1.contratoId)?.portafolio

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Número Seguimiento Cenit</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step1.numeroSeguimientoCenit ? 'is-invalid' : ''}`}
                placeholder="Número de seguimiento Cenit"
                value={data.step1.numeroSeguimientoCenit}
                onChange={(e) => updateStep1('numeroSeguimientoCenit', e.target.value)}
              />
              {hasError && !data.step1.numeroSeguimientoCenit && (
                <div className='invalid-feedback'>El número de seguimiento Cenit es requerido</div>
              )}
            </div>
          </div>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Número Seguimiento Contratista</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step1.numeroSeguimientoContratista ? 'is-invalid' : ''}`}
                placeholder="Número de seguimiento contratista"
                value={data.step1.numeroSeguimientoContratista}
                onChange={(e) => updateStep1('numeroSeguimientoContratista', e.target.value)}
              />
              {hasError && !data.step1.numeroSeguimientoContratista && (
                <div className='invalid-feedback'>El número de seguimiento contratista es requerido</div>
              )}
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Tipo de ODS</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step1.tipoODS === 0 ? 'is-invalid' : ''}`}
                value={data.step1.tipoODS}
                onChange={(e) => updateStep1('tipoODS', parseInt(e.target.value))}
                disabled={isEditMode}
              >
                <option value={0}>Dedicada</option>
                <option value={1}>De Agregación de Demanda</option>
              </select>
              {hasError && data.step1.tipoODS === 0 && (
                <div className='invalid-feedback'>El tipo de ODS es requerido</div>
              )}
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Complejidad</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step1.complejidad === null ? 'is-invalid' : ''}`}
                value={data.step1.complejidad ?? ''}
                onChange={(e) => updateStep1('complejidad', parseInt(e.target.value))}
              >
                <option value="">Seleccione una complejidad</option>
                {(portafolioContrato === 2) && (
                <option value={0}>Alta</option>
                )}
                <option value={2}>Baja</option>
                {(portafolioContrato === 1 || portafolioContrato === 2) && (
                  <option value={1}>Media</option>
                )}
              </select>
              {hasError && data.step1.complejidad === null && (
                <div className='invalid-feedback'>La complejidad es requerida</div>
              )}
            </div>
          </div>

          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Contrato</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step1.contratoId === 0 ? 'is-invalid' : ''}`}
                value={data.step1.contratoId}
                onChange={(e) => updateStep1('contratoId', parseInt(e.target.value))}
                disabled={selectedContratoId !== undefined && selectedContratoId !== 0}
              >
                {selectedContratoId !== undefined && selectedContratoId !== 0 ? (
                  <option value={selectedContratoId}>
                    {contratos.find(c => c.id === selectedContratoId)?.numero || 'Cargando...'}
                  </option>
                ) : (
                  <>
                    <option value={0}>Seleccione un contrato</option>
                    {contratos.sort((a, b) => a.numero.localeCompare(b.numero)).map((contrato) => (
                      <option key={contrato.id} value={contrato.id}>
                        {contrato.numero}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {hasError && data.step1.contratoId === 0 && (
                <div className='invalid-feedback'>El contrato es requerido</div>
              )}
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <div className='fv-row mb-7'>
              <label className='form-label fs-6 fw-semibold'>Contratista</label>
              <input
                type="text"
                className="form-control form-control-solid"
                placeholder="Nombre del contratista"
                value={contratista ?? ''}
                disabled
              />
            </div>
          </div>
        </div>

        <div className='fv-row mb-7'>
          <label className='form-label required fs-6 fw-semibold'>Descripción</label>
          <textarea
            className={`form-control form-control-solid ${hasError && !data.step1.descripcion ? 'is-invalid' : ''}`}
            placeholder="Descripción detallada de la ODS"
            value={data.step1.descripcion}
            onChange={(e) => updateStep1('descripcion', e.target.value)}
            rows={4}
          />
          {hasError && !data.step1.descripcion && (
            <div className='invalid-feedback'>La descripción es requerida</div>
          )}
        </div>
      </div>
    </div>
  )
}

export { Step1 } 