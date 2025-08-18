import { ISubODSFormData } from '../../../interfaces/contratos-ods/SubODSFormData'
import { ODS } from '../../../interfaces/contratos-ods/ODS'

type Props = {
  data: ISubODSFormData
  updateData: (fieldsToUpdate: Partial<ISubODSFormData>) => void
  hasError: boolean
  selectedODSId?: number
  superODS: ODS[]
}

const Step1 = ({ data, updateData, hasError, selectedODSId, superODS }: Props) => {
  return (
    <div className='current' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='pb-10 pb-lg-15'>
          <h2 className='fw-bolder text-dark'>Información Básica del Servicio</h2>
          <div className='text-muted fw-bold fs-6'>
            Datos generales del servicio. Los campos marcados con * son obligatorios.
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
                <label className='form-label required'>Código de Servicio</label>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Ingrese el código del servicio'
                  value={data.step1.nombre}
                  onChange={(e) => updateData({ step1: { ...data.step1, nombre: e.target.value } })}
                />
              </div>
            </div>

            <div className='col-lg-6'>
              <div className='fv-row mb-10'>
                <label className='form-label required'>ODS Padre</label>
                <select
                  className='form-select form-select-lg form-select-solid'
                  value={data.step1.odsId ?? ''}
                  onChange={(e) => {
                    const newOdsId = e.target.value ? parseInt(e.target.value) : null;
                    updateData({ step1: { ...data.step1, odsId: newOdsId } });
                  }}
                  disabled={selectedODSId !== undefined && selectedODSId !== 0}
                >
                  {selectedODSId !== undefined && selectedODSId !== 0 ? (
                    <option value={selectedODSId}>
                      {superODS.find(sOds => sOds.id === selectedODSId)?.nombre || 'Cargando...'}
                    </option>
                  ) : (
                    <>
                      <option value="">Seleccione ODS Padre</option>
                      {superODS
                        .filter(sOds => sOds.tipoODS === 0 || sOds.tipoODS === 1)
                        .map((superOds) => (
                          <option key={superOds.id} value={superOds.id}>
                            {superOds.nombre}
                          </option>
                        ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-6'>
              <div className='fv-row mb-10'>
                <label className='form-label required'>Especialidad</label>
                <select
                  className='form-select form-select-lg form-select-solid'
                  value={data.step1.especialidad ?? ''}
                  onChange={(e) => updateData({ step1: { ...data.step1, especialidad: e.target.value ? parseInt(e.target.value) : null } })}
                >
                  <option value="">Seleccione especialidad</option>
                  <option value={0}>General</option>
                  <option value={1}>Automatización y Control</option>
                  <option value={2}>Eléctrica</option>
                  <option value={3}>Civil</option>
                  <option value={4}>Mecánica Rotativa</option>
                  <option value={5}>Límites Operativos</option>
                  <option value={6}>Líneas y Tanques</option>
                  <option value={7}>Contra Incendio</option>
                  <option value={8}>Procesos</option>
                  <option value={9}>Instrumentación y Medición</option>
                </select>
              </div>
            </div>

            <div className='col-lg-6'>
              <div className='fv-row mb-10'>
                <label className='form-label required'>Tipo de Servicio</label>
                <select
                  className='form-select form-select-lg form-select-solid'
                  value={data.step1.tipoODS}
                  onChange={(e) => updateData({ step1: { ...data.step1, tipoODS: parseInt(e.target.value) } })}
                >
                  <option value={2}>STI</option>
                  <option value={3}>MOC</option>
                  <option value={4}>TQ</option>
                  <option value={5}>STD</option>
                  <option value={6}>RSPA</option>
                  <option value={7}>ING</option>
                </select>
              </div>
            </div>
          </div>

          <div className='row'>
            <div className='col-lg-6'>
              <div className='fv-row mb-10'>
                <label className='form-label'>Recurso</label>
                <select
                  className='form-select form-select-lg form-select-solid'
                  value={data.step1.recurso ?? ''}
                  onChange={(e) => updateData({ step1: { ...data.step1, recurso: e.target.value ? parseInt(e.target.value) : null } })}
                >
                  <option value="">Seleccione recurso</option>
                  <option value={0}>ABANDONO</option>
                  <option value={1}>CAPEX - Mantenimiento</option>
                  <option value={2}>OPEX - Comercial</option>
                  <option value={3}>OPEX - Ingeniería</option>
                  <option value={4}>OPEX - Operaciones</option>
                  <option value={5}>OPEX - Integridad</option>
                  <option value={6}>OPEX - Bajas Emisiones</option>
                  <option value={7}>CAPEX - Proyectos</option>
                  <option value={8}>CAPEX - Planeación de Pry</option>
                </select>
              </div>
            </div>

            <div className='col-lg-6'>
              <div className='fv-row mb-10'>
                <label className='form-label'>Conexo a Obra</label>
                <select
                  className='form-select form-select-lg form-select-solid'
                  value={data.step1.conexoObra ? 'true' : 'false'}
                  onChange={(e) => updateData({ step1: { ...data.step1, conexoObra: e.target.value === 'true' } })}
                >
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step1 } 