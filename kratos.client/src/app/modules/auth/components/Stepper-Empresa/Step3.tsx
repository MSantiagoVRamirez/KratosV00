import { FC } from 'react'
import { EmpresaDataForm } from '../../../../interfaces/Configuracion/EmpresaDataForm'
import { ActividadEconomica } from '../../../../interfaces/Configuracion/ActividadEconomica'
import { RegimenTributario } from '../../../../interfaces/Configuracion/RegimenTributario'
import { TipoSociedad } from '../../../../interfaces/Configuracion/TipoSociedad'

type Props = {
  data: EmpresaDataForm
  updateData: (fieldsToUpdate: Partial<EmpresaDataForm>) => void
  hasError: boolean
  isEditMode: boolean
  actividadEconimica: ActividadEconomica[]
  regimenTributario: RegimenTributario[]
  tipoSociedad: TipoSociedad[]
}

export const Step3: FC<Props> = ({
  data,
  updateData,
  hasError,
  actividadEconimica = [],
  regimenTributario = [],
  tipoSociedad = [],
}) => {
  const updateStep3 = (field: keyof EmpresaDataForm['step3'], value: string | number | null) => {
    updateData({
      step3: {
        ...data.step3,
        [field]: value,
      },
    })
  }

  const toNumberOrNull = (v: string) => {
    const n = Number(v)
    return Number.isFinite(n) && n > 0 ? n : null // 0 o NaN => null
  }

  const sortByNombre = <T extends { nombre?: string }>(arr: T[]) =>
    [...arr].sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? ''))

  return (
    <div className="w-100" data-kt-stepper-element="content">
      <div style={{ marginLeft: '7%', marginTop: '2%' }}>
        <div className="w-100 user-card" style={{ padding: '1rem' }}>
          <div className="row">
            {/* Tipo de Sociedad */}
            <div className="col-md-12">
              <div className="fv-row mb-7">
                <label style={{color: 'rgb(18, 30, 130)'}} className=" required fs-6 fw-semibold">Tipo Sociedad</label>
                <select
                  className={`form-select form-select-solid ${hasError && !data.step3.tiposociedadId ? 'is-invalid' : ''}`}
                  value={data.step3.tiposociedadId ?? 0}
                  onChange={(e) => updateStep3('tiposociedadId', toNumberOrNull(e.target.value))}
                  required
                >
                  <option value={0} disabled>Seleccione Tipo de Sociedad</option>
                  {sortByNombre(tipoSociedad).map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
                {hasError && !data.step3.tiposociedadId && (
                  <div className="invalid-feedback">El tipo de sociedad es requerido</div>
                )}
              </div>
            </div>

            {/* Actividad Económica */}
            <div className="col-md-12">
              <div className="fv-row mb-7">
                <label style={{color: 'rgb(18, 30, 130)'}}  className=" required fs-6 fw-semibold">Actividad Económica</label>
                <select
                  className={`form-select form-select-solid ${hasError && !data.step3.actividadId ? 'is-invalid' : ''}`}
                  value={data.step3.actividadId ?? 0}
                  onChange={(e) => updateStep3('actividadId', toNumberOrNull(e.target.value))}
                  required
                >
                  <option value={0} disabled>Seleccione Actividad Económica</option>
                  {sortByNombre(actividadEconimica).map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
                {hasError && !data.step3.actividadId && (
                  <div className="invalid-feedback">La actividad económica es requerida</div>
                )}
              </div>
            </div>
          </div>

          {/* Régimen Tributario */}
          <div className="row">
            <div className="col-md-12">
              <div className="fv-row mb-7">
                <label style={{color: 'rgb(18, 30, 130)'}} className="required fs-6 fw-semibold">Régimen Tributario</label>
                <select
                  className={`form-select form-select-solid ${hasError && !data.step3.regimenId ? 'is-invalid' : ''}`}
                  value={data.step3.regimenId ?? 0}
                  onChange={(e) => updateStep3('regimenId', toNumberOrNull(e.target.value))}
                  required
                >
                  <option value={0} disabled>Seleccione Régimen Tributario</option>
                  {sortByNombre(regimenTributario).map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
                {hasError && !data.step3.regimenId && (
                  <div className="invalid-feedback">El régimen tributario es requerido</div>
                )}
              </div>
            </div>
          </div>

          {/* Textos */}
          <div className="row">
            <div className="col-md-12">
              <div className="fv-row mb-7">
                <label style={{color: 'rgb(18, 30, 130)'}} className=" required fs-6 fw-semibold">Razón Social</label>
                <input
                  type="text"
                  className={`form-control form-control-solid ${hasError && !data.step3.razonSocial ? 'is-invalid' : ''}`}
                  placeholder="Razón Social"
                  value={data.step3.razonSocial ?? ''}
                  onChange={(e) => updateStep3('razonSocial', e.target.value)}
                  required
                />
                {hasError && !data.step3.razonSocial && (
                  <div className="invalid-feedback">La razón social es requerida</div>
                )}
              </div>
            </div>

            <div className="col-md-12">
              <div className="fv-row mb-7">
                <label style={{color: 'rgb(18, 30, 130)'}} className=" required fs-6 fw-semibold">Nombre Comercial</label>
                <input
                  type="text"
                  className={`form-control form-control-solid ${hasError && !data.step3.nombreComercial ? 'is-invalid' : ''}`}
                  placeholder="Nombre Comercial"
                  value={data.step3.nombreComercial ?? ''}
                  onChange={(e) => updateStep3('nombreComercial', e.target.value)}
                  required
                />
                {hasError && !data.step3.nombreComercial && (
                  <div className="invalid-feedback">El nombre comercial es requerido</div>
                )}
              </div>
            </div>
          </div>

          {/* NIT / DV */}
          <div className="row">
            <div className="col-md-12">
              <div className="fv-row mb-7">
                <label style={{color: 'rgb(18, 30, 130)'}} className=" required fs-6 fw-semibold">NIT</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-control form-control-solid ${hasError && !data.step3.nit ? 'is-invalid' : ''}`}
                  placeholder="NIT"
                  value={data.step3.nit ?? ''}
                  onChange={(e) => updateStep3('nit', e.target.value)}
                  required
                />
                {hasError && !data.step3.nit && (
                  <div className="invalid-feedback">El NIT es requerido</div>
                )}
              </div>
            </div>

            <div className="col-md-12">
              <div className="fv-row mb-7">
                <label style={{color: 'rgb(18, 30, 130)'}} className=" required fs-6 fw-semibold">DV</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`form-control form-control-solid ${hasError && !data.step3.dv ? 'is-invalid' : ''}`}
                  placeholder="DV"
                  value={data.step3.dv ?? ''}
                  onChange={(e) => updateStep3('dv', e.target.value)}
                  required
                />
                {hasError && !data.step3.dv && (
                  <div className="invalid-feedback">El DV es requerido</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
