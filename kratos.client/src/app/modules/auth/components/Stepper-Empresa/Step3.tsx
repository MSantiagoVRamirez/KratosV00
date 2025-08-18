import { FC } from 'react'
import { EmpresaDataForm } from '../../../../interfaces/Configuracion/EmpresaDataForm';
import {ActividadEconomica } from '../../../../interfaces/Configuracion/ActividadEconomica';
import { RegimenTributario } from '../../../../interfaces/Configuracion/RegimenTributario';
import { TipoSociedad} from '../../../../interfaces/Configuracion/TipoSociedad';
type Props = {
  data: EmpresaDataForm
  updateData: (fieldsToUpdate: Partial<EmpresaDataForm>) => void
  hasError: boolean
  isEditMode: boolean
  actividadEconimica: ActividadEconomica[]
  regimenTributario: RegimenTributario[]
  tipoSociedad: TipoSociedad[]
}
const Step3: FC<Props> = ({ 
  data, 
  updateData, 
  hasError,
  actividadEconimica,
  regimenTributario,
  tipoSociedad
}) => {
  const updateStep3 = (field: keyof EmpresaDataForm['step3'], value: string | number | null) => {
    updateData({
      step3: {
        ...data.step3,
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
              <label className='form-label required fs-6 fw-semibold'>Tipo Sociedad</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step3.tiposociedadId === null ? 'is-invalid' : ''}`}
                value={data.step3.tiposociedadId ?? ''}
                onChange={(e) => updateStep3('tiposociedadId', parseInt(e.target.value) || null)}
              >
                <option value="">Seleccione Tipo de Sociedadr</option>
                {tipoSociedad.sort((a, b ) => `${a.nombre}`.localeCompare(`${b.nombre}`)).map((tipoSociedad) => (
                  <option key={tipoSociedad.id} value={tipoSociedad.id}>
                    {tipoSociedad.nombre}
                  </option>
                ))}
              </select>
              {hasError && data.step3.tiposociedadId === null && (
                <div className='invalid-feedback'>El tipo de Sociedad es Requerido</div>
              )}
            </div>
          </div>
          
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Actividad Economica</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step3.actividadId === null ? 'is-invalid' : ''}`}
                value={data.step3.actividadId ?? ''}
                onChange={(e) => updateStep3('actividadId', parseInt(e.target.value) || null)}
              >
                <option value="">Seleccione Actividad Economica</option>
                {actividadEconimica.map((actividad) => (
                  <option key={actividad.id} value={actividad.id}> 
                    {actividad.nombre}
                  </option>
                ))}
              </select>
              {hasError && data.step3.actividadId === null && (
                <div className='invalid-feedback'>La Actividad Economica es Requerida</div>
              )}
            </div>
          </div>
        </div>
        <div className='row'>
            <div className='col-md-6'>
             <div className='fv-row mb-7'>
                <label className='form-label required fs-6 fw-semibold'>Regimen Tributario</label>
                <select
                    className={`form-select form-select-solid ${hasError && data.step3.regimenId === null ? 'is-invalid' : ''}`}
                    value={data.step3.regimenId ?? ''}
                    onChange={(e) => updateStep3('regimenId', parseInt(e.target.value) || null)}
                >
                    <option value="">Seleccione Regimen Tributario</option>
                    {regimenTributario.map((regimen) => (
                    <option key={regimen.id} value={regimen.id}>
                        {regimen.nombre}
                    </option>
                    ))}
                </select>
                {hasError && data.step3.regimenId === null && (
                    <div className='invalid-feedback'>El RegimenTributario Es Requerido</div>
                )}
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Razon Social</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step3.razonSocial ? 'is-invalid' : ''}`}
                placeholder="Razon Social"
                value={data.step3.razonSocial}
                onChange={(e) => updateStep3('razonSocial', e.target.value)}
              />
              {hasError && !data.step3.razonSocial && (
                <div className='invalid-feedback'>La Razon social es Requerida</div>
              )}
            </div>
          </div>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Nombre Comercial</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step3.nombreComercial ? 'is-invalid' : ''}`}
                placeholder="Nombre Comercial"
                value={data.step3.nombreComercial}
                onChange={(e) => updateStep3('nombreComercial', e.target.value)}
              />
              {hasError && !data.step3.nombreComercial && (
                <div className='invalid-feedback'>El nombre comercial es Requerido</div>
              )}
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>NIT</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step3.nit ? 'is-invalid' : ''}`}
                placeholder="nit"
                value={data.step3.nit}
                onChange={(e) => updateStep3('nit', e.target.value)}
              />
              {hasError && !data.step3.nit && (
                <div className='invalid-feedback'>El NIT es Requerido</div>
              )}
            </div>
          </div>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>DV</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step3.dv ? 'is-invalid' : ''}`}
                placeholder="dv"
                value={data.step3.dv}
                onChange={(e) => updateStep3('dv', e.target.value)}
              />
              {hasError && !data.step3.dv && (
                <div className='invalid-feedback'>El DV es requerido</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export { Step3 }