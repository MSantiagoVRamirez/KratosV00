import { FC, useEffect } from 'react'
import { IODSFormData } from '../../../interfaces/contratos-ods/ODSFormData'
import { Planta } from '../../../interfaces/contratos-ods/Planta'
import { Sistema } from '../../../interfaces/contratos-ods/Sistema'
import { KTIcon } from '../../../../_metronic/helpers'

type Props = {
  data: IODSFormData
  updateData: (fieldsToUpdate: Partial<IODSFormData>) => void
  hasError: boolean
  plantas: Planta[]
  sistemas: Sistema[]
}

const Step3: FC<Props> = ({ 
  data, 
  updateData, 
  hasError,
  plantas,
  sistemas
}) => {
  const updateStep3 = (field: keyof IODSFormData['step3'], value: string | number | boolean | null) => {
    updateData({
      step3: {
        ...data.step3,
        [field]: value
      }
    })
  }

  // Calcular fecha fin cuando cambia fecha inicio o plazo
  useEffect(() => {
    if (data.step3.fechaInicio && data.step3.plazoEnDias !== null && data.step3.plazoEnDias > 0) {
      const parts = data.step3.fechaInicio.split('-')
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1 // Meses son 0-indexados en Date
        const day = parseInt(parts[2], 10)

        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const fechaInicioObj = new Date(Date.UTC(year, month, day))
          // Sumar (plazoEnDias - 1) porque un plazo de 1 día significa que termina el mismo día.
          fechaInicioObj.setUTCDate(fechaInicioObj.getUTCDate() + (data.step3.plazoEnDias - 1))
          updateStep3('fechaFin', fechaInicioObj.toISOString().split('T')[0])
        }
      }
    } else if (data.step3.fechaInicio && (data.step3.plazoEnDias === null || data.step3.plazoEnDias <= 0)) {
      updateStep3('fechaFin', '')
    } else if (!data.step3.fechaInicio) {
      updateStep3('fechaFin', '')
    }
  }, [data.step3.fechaInicio, data.step3.plazoEnDias])

  // Validación para estaciones y sistemas en ODS Dedicada
  const isPlantasSistemasValid = () => {
    if (data.step1.tipoODS !== 0) return true // Solo validar para ODS Dedicada
    const hasPlanta = data.step3.listaPlanta && data.step3.listaPlanta.trim().length > 0
    const hasSistema = data.step3.listaSistema && data.step3.listaSistema.trim().length > 0
    return hasPlanta || hasSistema
  }

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='row'>
          <div className='col-md-4'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Plazo de Ejecución (días)</label>
              <input
                type="number"
                className={`form-control form-control-solid ${hasError && (data.step3.plazoEnDias === null || data.step3.plazoEnDias <= 0) ? 'is-invalid' : ''}`}
                placeholder="Plazo en días"
                value={data.step3.plazoEnDias ?? ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    updateStep3('plazoEnDias', null)
                  } else {
                    const numValue = parseInt(value, 10)
                    if (!isNaN(numValue) && numValue >= 1) {
                      updateStep3('plazoEnDias', numValue)
                    }
                  }
                }}
                min="1"
              />
              {hasError && (data.step3.plazoEnDias === null || data.step3.plazoEnDias <= 0) && (
                <div className='invalid-feedback'>El plazo de ejecución es requerido</div>
              )}
            </div>
          </div>
          
          <div className='col-md-4'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Fecha Inicio</label>
              <input
                type="date"
                className={`form-control form-control-solid ${hasError && !data.step3.fechaInicio ? 'is-invalid' : ''}`}
                value={data.step3.fechaInicio ? data.step3.fechaInicio.split('T')[0] : ''}
                onChange={(e) => updateStep3('fechaInicio', e.target.value)}
              />
              {hasError && !data.step3.fechaInicio && (
                <div className='invalid-feedback'>La fecha de inicio es requerida</div>
              )}
            </div>
          </div>

          <div className='col-md-4'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Fecha Fin</label>
              <input
                type="date"
                className={`form-control form-control-solid ${hasError && !data.step3.fechaFin ? 'is-invalid' : ''}`}
                value={data.step3.fechaFin ? data.step3.fechaFin.split('T')[0] : ''}
                disabled={true}
              />
              {hasError && !data.step3.fechaFin && (
                <div className='invalid-feedback'>La fecha de fin es requerida</div>
              )}
            </div>
          </div>
        </div>

        {data.step1.tipoODS === 0 && (
          <>
            <div className='row'>
              <div className='col-md-12'>
                <div className='fv-row mb-7'>
                  <label className='form-label fs-6 fw-semibold'>Conexo a Obra</label>
                  <select
                    className="form-select form-select-solid"
                    value={data.step3.conexoObra ? 'true' : 'false'}
                    onChange={(e) => updateStep3('conexoObra', e.target.value === 'true')}
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                </div>
              </div>
            </div>

            <div className='row'>
              <div className='col-md-12'>
                <div className={`fv-row mb-7 ${hasError && !isPlantasSistemasValid() ? 'has-error' : ''}`}>
                  <label className='form-label required fs-6 fw-semibold'>Estaciones y Sistemas</label>
                  <div className='form-text text-muted mb-2'>
                    Debe seleccionar al menos una estación o sistema para la ODS Dedicada.
                  </div>
                  {hasError && !isPlantasSistemasValid() && (
                    <div className='alert alert-warning py-2 mb-3'>
                      <strong>Atención:</strong> Debe seleccionar al menos una estación o sistema.
                    </div>
                  )}
                  
                  {/* Selector de Estaciones */}
                  <div className='mb-3'>
                    <label className='form-label fw-semibold fs-7 text-muted mb-2'>Estaciones</label>
                    <select
                      className="form-select form-select-solid"
                      onChange={(e) => {
                        const selectedName = e.target.value
                        if (!selectedName) return

                        const currentListString = data.step3.listaPlanta
                        const currentListArray = currentListString ? currentListString.split(',').map(name => name.trim()) : []

                        if (!currentListArray.includes(selectedName)) {
                          const newListArray = [...currentListArray, selectedName]
                          const concatenatedNames = newListArray.join(', ')
                          updateStep3('listaPlanta', concatenatedNames || null)
                        }
                        e.target.selectedIndex = 0
                      }}
                    >
                      <option value="">Seleccionar estación para añadir...</option>
                      {plantas.map((planta) => (
                        <option key={planta.id} value={planta.nombre}>
                          {planta.nombre}
                        </option>
                      ))}
                    </select>
                    {(() => {
                      const currentSelectedList = data.step3.listaPlanta
                      const selectedNamesArray = currentSelectedList ? currentSelectedList.split(',').map(name => name.trim()).filter(name => name) : []

                      if (selectedNamesArray.length > 0) {
                        return (
                          <div className='mt-2'>
                            <span className='fw-semibold fs-7 text-muted me-2'>
                              Estaciones seleccionadas:
                            </span>
                            <div className='mt-1'>
                              {selectedNamesArray.map((name, index) => (
                                <span key={index} className='badge badge-light-primary mb-1 me-1 p-2'>
                                  {name}
                                  <button
                                    type="button"
                                    className='btn btn-xs btn-icon btn-active-color-danger ms-2'
                                    style={{ height: '20px', width: '20px' }}
                                    onClick={() => {
                                      const newListArray = selectedNamesArray.filter(n => n !== name)
                                      const concatenatedNames = newListArray.join(', ')
                                      updateStep3('listaPlanta', concatenatedNames || null)
                                    }}
                                  >
                                    <KTIcon iconName='cross' className='fs-7' />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>

                  {/* Selector de Sistemas */}
                  <div className='mb-3'>
                    <label className='form-label fw-semibold fs-7 text-muted mb-2'>Sistemas</label>
                    <select
                      className="form-select form-select-solid"
                      onChange={(e) => {
                        const selectedName = e.target.value
                        if (!selectedName) return

                        const currentListString = data.step3.listaSistema
                        const currentListArray = currentListString ? currentListString.split(',').map(name => name.trim()) : []

                        if (!currentListArray.includes(selectedName)) {
                          const newListArray = [...currentListArray, selectedName]
                          const concatenatedNames = newListArray.join(', ')
                          updateStep3('listaSistema', concatenatedNames || null)
                        }
                        e.target.selectedIndex = 0
                      }}
                    >
                      <option value="">Seleccionar sistema para añadir...</option>
                      {sistemas.map((sistema) => (
                        <option key={sistema.id} value={sistema.nombre}>
                          {sistema.nombre}
                        </option>
                      ))}
                    </select>
                    {(() => {
                      const currentSelectedList = data.step3.listaSistema
                      const selectedNamesArray = currentSelectedList ? currentSelectedList.split(',').map(name => name.trim()).filter(name => name) : []

                      if (selectedNamesArray.length > 0) {
                        return (
                          <div className='mt-2'>
                            <span className='fw-semibold fs-7 text-muted me-2'>
                              Sistemas seleccionados:
                            </span>
                            <div className='mt-1'>
                              {selectedNamesArray.map((name, index) => (
                                <span key={index} className='badge badge-light-info mb-1 me-1 p-2'>
                                  {name}
                                  <button
                                    type="button"
                                    className='btn btn-xs btn-icon btn-active-color-danger ms-2'
                                    style={{ height: '20px', width: '20px' }}
                                    onClick={() => {
                                      const newListArray = selectedNamesArray.filter(n => n !== name)
                                      const concatenatedNames = newListArray.join(', ')
                                      updateStep3('listaSistema', concatenatedNames || null)
                                    }}
                                  >
                                    <KTIcon iconName='cross' className='fs-7' />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export { Step3 } 