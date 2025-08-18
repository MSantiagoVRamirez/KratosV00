import { ISubODSFormData } from '../../../interfaces/contratos-ods/SubODSFormData'

type Props = {
  data: ISubODSFormData
  updateData: (fieldsToUpdate: Partial<ISubODSFormData>) => void
  hasError: boolean
}

const Step3 = ({ data, updateData, hasError }: Props) => {
  // Formatear el número a moneda
  const formatCurrency = (number: number | string | undefined | null) => {
    if (number === undefined || number === null) return '';
    const parsed = typeof number === 'string' ? parseFloat(number.replace(/[^0-9]/g, '')) : number;
    if (isNaN(parsed)) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(parsed);
  };

  // Function to pass from currency to numeric value
  const currencyToNumber = (value: string) => {
    const parsedValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return isNaN(parsedValue) ? 0 : parsedValue;
  }

  // Calcular valores totales
  const valorTotal = data.step3.valorHH + data.step3.valorViaje + data.step3.valorEstudio;
  const porcentajeGastoReembolsable = valorTotal > 0 ? 
    Math.round(data.step3.valorGastoReembolsable / valorTotal * 100) : 0;

  return (
    <div className='current' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='pb-10 pb-lg-15'>
          <h2 className='fw-bolder text-dark'>Valores y Presupuesto</h2>
          <div className='text-muted fw-bold fs-6'>
            Configure los valores económicos del servicio. Todos los campos son requeridos.
          </div>
        </div>

        <div className='fv-row'>
          {hasError && (
            <div className='alert alert-danger'>
              <div className='alert-text font-weight-bold'>
                Por favor complete todos los campos obligatorios en este paso.
              </div>
            </div>
          )}

          <div className='row'>
            <div className='col-lg-6'>
              <div className='fv-row mb-10'>
                <label className='form-label required'>Valor HH (COP)</label>
                <input
                  type='text'
                  inputMode='numeric'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Valor Hora Hombre'
                  value={formatCurrency(data.step3.valorHH)}
                  onChange={(e) => updateData({ 
                    step3: { 
                      ...data.step3, 
                      valorHH: currencyToNumber(e.target.value)
                    } 
                  })}
                />
              </div>
            </div>

            <div className='col-lg-6'>
              <div className='fv-row mb-10'>
                <label className='form-label required'>Valor Viajes (COP)</label>
                <input
                  type='text'
                  inputMode='numeric'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Valor Viajes'
                  value={formatCurrency(data.step3.valorViaje)}
                  onChange={(e) => updateData({ 
                    step3: { 
                      ...data.step3, 
                      valorViaje: currencyToNumber(e.target.value)
                    } 
                  })}
                />
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-6'>
              <div className='fv-row mb-10'>
                <label className='form-label required'>Valor Estudios (COP)</label>
                <input
                  type='text'
                  inputMode='numeric'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Valor Estudios'
                  value={formatCurrency(data.step3.valorEstudio)}
                  onChange={(e) => updateData({ 
                    step3: { 
                      ...data.step3, 
                      valorEstudio: currencyToNumber(e.target.value)
                    } 
                  })}
                />
              </div>
            </div>

            <div className='col-lg-6'>
              <div className='fv-row mb-10'>
                <label className='form-label required'>Valor Gasto Reembolsable (COP)</label>
                <input
                  type='text'
                  inputMode='numeric'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Valor Gasto Reembolsable'
                  value={formatCurrency(data.step3.valorGastoReembolsable)}
                  onChange={(e) => updateData({ 
                    step3: { 
                      ...data.step3, 
                      valorGastoReembolsable: currencyToNumber(e.target.value)
                    } 
                  })}
                />
              </div>
            </div>
          </div>

          {/* Resumen de valores */}
          <div className='separator separator-dashed my-10'></div>
          
          <div className='row'>
            <div className='col-lg-6'>
              <div className='d-flex flex-column'>
                <div className='fs-6 fw-bold text-gray-800 mb-2'>Valor Total del Servicio</div>
                <div className='fs-2 fw-bolder text-success'>
                  {formatCurrency(valorTotal)}
                </div>
              </div>
            </div>

            <div className='col-lg-6'>
              <div className='d-flex flex-column'>
                <div className='fs-6 fw-bold text-gray-800 mb-2'>Porcentaje Gasto Reembolsable</div>
                <div className='fs-2 fw-bolder text-primary'>
                  {porcentajeGastoReembolsable}%
                </div>
              </div>
            </div>
          </div>

          {/* Desglose de valores */}
          <div className='separator separator-dashed my-10'></div>
          
          <div className='d-flex flex-column'>
            <div className='fs-6 fw-bold text-gray-800 mb-5'>Desglose de Valores:</div>
            
            <div className='d-flex justify-content-between align-items-center py-3 border-bottom border-gray-300'>
              <div className='fs-6 text-gray-600'>Valor HH:</div>
              <div className='fs-6 fw-semibold text-gray-800'>{formatCurrency(data.step3.valorHH)}</div>
            </div>
            
            <div className='d-flex justify-content-between align-items-center py-3 border-bottom border-gray-300'>
              <div className='fs-6 text-gray-600'>Valor Viajes:</div>
              <div className='fs-6 fw-semibold text-gray-800'>{formatCurrency(data.step3.valorViaje)}</div>
            </div>
            
            <div className='d-flex justify-content-between align-items-center py-3 border-bottom border-gray-300'>
              <div className='fs-6 text-gray-600'>Valor Estudios:</div>
              <div className='fs-6 fw-semibold text-gray-800'>{formatCurrency(data.step3.valorEstudio)}</div>
            </div>
            
            <div className='d-flex justify-content-between align-items-center py-3 border-bottom border-gray-300'>
              <div className='fs-6 text-gray-600'>Gasto Reembolsable:</div>
              <div className='fs-6 fw-semibold text-gray-800'>{formatCurrency(data.step3.valorGastoReembolsable)}</div>
            </div>
            
            <div className='d-flex justify-content-between align-items-center py-3 border-top-2 border-primary'>
              <div className='fs-5 fw-bold text-gray-800'>Total:</div>
              <div className='fs-5 fw-bold text-success'>{formatCurrency(valorTotal)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step3 } 