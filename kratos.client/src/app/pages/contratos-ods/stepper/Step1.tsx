import { FC } from 'react'
import { IContratoFormData } from '../../../interfaces/contratos-ods/ContratoFormData'

type Props = {
  data: IContratoFormData
  updateData: (fieldsToUpdate: Partial<IContratoFormData>) => void
  hasError: boolean
  isEditMode: boolean
}

const Step1: FC<Props> = ({ data, updateData, hasError, isEditMode }) => {
  const updateStep1 = (field: keyof IContratoFormData['step1'], value: string | number | null) => {
    updateData({
      step1: {
        ...data.step1,
        [field]: value
      }
    })
  }

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      {/* <div className='text-center mb-10'>
        <h2 className='text-dark mb-3'>Información Básica</h2>
        <div className='text-gray-400 fw-semibold fs-5'>
          Ingrese los datos generales del contrato
        </div>
      </div> */}
      
      <div className='w-100'>
        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Número</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step1.numero ? 'is-invalid' : ''}`}
                placeholder="Número de contrato"
                value={isEditMode ? data.step1.numero : 'Se asigna automáticamente'}
                onChange={(e) => updateStep1('numero', e.target.value)}
                disabled={!isEditMode}
              />
              {hasError && !data.step1.numero && (
                <div className='invalid-feedback'>El número es requerido</div>
              )}
            </div>
          </div>
          
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label fs-6 fw-semibold'>Número Seguimiento Cenit</label>
              <input
                type="text"
                className="form-control form-control-solid"
                placeholder="Número de seguimiento Cenit (opcional)"
                value={data.step1.numeroSeguimientoCenit || ''}
                onChange={(e) => updateStep1('numeroSeguimientoCenit', e.target.value || null)}
              />
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label fs-6 fw-semibold'>Número Seguimiento Contratista</label>
              <input
                type="text"
                className="form-control form-control-solid"
                placeholder="Número de seguimiento contratista (opcional)"
                value={data.step1.numeroSeguimientoContratista || ''}
                onChange={(e) => updateStep1('numeroSeguimientoContratista', e.target.value || null)}
              />
            </div>
          </div>

          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Portafolio</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step1.portafolio === 0 ? 'is-invalid' : ''}`}
                value={data.step1.portafolio ?? ''}
                onChange={(e) => updateStep1('portafolio', parseInt(e.target.value))}
              >
                <option value={""}>Seleccione un portafolio</option>
                <option value={2}>Alta complejidad</option>
                <option value={0}>Baja complejidad</option>
                <option value={1}>Media complejidad</option>
              </select>
              {hasError && data.step1.portafolio === 0 && (
                <div className='invalid-feedback'>El portafolio es requerido</div>
              )}
            </div>
          </div>
        </div>

        <div className='fv-row mb-7'>
          <label className='form-label required fs-6 fw-semibold'>Objeto del Contrato</label>
          <textarea
            className={`form-control form-control-solid ${hasError && !data.step1.objeto ? 'is-invalid' : ''}`}
            placeholder="Descripción del objeto del contrato"
            value={data.step1.objeto}
            onChange={(e) => updateStep1('objeto', e.target.value)}
            rows={3}
          />
          {hasError && !data.step1.objeto && (
            <div className='invalid-feedback'>El objeto del contrato es requerido</div>
          )}
        </div>
      </div>
    </div>
  )
}

export { Step1 } 