import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Modal } from 'react-bootstrap'
import { EmpresaDataForm, defaultDataEmpresa } from '../../../interfaces/Configuracion/EmpresaDataForm';
import { StepperComponent } from '../../../../_metronic/assets/ts/components'
import { KTIcon } from '../../../../_metronic/helpers'
import { Step1 } from './Stepper-Empresa/Step1'
import { Step2 } from './Stepper-Empresa/Step2'
import { Step3 } from './Stepper-Empresa/Step3'
import { Step4 } from './Stepper-Empresa/Step4'
import { ActividadEconomica } from '../../../interfaces/Configuracion/ActividadEconomica';
import { RegimenTributario } from '../../../interfaces/Configuracion/RegimenTributario';
import { TipoSociedad } from '../../../interfaces/Configuracion/TipoSociedad';
import { Empresa } from '../../../interfaces/seguridad/Empresa'
import '../../../Styles/estilos.css';

type Props = {
  show: boolean
  handleClose: () => void
  onSubmit: (empresa: Empresa ) => void
  modalType: 'create' | 'edit'
  initialData?: Empresa | null
  actividades: ActividadEconomica[]
  rigimenes: RegimenTributario[]
  tiposSociedad: TipoSociedad[]
}
const modalsRoot = document.getElementById('root-modals') || document.body

const RegistroEmpresaStepper = ({ 
  show, 
  handleClose, 
  onSubmit, 
  modalType, 
  initialData, 
  actividades, 
  rigimenes,
  tiposSociedad,
}: Props) => {
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const [stepper, setStepper] = useState<StepperComponent | null>(null)
  const [data, setData] = useState<EmpresaDataForm>(defaultDataEmpresa)
  const [hasError, setHasError] = useState(false)

  // Llenar datos iniciales para edición
  useEffect(() => {
    if (modalType === 'edit' && initialData) {
      setData({
        step1: {
          email: initialData?.email ,
          contraseña: initialData.contraseña,
          confirmarContraseña: initialData.confirmarContraseña,
          token: initialData.token
        },
        step2: {
          telefono: initialData.telefono,
          representanteLegal: initialData.representanteLegal,

        },
        step3: {
            tiposociedadId: initialData.tiposociedadId,
            actividadId: initialData.actividadId,
            regimenId: initialData.regimenId,
            razonSocial: initialData.razonSocial,
            nombreComercial: initialData.nombreComercial,
            nit: initialData.nit,
            dv: initialData.dv
        }
      })
    } else {
      setData(defaultDataEmpresa)
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

  const updateData = (fieldsToUpdate: Partial<EmpresaDataForm>) => {
    const updatedData = { ...data, ...fieldsToUpdate }
    setData(updatedData)
  }

  // Validaciones por paso
  const checkStep1 = (): boolean => {
    if (!data.step1.confirmarContraseña || !data.step1.confirmarContraseña || !data.step1.email || !data.step1.token) {
      return false
    }
    return true
  }

  const checkStep2 = (): boolean => {
    if (!data.step2.telefono ) {
      return false
    }
    return true
  }

  const checkStep3 = (): boolean => {
    if (!data.step3.actividadId  || !data.step3.tiposociedadId || !data.step3.regimenId ) {
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

    stepper.goNext()
  }

  const submit = () => {
    // Convertir datos del formulario a formato Contrato
    const empresaData: Empresa = {
      id: modalType === 'edit' && initialData ? initialData.id : 0,
        contraseña: data.step1.contraseña,
        confirmarContraseña: data.step1.confirmarContraseña,
        tiposociedadId: data.step3.tiposociedadId,
        actividadId: data.step3.actividadId,
        regimenId: data.step3.regimenId,
        token: data.step1.token,
        razonSocial: data.step3.razonSocial,
        nombreComercial: data.step3.nombreComercial,
        nit: data.step3.nit,
        dv: data.step3.dv,
        telefono: data.step2.telefono,
        email: data.step1.email,
        representanteLegal: data.step2.representanteLegal,
        activo: true,
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
    }

    onSubmit(empresaData)
    handleClose()
  }

  const handleModalClose = () => {
    setData(defaultDataEmpresa)
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
      <div  className='modal-header'>
        <div className='modal-title' style={{ scale: '1.7', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <h2>{modalType === 'create' ? 'Registrar Empresa' : 'Editar Contrato'}</h2>
        </div>
        
        <div   className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleModalClose}>
          <KTIcon  className='fs-1' iconName='cross' />
        </div>
      </div>

      <div className='modal-body py-lg-5 px-lg-10' style={{ height: '70vh', overflow: 'hidden' }}>
        <div
          ref={stepperRef}
          className='stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid h-100'
          id='kt_modal_create_contrato_stepper'
        >
          {/* Navegación del Stepper */}
          <div className='d-flex justify-content-center justify-content-center flex-row-auto w-100 w-xl-300px flex-shrink-0'>
            <div className='stepper-nav ps-lg-10'>
              {/* Paso 1 */}
              <div className='stepper-item current' data-kt-stepper-element='nav' onClick={() => goToStep(1)} style={{ cursor: 'pointer' }}>
                <div className='stepper-wrapper'>
                  <div className='stepper-icon w-40px h-40px'>
                    <i style={{color: 'white'}} className='stepper-check fas fa-check'></i>
                    <span className='stepper-number'>1</span>
                  </div>
                  <div className='stepper-label'>
                    <h3 style={{color: 'rgb(255, 255 , 255)'}}  className= 'stepper-title'>Credenciales</h3>
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
                    <h3 className='stepper-title'>Datos de Contacto</h3>
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
                    <h3 className='stepper-title'>Clasificación</h3>
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
              </div>
            </div>
          </div>
          {/* Contenido de los pasos */}
          <div className='flex-row-fluid py-lg-5 px-lg-15 d-flex flex-column'>
            <form noValidate id='kt_modal_create_contrato_form' className='d-flex flex-column h-100'>
              <div  className='flex-grow-1 overflow-auto' style={{ marginLeft: '1%', scale: '1.2', maxHeight: 'calc(70vh - 120px)' }}>
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
                  isEditMode={modalType === 'edit'}
                />
                <Step3 
                  data={data} 
                  updateData={updateData} 
                  hasError={hasError} 
                  isEditMode={modalType === 'edit'}
                  actividadEconimica={actividades}
                  regimenTributario={rigimenes}
                  tipoSociedad={tiposSociedad}
                />
                <Step4 
                  data={data} 
                  actividadEconimica={actividades}
                  regimenTributario={rigimenes}
                  tipoSociedad={tiposSociedad}
                />
              </div>
            <br/><br/><br/>  

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
                    className='btn btn-lg btn-light-primary boton' 
                    data-kt-stepper-action='submit'
                    onClick={submit}
                  >
                    {modalType === 'create' ? 'Registrar Empresa' : 'Actualizar Contrato'} 
                    <KTIcon iconName='arrow-right' className='fs-3 ms-2 me-0' />
                  </button>

                  <button
                    type='button'
                    className='btn btn-lg btn-light-primary '
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

export { RegistroEmpresaStepper } 