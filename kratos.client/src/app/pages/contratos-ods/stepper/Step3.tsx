import { FC } from 'react'
import { IContratoFormData } from '../../../interfaces/contratos-ods/ContratoFormData'

type Props = {
  data: IContratoFormData
  updateData: (fieldsToUpdate: Partial<IContratoFormData>) => void
  hasError: boolean
}

const Step3: FC<Props> = ({ data, updateData, hasError }) => {
  const updateStep3 = (field: keyof IContratoFormData['step3'], value: string) => {
    updateData({
      step3: {
        ...data.step3,
        [field]: value
      }
    })
  }

  // Calcular duración en días
  const calcularDuracion = () => {
    if (data.step3.fechaInicio && data.step3.fechaFin) {
      const inicio = new Date(data.step3.fechaInicio)
      const fin = new Date(data.step3.fechaFin)
      const differenceInTime = fin.getTime() - inicio.getTime()
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1
      return differenceInDays > 0 ? differenceInDays : 0 
    }
    return 0
  }

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      {/* <div className='text-center mb-10'>
        <h2 className='text-dark mb-3'>Fechas y Plazos</h2>
        <div className='text-gray-400 fw-semibold fs-5'>
          Defina las fechas de inicio y fin del contrato
        </div>
      </div> */}
      
      <div className='w-100'>

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Fecha de Inicio</label>
              <input
                type="date"
                className={`form-control form-control-solid ${hasError && !data.step3.fechaInicio ? 'is-invalid' : ''}`}
                value={data.step3.fechaInicio ? new Date(data.step3.fechaInicio).toISOString().split('T')[0] : ''}
                onChange={(e) => updateStep3('fechaInicio', e.target.value)}
              />
              {hasError && !data.step3.fechaInicio && (
                <div className='invalid-feedback'>La fecha de inicio es requerida</div>
              )}
            </div>
          </div>

          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Fecha de Fin</label>
              <input
                type="date"
                className={`form-control form-control-solid ${hasError && !data.step3.fechaFin ? 'is-invalid' : ''}`}
                value={data.step3.fechaFin ? new Date(data.step3.fechaFin).toISOString().split('T')[0] : ''}
                onChange={(e) => updateStep3('fechaFin', e.target.value)}
                min={data.step3.fechaInicio || undefined}
              />
              {hasError && !data.step3.fechaFin && (
                <div className='invalid-feedback'>La fecha de fin es requerida</div>
              )}
            </div>
          </div>
        </div>

        {data.step3.fechaInicio && data.step3.fechaFin && (
          <div className='fv-row mb-7'>
            <label className='form-label fs-6 fw-semibold'>Duración del Contrato</label>
            <div className='d-flex align-items-center'>
              <div className='bg-light rounded p-4 flex-grow-1 text-center'>
                <div className='text-dark fw-bold fs-2'>{calcularDuracion()}</div>
                <div className='text-gray-400 fw-semibold'>días calendario</div>
              </div>
            </div>
          </div>
        )}

        {data.step3.fechaInicio && data.step3.fechaFin && calcularDuracion() <= 0 && (
          <div className='alert alert-warning d-flex align-items-center p-5 mb-10'>
            <div className='d-flex flex-column'>
              <h4 className='mb-1 text-warning'>Advertencia</h4>
              <span>La fecha de fin debe ser posterior a la fecha de inicio</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { Step3 } 