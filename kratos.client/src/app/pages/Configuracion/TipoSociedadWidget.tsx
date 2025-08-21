import { useState, useEffect } from "react";
import { TipoSociedad } from "../../interfaces/Configuracion/TipoSociedad";
import TipoSociedadService from "../../services/Configuracion/TipoSociedadService";
import '../../Styles/estilos.css';
import { ModalDialog } from "../components/ModalDialog";
import { grid2ColStyle } from "../../utils";
import { useFormValidation } from '../../hooks/useFormValidation';
import { GridColDef, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { IconButton, Box } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

// Helper opcional para mensajes de error legibles (si ya lo tienes, reutilízalo)
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

export function TipoSociedadWidget() {

  const defaultTipo: TipoSociedad = {
    id: 0,
    codigo: '',
    nombre: '',
    descripcion: '',
  };

  const [tipos, setTipos] = useState<TipoSociedad[]>([]);
  const [editedTipo, setEditedTipo] = useState<TipoSociedad>(defaultTipo);
  const [deleteTipoId, setDeleteTipoId] = useState<number>(defaultTipo.id);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [showContent, setShowContent] = useState(true);

  const closeModal = () => setModalType(null);

  // Validación (según tu modelo: MaxLength 100/500)
  const isFormValid = useFormValidation({
    codigo:      { value: editedTipo.codigo,      required: true, type: 'string' },
    nombre:      { value: editedTipo.nombre,      required: true, type: 'string' },
    descripcion: { value: editedTipo.descripcion, required: true, type: 'string' },
  });

  // Obtener todos
  const fetchListaTipos = () => {
    TipoSociedadService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setTipos(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener la lista de Tipos de Sociedad", error);
      });
  };

  useEffect(() => {
    fetchListaTipos();
  }, []);

  // Obtener uno (editar)
  const fetchTipo = (id: number) => {
    TipoSociedadService.get(id)
      .then((response) => {
        setEditedTipo(response.data);
        setModalType('edit');
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el tipo de sociedad", error);
      });
  };

  // Crear
  const createTipo = (data: TipoSociedad) => {
    TipoSociedadService.create(data)
      .then(() => {
        setEditedTipo(defaultTipo);
        closeModal();
        fetchListaTipos();
      })
      .catch((error) => {
        console.error("Hubo un error al crear el tipo de sociedad", error);
        alert(`Error al crear tipo de sociedad:\n${formatApiError(error)}`);
      });
  };

  // Actualizar
  const updateTipo = (data: TipoSociedad) => {
    TipoSociedadService.update(data)
      .then(() => {
        setEditedTipo(defaultTipo);
        closeModal();
        fetchListaTipos();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el tipo de sociedad", error);
        alert(`Error al actualizar tipo de sociedad:\n${formatApiError(error)}`);
      });
  };

  // Eliminar
  const deleteTipo = () => {
    TipoSociedadService.remove(deleteTipoId)
      .then(() => {
        setDeleteTipoId(defaultTipo.id);
        closeModal();
        fetchListaTipos();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el tipo de sociedad", error);
        alert(`Error al eliminar tipo de sociedad:\n${formatApiError(error)}`);
      });
  };

  // Abrir confirmación de eliminación
  const openDeleteModal = (id: number) => {
    setDeleteTipoId(id);
    setModalType('delete');
  };

  // Columnas DataGrid (misma estética)
  const columnas: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'codigo', headerName: 'Código', flex: 1 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'descripcion', headerName: 'Descripción', flex: 2 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton onClick={() => fetchTipo(params.row.id ?? params.row.Id)}>
            <Edit className="icon-editar" />
          </IconButton>
          <IconButton onClick={() => openDeleteModal(params.row.id ?? params.row.Id)}>
            <Delete className="icon-eliminar" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <div className="contenido">
      <div id="tiposociedad" className="bloque-formulario">
        <div><h2>Listado de Tipos de Sociedad</h2></div>

        <div className="bloque-botones">
          <button
            style={{ marginTop: '0px' }}
            className="boton-formulario"
            onClick={() => {
              setEditedTipo(defaultTipo);
              setModalType('create');
            }}>
            Agregar Tipo de Sociedad
          </button>

          <div style={{ height: '70%', width: '96%', margin: '1rem' }}>
            <DataGrid
              rows={tipos}
              columns={columnas}
              disableRowSelectionOnClick
              // Soporta backend que envíe "id" o "Id"
              getRowId={(row: any) => row.id ?? row.Id}
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
            title={modalType === 'create' ? "Agregar Tipo de Sociedad" : "Editar Tipo de Sociedad"}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Código</label>
                  <input
                    type="text"
                    placeholder="Código"
                    value={editedTipo.codigo || ''}
                    onChange={(e) =>
                      setEditedTipo(prev => ({
                        ...prev,
                        codigo: e.target.value
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del tipo de sociedad"
                    value={editedTipo.nombre || ''}
                    onChange={(e) =>
                      setEditedTipo(prev => ({
                        ...prev,
                        nombre: e.target.value
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Descripción</label>
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={editedTipo.descripcion || ''}
                    onChange={(e) =>
                      setEditedTipo(prev => ({
                        ...prev,
                        descripcion: e.target.value
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createTipo(editedTipo);
              } else {
                updateTipo(editedTipo);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el tipo de sociedad ${tipos.find(t => (t as any).id === deleteTipoId || (t as any).Id === deleteTipoId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteTipo}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
}
