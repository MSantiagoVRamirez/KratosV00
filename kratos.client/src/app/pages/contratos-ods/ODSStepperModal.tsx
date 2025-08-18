import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Modal } from 'react-bootstrap'
import { defaultODSFormData, IODSFormData } from '../../interfaces/contratos-ods/ODSFormData'
import { StepperComponent } from '../../../_metronic/assets/ts/components'
import { KTIcon } from '../../../_metronic/helpers'
import { Step1 } from './ods-stepper/Step1'
import { Step2 } from './ods-stepper/Step2'
import { Step3 } from './ods-stepper/Step3'
import { Step4 } from './ods-stepper/Step4'
import { Step5 } from './ods-stepper/Step5'
import { ODS } from '../../interfaces/contratos-ods/ODS'
import { Contrato } from '../../interfaces/contratos-ods/Contrato'
import { Empresa } from '../../interfaces/seguridad/Empresa'
import { Usuario } from '../../interfaces/seguridad/Usuario'
import { Planta } from '../../interfaces/contratos-ods/Planta'
import { Sistema } from '../../interfaces/contratos-ods/Sistema'

type Props = {
  show: boolean
  handleClose: () => void
  onSubmit: (ods: ODS) => void
  modalType: 'create' | 'edit'
  initialData?: ODS | null
  contratos: Contrato[]
  empresas: Empresa[]
  usuarios: Usuario[]
  plantas: Planta[]
  sistemas: Sistema[]
  selectedContratoId?: number
}

const modalsRoot = document.getElementById('root-modals') || document.body

const ODSStepperModal = ({ 
  show, 
  handleClose, 
  onSubmit, 
  modalType, 
  initialData, 
  contratos,
  empresas,
  usuarios,
  plantas,
  sistemas,
  selectedContratoId 
}: Props) => {
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const [stepper, setStepper] = useState<StepperComponent | null>(null)
  const [data, setData] = useState<IODSFormData>(defaultODSFormData)
  const [hasError, setHasError] = useState(false)

  // Llenar datos iniciales para edición
  useEffect(() => {
    if (modalType === 'edit' && initialData) {
      setData({
        step1: {
          numeroSeguimientoCenit: initialData.numeroSeguimientoCenit,
          numeroSeguimientoContratista: initialData.numeroSeguimientoContratista,
          descripcion: initialData.descripcion,
          tipoODS: initialData.tipoODS,
          complejidad: initialData.complejidad,
          contratoId: initialData.contratoId,
          contratista: initialData.contratista || ''
        },
        step2: {
          coordinadorODSId: initialData.coordinadorODSId,
          SyCcontratistaId: initialData.SyCcontratistaId,
          liderServicioId: initialData.liderServicioId,
          supervisorTecnicoId: initialData.supervisorTecnicoId,
          areaSupervisionTecnica: initialData.areaSupervisionTecnica,
          paqueteModular: initialData.paqueteModular
        },
        step3: {
          fechaInicio: initialData.fechaInicio,
          fechaFin: initialData.fechaFin ?? '',
          plazoEnDias: initialData.fechaInicio && initialData.fechaFin ? 
            Math.ceil((new Date(initialData.fechaFin).getTime() - new Date(initialData.fechaInicio).getTime()) / (1000 * 3600 * 24)) + 1 : null,
          conexoObra: initialData.conexoObra ?? false,
          listaPlanta: initialData.listaPlanta,
          listaSistema: initialData.listaSistema
        },
        step4: {
          valorHH: initialData.valorHH,
          valorViaje: initialData.valorViaje,
          valorEstudio: initialData.valorEstudio,
          valorGastoReembolsable: initialData.valorGastoReembolsable ?? 0
        }
      })
    } else {
      setData({
        ...defaultODSFormData,
        step1: {
          ...defaultODSFormData.step1,
          contratoId: selectedContratoId || 0
        }
      })
    }
  }, [modalType, initialData, selectedContratoId])

  // Asegurar que se muestre el Step 1 cuando el modal esté abierto y el stepper esté listo
  useEffect(() => {
    if (show && stepper) {
      setTimeout(() => {
        if ((stepper as any).refreshUI) {
          (stepper as any).refreshUI()
        }
        stepper.goto(1)
      }, 150)
    }
  }, [show, stepper])

  const loadStepper = () => {
    const stepperInstance = StepperComponent.createInsance(stepperRef.current as HTMLDivElement)
    if (stepperInstance) {
      setStepper(stepperInstance)
      
      setTimeout(() => {
        if ((stepperInstance as any).refreshUI) {
          (stepperInstance as any).refreshUI()
        }
        stepperInstance.goto(1)
      }, 100)
    } else {
      setStepper(stepperInstance)
    }
  }

  // Navegar directamente a un paso específico
  const goToStep = (stepIndex: number) => {
    if (!stepper) return
    stepper.goto(stepIndex)
  }

  const updateData = (fieldsToUpdate: Partial<IODSFormData>) => {
    const updatedData = { ...data, ...fieldsToUpdate }
    setData(updatedData)
  }

  // Validaciones por paso
  const checkStep1 = (): boolean => {
    if (!data.step1.numeroSeguimientoCenit || !data.step1.numeroSeguimientoContratista || !data.step1.descripcion || data.step1.complejidad === null || data.step1.contratoId === 0) {
      return false
    }
    return true
  }

  const checkStep2 = (): boolean => {
    if (data.step2.coordinadorODSId === null || data.step2.supervisorTecnicoId === null || 
        data.step2.areaSupervisionTecnica === null || data.step2.paqueteModular === null) {
      return false
    }
    // Validaciones adicionales para ODS de Agregación de Demanda
    if (data.step1.tipoODS === 1) {
      if (data.step2.SyCcontratistaId === null || data.step2.liderServicioId === null) {
        return false
      }
    }
    return true
  }

  const checkStep3 = (): boolean => {
    if (!data.step3.fechaInicio || !data.step3.fechaFin || data.step3.plazoEnDias === null || data.step3.plazoEnDias <= 0) {
      return false
    }
    // Validaciones adicionales para ODS Dedicada (estaciones y sistemas)
    if (data.step1.tipoODS === 0) {
      const hasPlanta = data.step3.listaPlanta && data.step3.listaPlanta.trim().length > 0
      const hasSistema = data.step3.listaSistema && data.step3.listaSistema.trim().length > 0
      if (!hasPlanta && !hasSistema) {
        return false
      }
    }
    return true
  }

  const checkStep4 = (): boolean => {
    if (data.step4.valorHH <= 0 || data.step4.valorViaje < 0 || data.step4.valorEstudio < 0 || data.step4.valorGastoReembolsable < 0) {
      return false
    }
    return true
  }

  const prevStep = () => {
    if (!stepper) {
      return
    }
    stepper.goPrev()
  }

  const nextStep = () => {
    setHasError(false)
    if (!stepper) {
      return
    }

    const currentStep = stepper.getCurrentStepIndex()

    // Validaciones por paso
    if (currentStep === 1) {
      if (!checkStep1()) {
        setHasError(true)
        return
      }
    }

    if (currentStep === 2) {
      if (!checkStep2()) {
        setHasError(true)
        return
      }
    }

    if (currentStep === 3) {
      if (!checkStep3()) {
        setHasError(true)
        return
      }
    }

    if (currentStep === 4) {
      if (!checkStep4()) {
        setHasError(true)
        return
      }
    }

    stepper.goNext()
  }

  const submit = () => {
    const contratistaId = contratos.find(c => c.id === data.step1.contratoId)?.empresaId
    const contratista = data.step1.contratista || (data.step1.contratoId ? empresas.find(e => e.id === contratistaId)?.nombre : '')
    // Convertir datos del formulario a formato ODS
    const odsData: ODS = {
      id: modalType === 'edit' && initialData ? initialData.id : 0,
      nombre: modalType === 'edit' && initialData ? initialData.nombre : 'ODS000', // Se asigna automáticamente en el backend
      numeroSeguimientoCenit: data.step1.numeroSeguimientoCenit,
      numeroSeguimientoContratista: data.step1.numeroSeguimientoContratista,
      descripcion: data.step1.descripcion,
      contratoId: data.step1.contratoId,
      contratista: contratista ?? '',
      tipoODS: data.step1.tipoODS,
      valorHH: data.step4.valorHH,
      valorViaje: data.step4.valorViaje,
      valorEstudio: data.step4.valorEstudio,
      valorSumaGlobalFija: data.step4.valorHH + data.step4.valorViaje + data.step4.valorEstudio,
      valorInicialHH: data.step4.valorHH,
      valorInicialViaje: data.step4.valorViaje,
      valorInicialEstudio: data.step4.valorEstudio,
      valorInicialSumaGlobalFija: data.step4.valorHH + data.step4.valorViaje + data.step4.valorEstudio,
      valorGastoReembolsable: data.step4.valorGastoReembolsable,
      porcentajeGastoReembolsable: data.step4.valorGastoReembolsable,
      valorDisponible: modalType === 'edit' && initialData ? initialData.valorDisponible : data.step4.valorHH + data.step4.valorViaje + data.step4.valorEstudio,
      valorHabilitado: modalType === 'edit' && initialData ? initialData.valorHabilitado : 0,
      valorPagado: modalType === 'edit' && initialData ? initialData.valorPagado : 0,
      valorFaltaPorPagar: modalType === 'edit' && initialData ? initialData.valorFaltaPorPagar : 0,
      fechaInicio: data.step3.fechaInicio,
      fechaFinalOriginal: data.step3.fechaFin,
      fechaFin: data.step3.fechaFin,
      fechaRealCierre: modalType === 'edit' && initialData ? initialData.fechaRealCierre : null,
      porcentajeRequerimientosCumplidos: modalType === 'edit' && initialData ? initialData.porcentajeRequerimientosCumplidos : null,
      porcentajeAccionesCumplidas: modalType === 'edit' && initialData ? initialData.porcentajeAccionesCumplidas : null,
      horasHombre: modalType === 'edit' && initialData ? initialData.horasHombre : null,
      estaAprobada: modalType === 'edit' && initialData ? initialData.estaAprobada : false,
      estaCancelada: modalType === 'edit' && initialData ? initialData.estaCancelada : false,
      estaSuspendida: modalType === 'edit' && initialData ? initialData.estaSuspendida : false,
      estaRechazada: modalType === 'edit' && initialData ? initialData.estaRechazada : false,
      comentarioAprobacion: modalType === 'edit' && initialData ? initialData.comentarioAprobacion : null,
      estado: modalType === 'edit' && initialData ? initialData.estado : 0, // Por defecto: Pendiente
      avance: modalType === 'edit' && initialData ? initialData.avance : 0,
      plantaSistema: data.step1.tipoODS === 0,
      listaPlanta: data.step3.listaPlanta,
      listaSistema: data.step3.listaSistema,
      conexoObra: data.step3.conexoObra,
      odsId: modalType === 'edit' && initialData ? initialData.odsId : null,
      liderServicioId: data.step2.liderServicioId,
      supervisorTecnicoId: data.step2.supervisorTecnicoId,
      coordinadorODSId: data.step2.coordinadorODSId || 0,
      SyCcontratistaId: data.step2.SyCcontratistaId,
      especialidad: modalType === 'edit' && initialData ? initialData.especialidad : null,
      recurso: modalType === 'edit' && initialData ? initialData.recurso : null,
      areaSupervisionTecnica: data.step2.areaSupervisionTecnica,
      complejidad: data.step1.complejidad,
      paqueteModular: data.step2.paqueteModular
    }

    onSubmit(odsData)
    handleClose()
  }

  const handleModalClose = () => {
    setData(defaultODSFormData)
    setHasError(false)
    handleClose()
  }

  // Filtrar usuarios por empresa
  const usuariosCenit = usuarios.filter(usuario => usuario.empresaId === 1)
  const usuariosContratista = usuarios.filter(usuario => {
    const contratoId = data.step1.contratoId || selectedContratoId || 0
    const contrato = contratos.find(c => c.id === contratoId)
    return usuario.empresaId === contrato?.empresaId
  })

  return createPortal(
    <Modal
      id='kt_modal_create_ods'
      tabIndex={-1}
      aria-hidden='true'
      dialogClassName='modal-dialog modal-dialog-centered modal-xl'
      show={show}
      onHide={handleModalClose}
      onEntered={loadStepper}
      backdrop={true}
      style={{ '--bs-modal-height': '80vh' } as React.CSSProperties}
    >
      <div className='modal-header'>
        <h2>{modalType === 'create' ? 'Crear Orden de Servicio' : 'Editar Orden de Servicio'}</h2>
        <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleModalClose}>
          <KTIcon className='fs-1' iconName='cross' />
        </div>
      </div>

      <div className='modal-body py-lg-5 px-lg-10' style={{ height: '70vh', overflow: 'hidden' }}>
        <div
          ref={stepperRef}
          className='stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid h-100'
          id='kt_modal_create_ods_stepper'
        >
          {/* Navegación del Stepper */}
          <div className='d-flex justify-content-center justify-content-xl-start flex-row-auto w-100 w-xl-300px flex-shrink-0'>
            <div className='stepper-nav ps-lg-10'>
              {/* Paso 1 */}
              <div className='stepper-item current' data-kt-stepper-element='nav' onClick={() => goToStep(1)} style={{ cursor: 'pointer' }}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>1</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Información Básica</h3>
                    <div className='stepper-desc'>Datos generales de la ODS</div>
                  </div>
                </div>
                <div className='stepper-line h-40px'></div>
              </div>

              {/* Paso 2 */}
              <div className='stepper-item' data-kt-stepper-element='nav' onClick={() => goToStep(2)} style={{ cursor: 'pointer' }}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>2</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Asignaciones</h3>
                    <div className='stepper-desc'>Personal responsable</div>
                  </div>
                </div>
                <div className='stepper-line h-40px'></div>
              </div>

              {/* Paso 3 */}
              <div className='stepper-item' data-kt-stepper-element='nav' onClick={() => goToStep(3)} style={{ cursor: 'pointer' }}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>3</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Fechas y Ubicación</h3>
                    <div className='stepper-desc'>Cronograma y estaciones</div>
                  </div>
                </div>
                <div className='stepper-line h-40px'></div>
              </div>

              {/* Paso 4 */}
              <div className='stepper-item' data-kt-stepper-element='nav' onClick={() => goToStep(4)} style={{ cursor: 'pointer' }}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>4</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Valores</h3>
                    <div className='stepper-desc'>Presupuesto y costos</div>
                  </div>
                </div>
                <div className='stepper-line h-40px'></div>
              </div>

              {/* Paso 5 */}
              <div className='stepper-item' data-kt-stepper-element='nav' onClick={() => goToStep(5)} style={{ cursor: 'pointer' }}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>5</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 className='stepper-title'>Revisión</h3>
                    <div className='stepper-desc'>Confirmar y enviar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido de los pasos */}
          <div className='flex-row-fluid py-lg-5 px-lg-15 d-flex flex-column'>
            <form noValidate id='kt_modal_create_ods_form' className='d-flex flex-column h-100'>
              <div className='flex-grow-1 overflow-auto' style={{ maxHeight: 'calc(70vh - 120px)' }}>
                <Step1 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                  isEditMode={modalType === 'edit'}
                  contratos={contratos}
                  empresas={empresas}
                  selectedContratoId={selectedContratoId}
                />
                <Step2 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                  usuariosCenit={usuariosCenit}
                  usuariosContratista={usuariosContratista}
                />
                <Step3 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                  plantas={plantas}
                  sistemas={sistemas}
                />
                <Step4 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                />
                <Step5 
                  data={data} 
                  contratos={contratos}
                  empresas={empresas}
                  usuarios={usuarios}
                />
              </div>

              {/* Botones de navegación */}
              <div className='d-flex flex-stack pt-5 flex-shrink-0 border-top'>
                <div className='me-2'>
                  <button
                    type='button'
                    className='btn btn-lg btn-light-primary me-3'
                    data-kt-stepper-action='previous'
                    onClick={prevStep}
                  >
                    <KTIcon iconName='arrow-left' className='fs-3 me-1' /> Anterior
                  </button>
                </div>
                <div>
                  <button
                    type='button'
                    className='btn btn-lg btn-primary'
                    data-kt-stepper-action='submit'
                    onClick={submit}
                  >
                    {modalType === 'create' ? 'Crear ODS' : 'Actualizar ODS'} 
                    <KTIcon iconName='arrow-right' className='fs-3 ms-2 me-0' />
                  </button>

                  <button
                    type='button'
                    className='btn btn-lg btn-primary'
                    data-kt-stepper-action='next'
                    onClick={nextStep}
                  >
                    Siguiente <KTIcon iconName='arrow-right' className='fs-3 ms-1 me-0' />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>,
    modalsRoot
  )
}

export { ODSStepperModal } 