import { FC } from 'react'
import { IContratoFormData } from '../../../interfaces/contratos-ods/ContratoFormData'

type Props = {
  data: IContratoFormData
  updateData: (fieldsToUpdate: Partial<IContratoFormData>) => void
  hasError: boolean
}

const Step4: FC<Props> = ({ data, updateData, hasError }) => {
  const updateStep4 = (field: keyof IContratoFormData['step4'], value: number) => {
    updateData({
      step4: {
        ...data.step4,
        [field]: value
      }
    })
  }

  // Formatear el número a moneda
  const formatCurrency = (number: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Manejar el cambio de valor en el input de moneda
  const handleChangeCostoDirecto = (rawInput: string) => {
    const numericValue = parseInt(rawInput.replace(/[^0-9]/g, ''), 10);
    updateStep4('valorCostoDirecto', isNaN(numericValue) ? 0 : numericValue);
  };

  const handleChangeGastosReembolsables = (rawInput: string) => {
    const numericValue = parseInt(rawInput.replace(/[^0-9]/g, ''), 10);
    updateStep4('valorGastosReembolsables', isNaN(numericValue) ? 0 : numericValue);
  };

  // Calcular valor total
  const calcularValorTotal = () => {
    return data.step4.valorCostoDirecto + data.step4.valorGastosReembolsables;
  };

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      {/* <div className='text-center mb-10'>
        <h2 className='text-dark mb-3'>Valores Monetarios</h2>
        <div className='text-gray-400 fw-semibold fs-5'>
          Defina los valores del contrato en pesos colombianos
        </div>
      </div> */}
      
      <div className='w-100'>

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Valor Costo Directo</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`form-control form-control-solid ${hasError && data.step4.valorCostoDirecto <= 0 ? 'is-invalid' : ''}`}
                placeholder="Valor del costo directo (COP)"
                value={formatCurrency(data.step4.valorCostoDirecto)}
                onChange={(e) => handleChangeCostoDirecto(e.target.value)}
              />
              {hasError && data.step4.valorCostoDirecto <= 0 && (
                <div className='invalid-feedback'>El valor de costo directo es requerido</div>
              )}
            </div>
          </div>

          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Valor Gastos Reembolsables</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className={`form-control form-control-solid ${hasError && data.step4.valorGastosReembolsables < 0 ? 'is-invalid' : ''}`}
                placeholder="Valor de gastos reembolsables (COP)"
                value={formatCurrency(data.step4.valorGastosReembolsables)}
                onChange={(e) => handleChangeGastosReembolsables(e.target.value)}
              />
              {hasError && data.step4.valorGastosReembolsables < 0 && (
                <div className='invalid-feedback'>El valor no puede ser negativo</div>
              )}
            </div>
          </div>
        </div>

        <div className='fv-row mb-7'>
          <label className='form-label fs-6 fw-semibold'>Valor Costo Directo más Gastos Reembolsables</label>
          <div className='d-flex align-items-center'>
            <div className='bg-light-success rounded p-4 flex-grow-1 text-center'>
              <div className='text-success fw-bold fs-2'>{formatCurrency(calcularValorTotal())}</div>
              {/* <div className='text-gray-400 fw-semibold'>Valor Costo Directo más Gastos Reembolsables</div> */}
            </div>
          </div>
        </div>

        {calcularValorTotal() > 0 && (
          <div className='notice d-flex bg-light-primary rounded border-primary border border-dashed p-6'>
            <div className='d-flex flex-stack flex-grow-1'>
              <div className='fw-semibold'>
                <h4 className='text-gray-900 fw-bold'>Resumen de Valores</h4>
                <div className='fs-6 text-gray-700'>
                  <div>Costo Directo: <span className='fw-bold'>{formatCurrency(data.step4.valorCostoDirecto)}</span></div>
                  <div>Gastos Reembolsables: <span className='fw-bold'>{formatCurrency(data.step4.valorGastosReembolsables)}</span></div>
                  <div className='separator separator-dashed my-2'></div>
                  <div>Total: <span className='fw-bold text-primary'>{formatCurrency(calcularValorTotal())}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { Step4 } 