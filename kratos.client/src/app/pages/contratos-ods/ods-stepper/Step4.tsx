import { FC } from 'react'
import { IODSFormData } from '../../../interfaces/contratos-ods/ODSFormData'

type Props = {
  data: IODSFormData
  updateData: (fieldsToUpdate: Partial<IODSFormData>) => void
  hasError: boolean
}

const Step4: FC<Props> = ({ 
  data, 
  updateData, 
  hasError
}) => {
  const updateStep4 = (field: keyof IODSFormData['step4'], value: number) => {
    updateData({
      step4: {
        ...data.step4,
        [field]: value
      }
    })
  }

  // Formatear el número a moneda
  const formatCurrency = (number: number | string | undefined | null) => {
    if (number === undefined || number === null) return ''
    const parsed = typeof number === 'string' ? parseFloat(number.replace(/[^0-9]/g, '')) : number
    if (isNaN(parsed)) return ''
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(parsed)
  }

  // Manejar el input de moneda
  const handleCurrencyChange = (field: keyof IODSFormData['step4'], rawInput: string) => {
    const numericValue = parseInt(rawInput.replace(/[^0-9]/g, ''), 10)
    updateStep4(field, isNaN(numericValue) ? 0 : numericValue)
  }

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Valor HH (COP)</label>
              <input
                type="text"
                inputMode="numeric"
                className={`form-control form-control-solid ${hasError && data.step4.valorHH <= 0 ? 'is-invalid' : ''}`}
                placeholder="Valor Hora Hombre"
                value={formatCurrency(data.step4.valorHH)}
                onChange={(e) => handleCurrencyChange('valorHH', e.target.value)}
              />
              {hasError && data.step4.valorHH <= 0 && (
                <div className='invalid-feedback'>El valor HH debe ser mayor a 0</div>
              )}
            </div>
          </div>
          
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Valor Viajes (COP)</label>
              <input
                type="text"
                inputMode="numeric"
                className={`form-control form-control-solid ${hasError && data.step4.valorViaje < 0 ? 'is-invalid' : ''}`}
                placeholder="Valor Viajes"
                value={formatCurrency(data.step4.valorViaje)}
                onChange={(e) => handleCurrencyChange('valorViaje', e.target.value)}
              />
              {hasError && data.step4.valorViaje < 0 && (
                <div className='invalid-feedback'>El valor viajes no puede ser negativo</div>
              )}
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Valor Estudios (COP)</label>
              <input
                type="text"
                inputMode="numeric"
                className={`form-control form-control-solid ${hasError && data.step4.valorEstudio < 0 ? 'is-invalid' : ''}`}
                placeholder="Valor Estudios"
                value={formatCurrency(data.step4.valorEstudio)}
                onChange={(e) => handleCurrencyChange('valorEstudio', e.target.value)}
              />
              {hasError && data.step4.valorEstudio < 0 && (
                <div className='invalid-feedback'>El valor estudios no puede ser negativo</div>
              )}
            </div>
          </div>

          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label fs-6 fw-semibold'>Valor Suma Global Fija (Calculado)</label>
              <input
                type="text"
                className="form-control form-control-solid"
                placeholder="Valor Suma Global Fija"
                value={formatCurrency(data.step4.valorHH + data.step4.valorViaje + data.step4.valorEstudio)}
                disabled={true}
              />
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Valor Gasto Reembolsable (COP)</label>
              <input
                type="text"
                inputMode="numeric"
                className={`form-control form-control-solid ${hasError && data.step4.valorGastoReembolsable < 0 ? 'is-invalid' : ''}`}
                placeholder="Valor Gasto Reembolsable"
                value={formatCurrency(data.step4.valorGastoReembolsable)}
                onChange={(e) => handleCurrencyChange('valorGastoReembolsable', e.target.value)}
              />
              {hasError && data.step4.valorGastoReembolsable < 0 && (
                <div className='invalid-feedback'>El valor gasto reembolsable no puede ser negativo</div>
              )}
            </div>
          </div>

          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label fs-6 fw-semibold'>Porcentaje Gasto Reembolsable (Calculado)</label>
              <input
                type="text"
                className="form-control form-control-solid"
                placeholder="Porcentaje Gasto Reembolsable"
                value={
                  data.step4.valorGastoReembolsable != null && 
                  (data.step4.valorHH + data.step4.valorEstudio + data.step4.valorViaje) != 0 
                    ? `${Math.round(data.step4.valorGastoReembolsable / (data.step4.valorHH + data.step4.valorEstudio + data.step4.valorViaje) * 100)}%` 
                    : '0%'
                }
                disabled={true}
              />
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-12'>
            <div className='alert alert-info d-flex align-items-center p-5'>
              <div className='d-flex flex-column'>
                <h4 className='mb-1 text-dark'>Resumen de Valores</h4>
                <span>
                  <strong>Valor Total ODS:</strong> {formatCurrency(data.step4.valorHH + data.step4.valorViaje + data.step4.valorEstudio + data.step4.valorGastoReembolsable)}
                </span>
                <span>
                  <strong>Suma Global Fija:</strong> {formatCurrency(data.step4.valorHH + data.step4.valorViaje + data.step4.valorEstudio)}
                </span>
                <span>
                  <strong>Gastos Reembolsables:</strong> {formatCurrency(data.step4.valorGastoReembolsable)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step4 } 