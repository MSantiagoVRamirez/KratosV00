import { FC } from 'react'
import { ITallerFormData } from '../../../interfaces/talleres-hallazgos/TallerFormData'
import { ODS } from '../../../interfaces/contratos-ods/ODS'
import { TipoTaller } from '../../../interfaces/talleres-hallazgos/TipoTaller'

type Props = {
  data: ITallerFormData
  updateData: (fieldsToUpdate: Partial<ITallerFormData>) => void
  hasError: boolean
  selectedODSId?: number
  ordenesServicio: ODS[]
  tiposTaller: TipoTaller[]
}

const Step1: FC<Props> = ({ 
  data, 
  updateData, 
  hasError, 
  selectedODSId,
  ordenesServicio,
  tiposTaller
}) => {
  const updateStep1 = (field: keyof ITallerFormData['step1'], value: string | number) => {
    updateData({
      step1: {
        ...data.step1,
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
              <label className='form-label required fs-6 fw-semibold'>Fecha</label>
              <input
                type="date"
                className={`form-control form-control-solid ${hasError && !data.step1.fecha ? 'is-invalid' : ''}`}
                value={data.step1.fecha}
                onChange={(e) => updateStep1('fecha', e.target.value)}
              />
              {hasError && !data.step1.fecha && (
                <div className='invalid-feedback'>La fecha es requerida</div>
              )}
            </div>
          </div>
          
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Tipo de Taller</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step1.tipoId === 0 ? 'is-invalid' : ''}`}
                value={data.step1.tipoId}
                onChange={(e) => updateStep1('tipoId', parseInt(e.target.value))}
              >
                                    <option value={0}>Seleccione un tipo</option>
                    {tiposTaller.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
              </select>
              {hasError && data.step1.tipoId === 0 && (
                <div className='invalid-feedback'>El tipo de taller es requerido</div>
              )}
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>ODS</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step1.odsId === 0 ? 'is-invalid' : ''}`}
                value={data.step1.odsId}
                onChange={(e) => updateStep1('odsId', parseInt(e.target.value))}
                disabled={selectedODSId !== undefined && selectedODSId !== 0}
              >
                {selectedODSId !== undefined && selectedODSId !== 0 ? (
                  <option value={selectedODSId}>
                    {ordenesServicio.find(ods => ods.id === selectedODSId)?.nombre || 'Cargando...'}
                  </option>
                ) : (
                  <>
                    <option value={0}>Seleccione una ODS</option>
                    {ordenesServicio.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((ods) => (
                      <option key={ods.id} value={ods.id}>
                        {ods.nombre}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {hasError && data.step1.odsId === 0 && (
                <div className='invalid-feedback'>La ODS es requerida</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step1 } 