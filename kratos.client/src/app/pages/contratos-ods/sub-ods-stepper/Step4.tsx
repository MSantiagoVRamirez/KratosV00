import { ISubODSFormData } from '../../../interfaces/contratos-ods/SubODSFormData'
import { ODS } from '../../../interfaces/contratos-ods/ODS'

type Props = {
  data: ISubODSFormData
  superODS: ODS[]
}

const Step4 = ({ data, superODS }: Props) => {
  // Formatear el número a moneda
  const formatCurrency = (number: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Obtener datos de la ODS padre
  const odsPadre = superODS.find(ods => ods.id === data.step1.odsId);

  // Obtener nombres de especialidades
  const getEspecialidadName = (especialidad: number | null) => {
    const especialidades = [
      'General', 'Automatización y Control', 'Eléctrica', 'Civil', 
      'Mecánica Rotativa', 'Límites Operativos', 'Líneas y Tanques', 
      'Contra Incendio', 'Procesos', 'Instrumentación y Medición'
    ];
    return especialidad !== null ? especialidades[especialidad] : 'No especificada';
  };

  // Obtener nombres de tipos de servicio
  const getTipoServicioName = (tipoODS: number) => {
    const tipos = ['', '', 'STI', 'MOC', 'TQ', 'STD', 'RSPA', 'ING'];
    return tipos[tipoODS] || 'Desconocido';
  };

  // Obtener nombres de recursos
  const getRecursoName = (recurso: number | null) => {
    const recursos = [
      'ABANDONO', 'CAPEX - Mantenimiento', 'OPEX - Comercial', 
      'OPEX - Ingeniería', 'OPEX - Operaciones', 'OPEX - Integridad', 
      'OPEX - Bajas Emisiones', 'CAPEX - Proyectos', 'CAPEX - Planeación de Pry'
    ];
    return recurso !== null ? recursos[recurso] : 'No especificado';
  };

  const valorTotal = data.step3.valorHH + data.step3.valorViaje + data.step3.valorEstudio;
  const porcentajeGastoReembolsable = valorTotal > 0 ? 
    Math.round(data.step3.valorGastoReembolsable / valorTotal * 100) : 0;

  return (
    <div className='current' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='pb-10 pb-lg-15'>
          <h2 className='fw-bolder text-dark'>Revisión y Confirmación</h2>
          <div className='text-muted fw-bold fs-6'>
            Revise toda la información antes de crear el servicio. Puede volver a los pasos anteriores para hacer cambios.
          </div>
        </div>

        <div className='fv-row'>
          {/* Información Básica */}
          <div className='d-flex flex-column mb-10'>
            <div className='fs-4 fw-bold text-dark mb-5'>1. Información Básica</div>
            <div className='bg-light-primary rounded p-6'>
              <div className='row'>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Código de Servicio:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{data.step1.nombre || 'No especificado'}</div>
                  </div>
                </div>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>ODS Padre:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{odsPadre?.nombre || 'No especificada'}</div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Especialidad:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{getEspecialidadName(data.step1.especialidad)}</div>
                  </div>
                </div>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Tipo de Servicio:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{getTipoServicioName(data.step1.tipoODS)}</div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Recurso:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{getRecursoName(data.step1.recurso)}</div>
                  </div>
                </div>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Conexo a Obra:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{data.step1.conexoObra ? 'Sí' : 'No'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cronograma y Ubicación */}
          <div className='d-flex flex-column mb-10'>
            <div className='fs-4 fw-bold text-dark mb-5'>2. Cronograma y Ubicación</div>
            <div className='bg-light-info rounded p-6'>
              <div className='row'>
                <div className='col-lg-12'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Descripción:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{data.step2.descripcion || 'No especificada'}</div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-lg-4'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Fecha de Asignación:</div>
                    <div className='fs-6 fw-bold text-gray-800'>
                      {data.step2.fechaInicio ? new Date(data.step2.fechaInicio).toLocaleDateString('es-CO') : 'No especificada'}
                    </div>
                  </div>
                </div>
                <div className='col-lg-4'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Fecha de Finalización:</div>
                    <div className='fs-6 fw-bold text-gray-800'>
                      {data.step2.fechaFin ? new Date(data.step2.fechaFin).toLocaleDateString('es-CO') : 'No especificada'}
                    </div>
                  </div>
                </div>
                <div className='col-lg-4'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Plazo:</div>
                    <div className='fs-6 fw-bold text-gray-800'>
                      {data.step2.plazoEnDias ? `${data.step2.plazoEnDias} días` : 'No calculado'}
                    </div>
                  </div>
                </div>
              </div>
              {(data.step2.listaPlanta || data.step2.listaSistema) && (
                <div className='row'>
                  <div className='col-lg-6'>
                    <div className='d-flex flex-column mb-5'>
                      <div className='fs-6 fw-semibold text-gray-600'>Estaciones:</div>
                      <div className='fs-6 fw-bold text-gray-800'>{data.step2.listaPlanta || 'Ninguna'}</div>
                    </div>
                  </div>
                  <div className='col-lg-6'>
                    <div className='d-flex flex-column mb-5'>
                      <div className='fs-6 fw-semibold text-gray-600'>Sistemas:</div>
                      <div className='fs-6 fw-bold text-gray-800'>{data.step2.listaSistema || 'Ninguno'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Valores y Presupuesto */}
          <div className='d-flex flex-column mb-10'>
            <div className='fs-4 fw-bold text-dark mb-5'>3. Valores y Presupuesto</div>
            <div className='bg-light-success rounded p-6'>
              <div className='row'>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Valor HH:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{formatCurrency(data.step3.valorHH)}</div>
                  </div>
                </div>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Valor Viajes:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{formatCurrency(data.step3.valorViaje)}</div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Valor Estudios:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{formatCurrency(data.step3.valorEstudio)}</div>
                  </div>
                </div>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column mb-5'>
                    <div className='fs-6 fw-semibold text-gray-600'>Gasto Reembolsable:</div>
                    <div className='fs-6 fw-bold text-gray-800'>{formatCurrency(data.step3.valorGastoReembolsable)}</div>
                  </div>
                </div>
              </div>
              
              <div className='separator separator-dashed my-6'></div>
              
              <div className='row'>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column'>
                    <div className='fs-5 fw-bold text-gray-800 mb-2'>Valor Total del Servicio</div>
                    <div className='fs-2 fw-bolder text-success'>
                      {formatCurrency(valorTotal)}
                    </div>
                  </div>
                </div>
                <div className='col-lg-6'>
                  <div className='d-flex flex-column'>
                    <div className='fs-5 fw-bold text-gray-800 mb-2'>Porcentaje Gasto Reembolsable</div>
                    <div className='fs-2 fw-bolder text-primary'>
                      {porcentajeGastoReembolsable}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nota final */}
          <div className='notice d-flex bg-light-warning rounded border-warning border border-dashed p-6'>
            <div className='d-flex flex-stack flex-grow-1'>
              <div className='fw-bold'>
                <div className='fs-6 text-gray-600'>
                  Al hacer clic en "Crear Servicio", se guardará toda la información del servicio y se agregará al sistema.
                  Asegúrese de que todos los datos sean correctos antes de continuar.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step4 } 