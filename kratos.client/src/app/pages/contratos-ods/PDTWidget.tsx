import { useState } from "react"
import { KTIcon } from "../../../_metronic/helpers"
import { Dropdown1 } from "../../../_metronic/partials"
import { ModalDialog } from "../components/ModalDialog"
import { Pagination } from "../components/Pagination"
import { useFormValidation } from '../../hooks/useFormValidation';
import { SCurveChart } from "../components/SCurveChart"

interface AvancePDT {
  id: number;
  semana: string;
  avanceProgramado: number;
  avanceEjecutado: number;
  avanceProgramadoAcumulado?: number;
  avanceEjecutadoAcumulado?: number;
}

export function PDTWidget() {

  const avancesPDT: AvancePDT[] = [
    { id: 0, semana: '3/06/2025', avanceProgramado: 0, avanceEjecutado: 0, avanceProgramadoAcumulado: 0, avanceEjecutadoAcumulado: 0 },
    { id: 1, semana: '10/06/2025', avanceProgramado: 20, avanceEjecutado: 20, avanceProgramadoAcumulado: 20, avanceEjecutadoAcumulado: 20 },
    { id: 2, semana: '17/06/2025', avanceProgramado: 10, avanceEjecutado: 0, avanceProgramadoAcumulado: 30, avanceEjecutadoAcumulado: 20 },
    { id: 3, semana: '24/06/2025', avanceProgramado: 20, avanceEjecutado: 15, avanceProgramadoAcumulado: 50, avanceEjecutadoAcumulado: 35 },
    { id: 4, semana: '01/07/2025', avanceProgramado: 35, avanceEjecutado: 35, avanceProgramadoAcumulado: 85, avanceEjecutadoAcumulado: 70 },
    { id: 5, semana: '08/07/2025', avanceProgramado: 15, avanceEjecutado: 10, avanceProgramadoAcumulado: 100, avanceEjecutadoAcumulado: 80 },
  ];

  const defaultAvancePDT: AvancePDT = { id: 0, semana: '', avanceProgramado: 0, avanceEjecutado: 0 };
  const [editedAvancePDT, setEditedAvancePDT] = useState<AvancePDT>(defaultAvancePDT);
  const [deletedAvancePDTId, setDeletedAvancePDTId] = useState<number>(0);

  console.log(setDeletedAvancePDTId);

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null)

  // Cerrar el Modal de Creación/Edición/Eliminación
  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    semana: { value: editedAvancePDT.semana, required: true, type: 'string' },
    avanceProgramado: { value: editedAvancePDT.avanceProgramado, required: false, type: 'number' },
    avanceEjecutado: { value: editedAvancePDT.avanceEjecutado, required: false, type: 'number' },
  });

  return (
    <>
      <div className="card mx-10 my-10 mx-0-sm">

        {/* Header */}
        <div className="card-header">
          <div className="card-title fw-bold fs-2">
            Avance PDT
          </div>
          <div className="d-flex my-5 gap-3">
            <button
              type='button'
              className='btn btn-sm btn-icon btn-color-primary btn-active-light-primary mx-3'
              data-kt-menu-trigger='click'
              data-kt-menu-placement='bottom-end'
              data-kt-menu-flip='top-end'
            >
              <KTIcon iconName='category' className='fs-3' />
            </button>
            <Dropdown1 />
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar..."
              // value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-sm btn-light-primary btn-active-primary d-flex" onClick={() => {
              setEditedAvancePDT(defaultAvancePDT); // Resetear estado al abrir creación
              setModalType('create');
            }}>
              <KTIcon iconName="plus" className="fs-3" /> Agregar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="card-body pb-0">
          <div className="table-responsive">
            {/* Table */}
            <table className="table align-middle gs-0 gy-3">
              {/* Table Head */}
              <thead>
                <tr className='fw-semibold text-muted bg-light fs-6'>
                  <th className='min-w-150px rounded-start ps-5'>Semana</th>
                  <th className='min-w-100px'>% Avance Prog.</th>
                  <th className='min-w-100px'>% Avance Ejec.</th>
                  <th className='min-w-100px'>% Avance Prog. Acum.</th>
                  <th className='min-w-100px'>% Avance Ejec. Acum.</th>
                  <th className='min-w-210px text-end rounded-end pe-5'>Acciones</th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {avancesPDT.map((avance) => (
                  <tr key={avance.id}>
                    <td>
                      <span className="badge badge-light fs-7 ms-5">{avance.semana}</span>
                    </td>
                    <td className="text-center">
                      {Math.round(avance.avanceProgramado)}%
                      <div className="progress" style={{ height: '5px' }}>
                        <div
                          className="progress-bar bg-secondary"
                          role="progressbar"
                          style={{ width: `${avance.avanceProgramado}%` }}
                          aria-valuenow={avance.avanceProgramado}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </td>
                    <td className="text-center">
                      {Math.round(avance.avanceEjecutado)}%
                      <div className="progress" style={{ height: '5px' }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${avance.avanceEjecutado}%` }}
                          aria-valuenow={avance.avanceEjecutado}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </td>
                    <td className="text-center">
                      {Math.round(avance.avanceProgramadoAcumulado ?? 0)}%
                      <div className="progress" style={{ height: '5px' }}>
                        <div
                          className="progress-bar bg-info"
                          role="progressbar"
                          style={{ width: `${avance.avanceProgramadoAcumulado ?? 0}%` }}
                          aria-valuenow={avance.avanceProgramadoAcumulado ?? 0}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </td>
                    <td className="text-center">
                      {Math.round(avance.avanceEjecutadoAcumulado ?? 0)}%
                      <div className="progress" style={{ height: '5px' }}>
                        <div
                          className="progress-bar bg-warning"
                          role="progressbar"
                          style={{ width: `${avance.avanceEjecutadoAcumulado ?? 0}%` }}
                          aria-valuenow={avance.avanceEjecutadoAcumulado ?? 0}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        ></div>
                      </div>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-icon btn-bg-light btn-active-light-primary" onClick={() => setModalType('edit')}>
                        <KTIcon iconName="pencil" className="fs-3" />
                      </button>
                      <button className="btn btn-icon btn-bg-light btn-active-light-danger ms-3" onClick={() => setModalType('delete')}>
                        <KTIcon iconName="trash" className="fs-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        <Pagination
          filteredItems={avancesPDT}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />

        {/* Formulario Unificado de Usuario */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Avance PDT" : "Editar Avance PDT"}
            isFormValid={isFormValid}
            content={
              <div className="d-flex flex-column gap-5">
                <div className="form-group">
                  <label className="form-label required"> Semana </label>
                  <input
                    type="date"
                    value={editedAvancePDT.semana || ''}
                    onChange={(e) => setEditedAvancePDT(prev => ({ ...prev, semana: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">% Avance Programado</label>
                  <input
                    type="number"
                    placeholder="% Avance Programado"
                    value={editedAvancePDT.avanceProgramado || ''}
                    onChange={(e) => setEditedAvancePDT(prev => ({ ...prev, avanceProgramado: parseFloat(e.target.value) }))}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">% Avance Ejecutado</label>
                  <input
                    type="number"
                    placeholder="% Avance Ejecutado"
                    value={editedAvancePDT.avanceEjecutado || ''}
                    onChange={(e) => setEditedAvancePDT(prev => ({ ...prev, avanceEjecutado: parseFloat(e.target.value) }))}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            // onConfirm={() => { // Llamar a la función correcta con el estado unificado
            //   if (modalType === 'create') {
            //     createUsuario(editedUsuario);
            //   } else {
            //     updateUsuario(editedUsuario);
            //   }
            // }}
            onConfirm={() => setModalType(null)} // Cerrar modal al guardar
            closeModal={closeModal}
          />
        )}

        {/* Caja de Confirmación de Eliminación de Usuario */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación" // Título actualizado
            // Mensaje actualizado
            content={`¿Está seguro que desea eliminar el avance de la semana ${avancesPDT.find(a => a.id === deletedAvancePDTId)?.semana}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger" // Usar prop para botón rojo
            onConfirm={() => console.log(`Eliminar avance con ID: ${deletedAvancePDTId}`)}
            closeModal={closeModal}
          />
        )}
      </div>

      {/* Curva S */}
      <SCurveChart avancesPDT={avancesPDT} />
    </>
  );
}