import { useState, useEffect } from "react";
import { Modulo } from "../../interfaces/Configuracion/Modulo";
import ModuloService from "../../services/Configuracion/ModuloService";
import '../../Styles/estilos.css';
import { ModalDialog } from "../components/ModalDialog";
import { grid2ColStyle } from "../../utils";
import { useFormValidation } from '../../hooks/useFormValidation';
import { GridColDef, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { IconButton, Box } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

// (Opcional) Helper para errores legibles
function formatApiError(err: any): string {
  const resp = err?.response;
  if (!resp) return err?.message ?? 'Error desconocido';
  const data = resp.data;
  if (data?.errors && typeof data.errors === 'object') {
    const lines: string[] = [];
    for (const [field, msgs] of Object.entries<any>(data.errors)) {
      if (Array.isArray(msgs) && msgs.length) lines.push(`${field}: ${msgs.join(' | ')}`);
    }
    if (lines.length) return `Errores de validación:\n${lines.join('\n')}`;
  }
  if (data?.detail || data?.title) return `${data.title ?? 'Error'}${data.detail ? `: ${data.detail}` : ''}`;
  if (typeof data === 'string') return data;
  try { return JSON.stringify(data); } catch { return resp.statusText || 'Error de servidor'; }
}

export function ModuloWidget() {

  const defaultModulo: Modulo = {
    id: 0,
    nombre: '',
  };

  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [editedModulo, setEditedModulo] = useState<Modulo>(defaultModulo);
  const [deleteModuloId, setDeleteModuloId] = useState<number>(defaultModulo.id);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [showContent, setShowContent] = useState(true);
  const closeModal = () => setModalType(null);

  // Validación (MaxLength 100)
  const isFormValid = useFormValidation({
    nombre: { value: editedModulo.nombre, required: true, type: 'string' },
  });

  // Obtener todos
  const fetchListaModulos = () => {
    ModuloService.getAll()
      .then((response) => {
        typeof response.data === 'string' ? setShowContent(false) : setModulos(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener la lista de Módulos", error);
      });
  };

  useEffect(() => {
    fetchListaModulos();
  }, []);

  // Obtener uno (editar)
  const fetchModulo = (id: number) => {
    ModuloService.get(id)
      .then((response) => {
        setEditedModulo(response.data);
        setModalType('edit');
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el módulo", error);
      });
  };

  // Crear
  const createModulo = (data: Modulo) => {
    ModuloService.create(data)
      .then(() => {
        setEditedModulo(defaultModulo);
        closeModal();
        fetchListaModulos();
      })
      .catch((error) => {
        console.error("Hubo un error al crear el módulo", error);
        alert(`Error al crear módulo:\n${formatApiError(error)}`);
      });
  };

  // Actualizar
  const updateModulo = (data: Modulo) => {
    ModuloService.update(data)
      .then(() => {
        setEditedModulo(defaultModulo);
        closeModal();
        fetchListaModulos();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el módulo", error);
        alert(`Error al actualizar módulo:\n${formatApiError(error)}`);
      });
  };

  // Eliminar
  const deleteModulo = () => {
    ModuloService.remove(deleteModuloId)
      .then(() => {
        setDeleteModuloId(defaultModulo.id);
        closeModal();
        fetchListaModulos();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el módulo", error);
        alert(`Error al eliminar módulo:\n${formatApiError(error)}`);
      });
  };

  // Abrir confirmación de eliminación
  const openDeleteModal = (id: number) => {
    setDeleteModuloId(id);
    setModalType('delete');
  };

  // Columnas DataGrid (misma estética que las anteriores)
  const columnas: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton onClick={() => fetchModulo(params.row.id)}>
            <Edit className="icon-editar" />
          </IconButton>
          <IconButton onClick={() => openDeleteModal(params.row.id)}>
            <Delete className="icon-eliminar" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <div className="contenido">
      <div id="modulo" className="bloque-formulario">
        <div><h2>Listado de Módulos</h2></div>

        <div className="bloque-botones">
          <button
            style={{ marginTop: '0px' }}
            className="boton-formulario"
            onClick={() => {
              setEditedModulo(defaultModulo);
              setModalType('create');
            }}>
            Agregar Módulo
          </button>

          <div style={{ height: '70%', width: '96%', margin: '1rem' }}>
            <DataGrid
              rows={modulos}
              columns={columnas}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 15]}
              sx={{
                background: 'linear-gradient(45deg, rgba(10, 70, 120, 0.7), rgba(21, 154, 230, 0.7))',
                borderRadius: '10px',
                color: '#fff',
                '& .MuiDataGrid-columnHeaders': {
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: 'rgb(20, 111, 165)',
                  color: '#fff',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-cell': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                '& .MuiDataGrid-footerContainer': {
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  color: '#fff',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                },
                '& .MuiSvgIcon-root': {
                  color: '#fff',
                },
                '& .MuiTablePagination-root': {
                  color: '#fff',
                },
              }}
            />
          </div>
        </div>

        {/* Formulario Unificado */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Módulo" : "Editar Módulo"}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del módulo"
                    value={editedModulo.nombre || ''}
                    onChange={(e) => setEditedModulo(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createModulo(editedModulo);
              } else {
                updateModulo(editedModulo);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el módulo ${modulos.find(m => m.id === deleteModuloId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteModulo}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
}
