import { FC } from 'react'
import { ITallerFormData } from '../../../interfaces/talleres-hallazgos/TallerFormData'
import { Empresa } from '../../../interfaces/seguridad/Empresa'
import { HitoPago } from '../../../interfaces/contratos-ods/HitoPago'
import { ODS } from '../../../interfaces/contratos-ods/ODS'

type Props = {
  data: ITallerFormData
  updateData: (fieldsToUpdate: Partial<ITallerFormData>) => void
  hasError: boolean
  empresas: Empresa[]
  hitosDePago: HitoPago[]
  ordenesServicio: ODS[]
}

const Step2: FC<Props> = ({ 
  data, 
  updateData, 
  hasError, 
  empresas,
  hitosDePago,
  ordenesServicio
}) => {
  const updateStep2 = (field: keyof ITallerFormData['step2'], value: string | number) => {
    updateData({
      step2: {
        ...data.step2,
        [field]: value
      }
    })
  }

  // Obtener el contratista de la ODS seleccionada
  const selectedODS = ordenesServicio.find(ods => ods.id === data.step1.odsId)
  const contratista = selectedODS?.contratista || ''
  const idContratista = empresas.find(empresa => empresa.nombre === contratista)?.id || 0

  // Filtrar empresas (sin Cenit)
  const empresasFiltradas = empresas.filter(empresa => empresa.id !== 1).sort((a, b) => a.nombre.localeCompare(b.nombre))

  // Filtrar hitos de pago por ODS
  const filteredHitosDePago = data.step1.odsId ? hitosDePago.filter(hito => hito.odsId === data.step1.odsId).sort((a, b) => a.numero.localeCompare(b.numero)) : hitosDePago.sort((a, b) => a.numero.localeCompare(b.numero))

  return (
    <div className='w-100' data-kt-stepper-element='content'>
      <div className='w-100'>
        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Consultor</label>
              <select
                className='form-select form-select-solid'
                value={idContratista}
                disabled
              >
                <option value={0}>Seleccione un consultor</option>
                {empresasFiltradas.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre}
                  </option>
                ))}
              </select>
              <div className='form-text'>Se asigna automáticamente según la ODS seleccionada</div>
            </div>
          </div>
          
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Hito de Pago</label>
              <select
                className={`form-select form-select-solid ${hasError && data.step2.hitoPagoId === 0 ? 'is-invalid' : ''}`}
                value={data.step2.hitoPagoId}
                onChange={(e) => updateStep2('hitoPagoId', parseInt(e.target.value))}
              >
                <option value={0}>Seleccione un hito de pago</option>
                {filteredHitosDePago.map((hito) => (
                  <option key={hito.id} value={hito.id}>
                    {hito.numero}
                  </option>
                ))}
              </select>
              {hasError && data.step2.hitoPagoId === 0 && (
                <div className='invalid-feedback'>El hito de pago es requerido</div>
              )}
            </div>
          </div>
        </div>

        <div className='row'>
          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Proyecto/Iniciativa</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step2.proyecto ? 'is-invalid' : ''}`}
                placeholder="Nombre del proyecto o iniciativa"
                value={data.step2.proyecto}
                onChange={(e) => updateStep2('proyecto', e.target.value)}
              />
              {hasError && !data.step2.proyecto && (
                <div className='invalid-feedback'>El proyecto es requerido</div>
              )}
            </div>
          </div>

          <div className='col-md-6'>
            <div className='fv-row mb-7'>
              <label className='form-label required fs-6 fw-semibold'>Líder de Proyecto</label>
              <input
                type="text"
                className={`form-control form-control-solid ${hasError && !data.step2.liderProyecto ? 'is-invalid' : ''}`}
                placeholder="Nombre del líder de proyecto"
                value={data.step2.liderProyecto}
                onChange={(e) => updateStep2('liderProyecto', e.target.value)}
              />
              {hasError && !data.step2.liderProyecto && (
                <div className='invalid-feedback'>El líder de proyecto es requerido</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Step2 } 