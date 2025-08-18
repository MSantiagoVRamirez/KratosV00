import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Modal } from 'react-bootstrap'
import { defaultContratoFormData, IContratoFormData } from '../../interfaces/contratos-ods/ContratoFormData'
import { StepperComponent } from '../../../_metronic/assets/ts/components'
import { KTIcon } from '../../../_metronic/helpers'
import { Step1 } from './stepper/Step1'
import { Step2 } from './stepper/Step2'
import { Step3 } from './stepper/Step3'
import { Step4 } from './stepper/Step4'
import { Step5 } from './stepper/Step5'
import { Contrato } from '../../interfaces/contratos-ods/Contrato'
import { Empresa } from '../../interfaces/seguridad/Empresa'
import { Usuario } from '../../interfaces/seguridad/Usuario'

type Props = {
  show: boolean
  handleClose: () => void
  onSubmit: (contrato: Contrato) => void
  modalType: 'create' | 'edit'
  initialData?: Contrato | null
  empresas: Empresa[]
  usuarios: Usuario[]
}

const modalsRoot = document.getElementById('root-modals') || document.body

const ContratoStepperModal = ({ 
  show, 
  handleClose, 
  onSubmit, 
  modalType, 
  initialData, 
  empresas, 
  usuarios 
}: Props) => {
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const [stepper, setStepper] = useState<StepperComponent | null>(null)
  const [data, setData] = useState<IContratoFormData>(defaultContratoFormData)
  const [hasError, setHasError] = useState(false)

  // Llenar datos iniciales para edición
  useEffect(() => {
    if (modalType === 'edit' && initialData) {
      setData({
        step1: {
          numero: initialData.numero,
          numeroSeguimientoCenit: initialData.numeroSeguimientoCenit,
          numeroSeguimientoContratista: initialData.numeroSeguimientoContratista,
          objeto: initialData.objeto,
          portafolio: initialData.portafolio
        },
        step2: {
          empresaId: initialData.empresaId,
          originadorId: initialData.originadorId,
          adminContratoId: initialData.adminContratoId,
          jefeIngenieriaId: initialData.jefeIngenieriaId
        },
        step3: {
          fechaInicio: initialData.fechaInicio,
          fechaFin: initialData.fechaFin
        },
        step4: {
          valorCostoDirecto: initialData.valorCostoDirecto,
          valorGastosReembolsables: initialData.valorGastosReembolsables
        }
      })
    } else {
      setData(defaultContratoFormData)
    }
  }, [modalType, initialData])

  // Asegurar que se muestre el Step 1 cuando el modal esté abierto y el stepper esté listo
  useEffect(() => {
    if (show && stepper) {
      // Pequeño delay para asegurar que el modal esté completamente renderizado
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
      
      // Forzar la inicialización de la UI para mostrar el primer step
      // Necesitamos hacer esto después de que React haya renderizado completamente
      setTimeout(() => {
        // Forzar refresh UI para asegurar que el primer step se muestre
        if ((stepperInstance as any).refreshUI) {
          (stepperInstance as any).refreshUI()
        }
        
        // Después del refresh, ir al paso 1 para asegurar el estado correcto
        stepperInstance.goto(1)
      }, 100) // Incrementar el delay para asegurar que el DOM esté completamente listo
    } else {
      setStepper(stepperInstance)
    }
  }

  // Navegar directamente a un paso específico
  const goToStep = (stepIndex: number) => {
    if (!stepper) return
    stepper.goto(stepIndex)
  }

  const updateData = (fieldsToUpdate: Partial<IContratoFormData>) => {
    const updatedData = { ...data, ...fieldsToUpdate }
    setData(updatedData)
  }

  // Validaciones por paso
  const checkStep1 = (): boolean => {
    if (!data.step1.objeto || data.step1.portafolio === 0) {
      return false
    }
    return true
  }

  const checkStep2 = (): boolean => {
    if (data.step2.empresaId === 0 || data.step2.adminContratoId === 0) {
      return false
    }
    return true
  }

  const checkStep3 = (): boolean => {
    if (!data.step3.fechaInicio || !data.step3.fechaFin) {
      return false
    }
    // Validar que la fecha de fin sea posterior a la de inicio
    const inicio = new Date(data.step3.fechaInicio)
    const fin = new Date(data.step3.fechaFin)
    if (fin <= inicio) {
      return false
    }
    return true
  }

  const checkStep4 = (): boolean => {
    if (data.step4.valorCostoDirecto <= 0 || data.step4.valorGastosReembolsables < 0) {
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
    // Convertir datos del formulario a formato Contrato
    const contratoData: Contrato = {
      id: modalType === 'edit' && initialData ? initialData.id : 0,
      numero: data.step1.numero,
      numeroSeguimientoCenit: data.step1.numeroSeguimientoCenit,
      numeroSeguimientoContratista: data.step1.numeroSeguimientoContratista,
      objeto: data.step1.objeto,
      empresaId: data.step2.empresaId,
      originadorId: data.step2.originadorId,
      adminContratoId: data.step2.adminContratoId,
      jefeIngenieriaId: data.step2.jefeIngenieriaId,
      fechaInicio: data.step3.fechaInicio,
      fechaFin: data.step3.fechaFin,
      fechaFinalOriginal: data.step3.fechaFin,
      portafolio: data.step1.portafolio,
      valorCostoDirecto: data.step4.valorCostoDirecto,
      valorInicialCostoDirecto: data.step4.valorCostoDirecto,
      valorGastosReembolsables: data.step4.valorGastosReembolsables,
      valorInicialGastosReembolsables: data.step4.valorGastosReembolsables,
      valorComprometido: modalType === 'edit' && initialData ? initialData.valorComprometido : 0,
      numeroOdsSuscritas: modalType === 'edit' && initialData ? initialData.numeroOdsSuscritas : 0,
      valorDisponible: (data.step4.valorCostoDirecto + data.step4.valorGastosReembolsables),
      valorDisponibleGastosReembolsables: modalType === 'edit' && initialData ? initialData.valorDisponibleGastosReembolsables : 0,
      // Nuevos campos de estado y aprobación
      estado: modalType === 'edit' && initialData ? initialData.estado : 1, // Por defecto: Borrador
      estaAprobado: modalType === 'edit' && initialData ? initialData.estaAprobado : false,
      estaRechazado: modalType === 'edit' && initialData ? initialData.estaRechazado : false,
      estaSuspendido: modalType === 'edit' && initialData ? initialData.estaSuspendido : false,
      comentarioAprobacion: modalType === 'edit' && initialData ? initialData.comentarioAprobacion : null
    }

    onSubmit(contratoData)
    handleClose()
  }

  const handleModalClose = () => {
    setData(defaultContratoFormData)
    setHasError(false)
    handleClose()
  }

  return createPortal(
    <Modal
      id='kt_modal_create_contrato'
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
        <h2>{modalType === 'create' ? 'Crear Contrato' : 'Editar Contrato'}</h2>
        <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleModalClose}>
          <KTIcon className='fs-1' iconName='cross' />
        </div>
      </div>

      <div className='modal-body py-lg-5 px-lg-10' style={{ height: '70vh', overflow: 'hidden' }}>
        <div
          ref={stepperRef}
          className='stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid h-100'
          id='kt_modal_create_contrato_stepper'
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
                    <div className='stepper-desc'>Datos generales del contrato</div>
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
                    <div className='stepper-desc'>Consultor y responsables</div>
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
                    <h3 className='stepper-title'>Fechas</h3>
                    <div className='stepper-desc'>Plazos del contrato</div>
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
                    <div className='stepper-desc'>Costos y gastos</div>
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
            <form noValidate id='kt_modal_create_contrato_form' className='d-flex flex-column h-100'>
              <div className='flex-grow-1 overflow-auto' style={{ maxHeight: 'calc(70vh - 120px)' }}>
                <Step1 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                  isEditMode={modalType === 'edit'}
                />
                <Step2 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                  empresas={empresas}
                  usuarios={usuarios}
                />
                <Step3 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                />
                <Step4 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                />
                <Step5 
                  data={data} 
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
                    {modalType === 'create' ? 'Crear Contrato' : 'Actualizar Contrato'} 
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

export { ContratoStepperModal } 