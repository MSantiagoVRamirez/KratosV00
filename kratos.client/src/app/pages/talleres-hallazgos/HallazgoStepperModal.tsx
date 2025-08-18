import React, { useRef, useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import { KTIcon } from '../../../_metronic/helpers'
import { StepperComponent } from '../../../_metronic/assets/ts/components'
import { Step1 } from './hallazgo-stepper/Step1'
import { Step2 } from './hallazgo-stepper/Step2'
import { Step3 } from './hallazgo-stepper/Step3'
import { Step4 } from './hallazgo-stepper/Step4'
import { Step5 } from './hallazgo-stepper/Step5'
import { IHallazgoFormData, defaultHallazgoFormData } from '../../interfaces/talleres-hallazgos/HallazgoFormData'
import { Hallazgo } from '../../interfaces/talleres-hallazgos/Hallazgo'
import { Taller } from '../../interfaces/talleres-hallazgos/Taller'
import { Disciplina } from '../../interfaces/talleres-hallazgos/Disciplina'
import { Usuario } from '../../interfaces/seguridad/Usuario'

type Props = {
  show: boolean
  handleClose: () => void
  onSubmit: (data: Hallazgo) => void
  hallazgo?: Hallazgo
  selectedTallerId?: number
  talleres: Taller[]
  disciplinas: Disciplina[]
  usuarios: Usuario[]
  currentUsername: string
}

const HallazgoStepperModal: React.FC<Props> = ({
  show,
  handleClose,
  onSubmit,
  hallazgo,
  selectedTallerId,
  talleres,
  disciplinas,
  usuarios,
  currentUsername
}) => {
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const [stepper, setStepper] = useState<StepperComponent | null>(null)
  const [formData, setFormData] = useState<IHallazgoFormData>(defaultHallazgoFormData)
  const [hasError, setHasError] = useState(false)

  const isEditMode = !!hallazgo?.id
  
  const modalsRoot = document.getElementById('root') ?? document.body

  // Convertir datos de hallazgo a formato del formulario
  const convertToFormData = (hallazgoData: Hallazgo): IHallazgoFormData => {
    return {
      step1: {
        tallerId: hallazgoData.tallerId,
        disciplinaId: hallazgoData.disciplinaId,
        tipoCategoria: hallazgoData.tipoCategoria
      },
      step2: {
        responsableAccionId: hallazgoData.responsableAccionId,
        originadorBrechasId: hallazgoData.originadorBrechasId
      },
      step3: {
        fechaCierrePlaneada: hallazgoData.fechaCierrePlaneada ? new Date(hallazgoData.fechaCierrePlaneada).toISOString().split('T')[0] : '',
        fechaCierreReal: hallazgoData.fechaCierreReal ? new Date(hallazgoData.fechaCierreReal).toISOString().split('T')[0] : null,
        documento: hallazgoData.documento
      },
      step4: {
        recomendacion: hallazgoData.recomendacion || '',
        descripcionAccionCierre: hallazgoData.descripcionAccionCierre,
        ultimoComentarioVerificacionCierre: hallazgoData.ultimoComentarioVerificacionCierre
      }
    }
  }

  // Convertir datos del formulario a formato de hallazgo
  const convertToHallazgo = (data: IHallazgoFormData): Hallazgo => {
    return {
      id: hallazgo?.id || 0,
      nombre: hallazgo?.nombre || 'H000',
      tallerId: data.step1.tallerId || selectedTallerId || 0,
      disciplinaId: data.step1.disciplinaId,
      tipoCategoria: data.step1.tipoCategoria ?? 0,
      responsableAccionId: data.step2.responsableAccionId,
      originadorBrechasId: data.step2.originadorBrechasId,
      fechaCierrePlaneada: data.step3.fechaCierrePlaneada,
      fechaCierreReal: data.step3.fechaCierreReal,
      documento: data.step3.documento,
      recomendacion: data.step4.recomendacion,
      descripcionAccionCierre: data.step4.descripcionAccionCierre,
      ultimoComentarioVerificacionCierre: data.step4.ultimoComentarioVerificacionCierre,
      estado: hallazgo?.estado || 0,
      estaAprobado: hallazgo?.estaAprobado || false,
      estaCancelado: hallazgo?.estaCancelado || false,
      estaRechazado: hallazgo?.estaRechazado || false,
      estaFirmado: hallazgo?.estaFirmado || false,
      comentarioAprobacion: hallazgo?.comentarioAprobacion || null,
      nombreFirma: hallazgo?.nombreFirma || null,
      fechaFirma: hallazgo?.fechaFirma || null
    }
  }

  // Efecto para inicializar stepper cuando se muestra el modal
  useEffect(() => {
    if (show && stepperRef.current && !stepper) {
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

  // Ir a un paso específico
  const goToStep = (stepIndex: number) => {
    if (!stepper) return
    stepper.goto(stepIndex)
  }

  // Actualizar datos del formulario
  const updateData = (fieldsToUpdate: Partial<IHallazgoFormData>) => {
    setFormData((prevData) => ({
      ...prevData,
      ...fieldsToUpdate
    }))
  }

  // Validaciones por paso
  const checkStep1 = (): boolean => {
    return formData.step1.tallerId > 0 && 
           formData.step1.disciplinaId > 0 && 
           formData.step1.tipoCategoria !== null && 
           formData.step1.tipoCategoria !== undefined
  }

  const checkStep2 = (): boolean => {
    return formData.step2.responsableAccionId > 0 && 
           formData.step2.originadorBrechasId > 0
  }

  const checkStep3 = (): boolean => {
    return !!formData.step3.fechaCierrePlaneada
  }

  const checkStep4 = (): boolean => {
    return !!formData.step4.recomendacion.trim()
  }

  // Ir al paso anterior
  const prevStep = () => {
    if (!stepper) return
    stepper.goPrev()
  }

  // Ir al siguiente paso
  const nextStep = () => {
    setHasError(false)
    if (!stepper) return

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

  // Enviar formulario
  const submit = () => {
    setHasError(true)

    if (!checkStep1() || !checkStep2() || !checkStep3() || !checkStep4()) {
      return
    }

    const hallazgoData = convertToHallazgo(formData)
    onSubmit(hallazgoData)
    handleModalClose()
  }

  const handleModalClose = () => {
    setFormData(defaultHallazgoFormData)
    setHasError(false)
    handleClose()
  }

  // Inicializar datos cuando cambia el hallazgo
  useEffect(() => {
    if (hallazgo && isEditMode) {
      setFormData(convertToFormData(hallazgo))
    } else {
      const initialData = { ...defaultHallazgoFormData }
      if (selectedTallerId) {
        initialData.step1.tallerId = selectedTallerId
      }
      setFormData(initialData)
    }
  }, [hallazgo, selectedTallerId, isEditMode])

  return createPortal(
    <Modal
      id='kt_modal_create_hallazgo'
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
        <h2>{isEditMode ? 'Editar Hallazgo' : 'Crear Hallazgo'}</h2>
        <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleModalClose}>
          <KTIcon className='fs-1' iconName='cross' />
        </div>
      </div>

      <div className='modal-body py-lg-5 px-lg-10' style={{ height: '70vh', overflow: 'hidden' }}>
        <div
          ref={stepperRef}
          className='stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid h-100'
          id='kt_modal_create_hallazgo_stepper'
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
                    <div className='stepper-desc'>Taller, disciplina y tipo</div>
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
                    <h3 className='stepper-title'>Responsables</h3>
                    <div className='stepper-desc'>Asignación de usuarios</div>
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
                    <h3 className='stepper-title'>Fechas y Documentos</h3>
                    <div className='stepper-desc'>Cronograma y archivos</div>
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
                    <h3 className='stepper-title'>Descripción</h3>
                    <div className='stepper-desc'>Recomendaciones y comentarios</div>
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
            <form noValidate id='kt_modal_create_hallazgo_form' className='d-flex flex-column h-100'>
              <div className='flex-grow-1 overflow-auto' style={{ maxHeight: 'calc(70vh - 120px)' }}>
                <Step1 
                  data={formData} 
                  updateData={updateData} 
                  hasError={hasError} 
                  selectedTallerId={selectedTallerId}
                  talleres={talleres}
                  disciplinas={disciplinas}
                />
                <Step2 
                  data={formData} 
                  updateData={updateData} 
                  hasError={hasError} 
                  usuarios={usuarios}
                  currentUsername={currentUsername}
                />
                <Step3 
                  data={formData} 
                  updateData={updateData} 
                  hasError={hasError} 
                  isEditMode={isEditMode}
                />
                <Step4 
                  data={formData} 
                  updateData={updateData} 
                  hasError={hasError} 
                  isEditMode={isEditMode}
                />
                <Step5 
                  data={formData} 
                  talleres={talleres}
                  disciplinas={disciplinas}
                  usuarios={usuarios}
                  isEditMode={isEditMode}
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
                    {isEditMode ? 'Actualizar Hallazgo' : 'Crear Hallazgo'} 
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

export { HallazgoStepperModal } 