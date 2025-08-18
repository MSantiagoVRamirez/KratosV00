import { ReactNode } from "react";
import { colorDarken } from "../../../_metronic/assets/ts/_utils";

interface ModalDialogProps {
  title: string;           // Título del modal
  content: ReactNode;      // Puede ser cualquier cosa que se pueda renderizar
  textBtn: string;          // Texto del botón de acción
  onConfirm: () => void;   // Función que se ejecuta al confirmar
  closeModal: () => void;  // Función para cerrar el modal
  confirmButtonClass?: string; // Nueva prop opcional para la clase del botón
  isFormValid?: boolean;   // Nueva prop para controlar si el formulario es válido
}

// Componente de diálogo modal
export function ModalDialog({ 
  title, 
  content, 
  textBtn, 
  onConfirm, 
  closeModal, 
  confirmButtonClass = "btn-primary",
  isFormValid = true 
}: ModalDialogProps) {
  return (
    <div  className="modal fade show d-block" tabIndex={-1} role="dialog">
      <div  className="modal-dialog modal-dialog-centered">
        <div style={{backgroundColor: '#0d5d97'}}  className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{ title }</h5>
          <button type="button" className="btn-close" onClick={ closeModal }></button>
        </div>
        <div className="modal-body">{ content }</div>
        <div className="modal-footer">
          <button className="btn btn-outline btn-active-light" onClick={ closeModal }>Cancelar</button>
          <button 
            className={`btn ${confirmButtonClass} ${!isFormValid ? 'disabled' : ''}`} 
            onClick={ onConfirm }
            disabled={!isFormValid}
            title={!isFormValid ? 'Complete todos los campos requeridos' : ''}
          >
            { textBtn }
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
