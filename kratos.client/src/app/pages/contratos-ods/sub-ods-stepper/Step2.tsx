import { useEffect } from 'react'
import { ISubODSFormData } from '../../../interfaces/contratos-ods/SubODSFormData'
import { Planta } from '../../../interfaces/contratos-ods/Planta'
import { Sistema } from '../../../interfaces/contratos-ods/Sistema'
import { KTIcon } from '../../../../_metronic/helpers'

type Props = {
  data: ISubODSFormData
  updateData: (fieldsToUpdate: Partial<ISubODSFormData>) => void
  hasError: boolean
  plantas: Planta[]
  sistemas: Sistema[]
}

const Step2 = ({ data, updateData, hasError, plantas, sistemas }: Props) => {
  // Calcular plazo en días cuando cambian las fechas
  useEffect(() => {
    if (data.step2.fechaInicio && data.step2.fechaFin) {
      const inicio = new Date(data.step2.fechaInicio)
      const fin = new Date(data.step2.fechaFin)
      const diffTime = fin.getTime() - inicio.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      
      if (diffDays !== data.step2.plazoEnDias) {
        updateData({ 
          step2: { 
            ...data.step2, 
            plazoEnDias: diffDays > 0 ? diffDays : null 
          } 
        })
      }
    }
  }, [data.step2.fechaInicio, data.step2.fechaFin])

  return (
    <div className='current' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='pb-10 pb-lg-15'>
          <h2 className='fw-bolder text-dark'>Cronograma y Ubicación</h2>
          <div className='text-muted fw-bold fs-6'>
            Configure las fechas de ejecución y seleccione las estaciones y sistemas involucrados.
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

          <div className='fv-row mb-10'>
            <label className='form-label required'>Objeto/Descripción</label>
            <textarea
              className='form-control form-control-lg form-control-solid'
              rows={3}
              placeholder='Descripción detallada del servicio'
              value={data.step2.descripcion}
              onChange={(e) => updateData({ step2: { ...data.step2, descripcion: e.target.value } })}
            />
          </div>

          <div className='row'>
            <div className='col-lg-4'>
              <div className='fv-row mb-10'>
                <label className='form-label required'>Fecha de Asignación</label>
                <input
                  type='date'
                  className='form-control form-control-lg form-control-solid'
                  value={data.step2.fechaInicio ? new Date(data.step2.fechaInicio).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateData({ step2: { ...data.step2, fechaInicio: e.target.value } })}
                />
              </div>
            </div>

            <div className='col-lg-4'>
              <div className='fv-row mb-10'>
                <label className='form-label required'>Fecha de Finalización</label>
                <input
                  type='date'
                  className='form-control form-control-lg form-control-solid'
                  value={data.step2.fechaFin ? new Date(data.step2.fechaFin).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateData({ step2: { ...data.step2, fechaFin: e.target.value } })}
                />
              </div>
            </div>

            <div className='col-lg-4'>
              <div className='fv-row mb-10'>
                <label className='form-label'>Plazo (días)</label>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  value={data.step2.plazoEnDias ? `${data.step2.plazoEnDias} días` : ''}
                  disabled
                />
              </div>
            </div>
          </div>

          <div className='fv-row mb-10'>
            <label className='form-label'>Estaciones y Sistemas</label>
            <div className='text-muted fw-bold fs-7 mb-5'>
              Puede seleccionar estaciones y/o sistemas según las necesidades del servicio.
            </div>
            
            {/* Selector de Estaciones */}
            <div className='mb-5'>
              <label className='form-label fw-semibold fs-7 text-muted mb-2'>Estaciones</label>
              <select
                className='form-select form-select-lg form-select-solid'
                value={''}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  if (!selectedName) return;

                  const currentListString = data.step2.listaPlanta;
                  const currentListArray = currentListString ? currentListString.split(',').map(name => name.trim()) : [];

                  if (!currentListArray.includes(selectedName)) {
                    const newListArray = [...currentListArray, selectedName];
                    const concatenatedNames = newListArray.join(', ');
                    updateData({ step2: { ...data.step2, listaPlanta: concatenatedNames || null } });
                  }
                  e.target.value = '';
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
                const currentSelectedList = data.step2.listaPlanta;
                const selectedNamesArray = currentSelectedList ? currentSelectedList.split(',').map(name => name.trim()).filter(name => name) : [];

                if (selectedNamesArray.length > 0) {
                  return (
                    <div className='mt-3'>
                      <span className='fw-semibold fs-7 text-muted me-2'>
                        Estaciones seleccionadas:
                      </span>
                      <div className='mt-2'>
                        {selectedNamesArray.map((name, index) => (
                          <span key={index} className='badge badge-light-primary mb-1 me-2 p-2'>
                            {name}
                            <button
                              type='button'
                              className='btn btn-xs btn-icon btn-active-color-danger ms-2'
                              style={{ height: '20px', width: '20px' }}
                              onClick={() => {
                                const newListArray = selectedNamesArray.filter(n => n !== name);
                                const concatenatedNames = newListArray.join(', ');
                                updateData({ step2: { ...data.step2, listaPlanta: concatenatedNames || null } });
                              }}
                            >
                              <KTIcon iconName='cross' className='fs-7' />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Selector de Sistemas */}
            <div className='mb-5'>
              <label className='form-label fw-semibold fs-7 text-muted mb-2'>Sistemas</label>
              <select
                className='form-select form-select-lg form-select-solid'
                value={''}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  if (!selectedName) return;

                  const currentListString = data.step2.listaSistema;
                  const currentListArray = currentListString ? currentListString.split(',').map(name => name.trim()) : [];

                  if (!currentListArray.includes(selectedName)) {
                    const newListArray = [...currentListArray, selectedName];
                    const concatenatedNames = newListArray.join(', ');
                    updateData({ step2: { ...data.step2, listaSistema: concatenatedNames || null } });
                  }
                  e.target.value = '';
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
                const currentSelectedList = data.step2.listaSistema;
                const selectedNamesArray = currentSelectedList ? currentSelectedList.split(',').map(name => name.trim()).filter(name => name) : [];

                if (selectedNamesArray.length > 0) {
                  return (
                    <div className='mt-3'>
                      <span className='fw-semibold fs-7 text-muted me-2'>
                        Sistemas seleccionados:
                      </span>
                      <div className='mt-2'>
                        {selectedNamesArray.map((name, index) => (
                          <span key={index} className='badge badge-light-info mb-1 me-2 p-2'>
                            {name}
                            <button
                              type='button'
                              className='btn btn-xs btn-icon btn-active-color-danger ms-2'
                              style={{ height: '20px', width: '20px' }}
                              onClick={() => {
                                const newListArray = selectedNamesArray.filter(n => n !== name);
                                const concatenatedNames = newListArray.join(', ');
                                updateData({ step2: { ...data.step2, listaSistema: concatenatedNames || null } });
                              }}
                            >
                              <KTIcon iconName='cross' className='fs-7' />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step2 } 