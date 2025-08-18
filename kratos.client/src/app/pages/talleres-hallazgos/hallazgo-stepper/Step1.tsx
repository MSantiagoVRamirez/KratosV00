import { FC } from 'react'
import { IHallazgoFormData } from '../../../interfaces/talleres-hallazgos/HallazgoFormData'
import { Taller } from '../../../interfaces/talleres-hallazgos/Taller'
import { Disciplina } from '../../../interfaces/talleres-hallazgos/Disciplina'

type Props = {
  data: IHallazgoFormData
  updateData: (fieldsToUpdate: Partial<IHallazgoFormData>) => void
  hasError: boolean
  selectedTallerId?: number
  talleres: Taller[]
  disciplinas: Disciplina[]
}

const Step1: FC<Props> = ({ 
  data, 
  updateData, 
  hasError, 
  selectedTallerId,
  talleres,
  disciplinas
}) => {
  const updateStep1 = (field: keyof IHallazgoFormData['step1'], value: string | number) => {
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
              <label className='form-label required fs-6 fw-semibold'>Taller</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step1.tallerId === 0 ? 'is-invalid' : ''}`}
                value={data.step1.tallerId}
                onChange={(e) => updateStep1('tallerId', parseInt(e.target.value))}
                disabled={selectedTallerId !== undefined && selectedTallerId !== 0}
              >
                {selectedTallerId !== undefined && selectedTallerId !== 0 ? (
                  <option value={selectedTallerId}>
                    {talleres.find(t => t.id === selectedTallerId)?.nombre || 'Cargando...'}
                  </option>
                ) : (
                  <>
                    <option value={0}>Seleccione un taller</option>
                    {talleres.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((taller) => (
                      <option key={taller.id} value={taller.id}>
                        {taller.nombre}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {hasError && data.step1.tallerId === 0 && (
                <div className='invalid-feedback'>El taller es requerido</div>
              )}
            </div>
          </div>
          
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Disciplina</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step1.disciplinaId === 0 ? 'is-invalid' : ''}`}
                value={data.step1.disciplinaId}
                onChange={(e) => updateStep1('disciplinaId', parseInt(e.target.value))}
              >
                <option value={0}>Seleccione una disciplina</option>
                {disciplinas.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((disciplina) => (
                  <option key={disciplina.id} value={disciplina.id}>
                    {disciplina.nombre}
                  </option>
                ))}
              </select>
              {hasError && data.step1.disciplinaId === 0 && (
                <div className='invalid-feedback'>La disciplina es requerida</div>
              )}
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Tipo de Categoría</label>
              <select
                className={`form-select form-select-solid ${hasError && (data.step1.tipoCategoria === null || data.step1.tipoCategoria === undefined) ? 'is-invalid' : ''}`}
                value={data.step1.tipoCategoria ?? ''}
                onChange={(e) => updateStep1('tipoCategoria', parseInt(e.target.value))}
              >
                <option value="">Seleccione un tipo</option>
                <option value={0}>Tipo 1</option>
                <option value={1}>Tipo 2</option>
                <option value={2}>Tipo 3</option>
              </select>
              {hasError && (data.step1.tipoCategoria === null || data.step1.tipoCategoria === undefined) && (
                <div className='invalid-feedback'>El tipo de categoría es requerido</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step1 } 