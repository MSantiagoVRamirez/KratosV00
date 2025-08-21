import { useState, useEffect } from "react";
import { RegimenTributario } from "../../interfaces/Configuracion/RegimenTributario";
import RegimenTributarioService from "../../services/Configuracion/RegimenTributarioService";
import '../../Styles/estilos.css';
import { ModalDialog } from "../components/ModalDialog";
import { grid2ColStyle } from "../../utils";
import { useFormValidation } from '../../hooks/useFormValidation';
import { GridColDef, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { IconButton, Box, Chip, Switch, FormControlLabel } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export function RegimenTributarioWidget() {

// Pégalo arriba del componente o en un util
function formatApiError(err: any): string {
  // Axios error?
  const resp = err?.response;
  if (!resp) {
    return err?.message ?? 'Error desconocido';
  }

  // ASP.NET Core ValidationProblemDetails: { title, status, errors: {campo: [msgs]} }
  const data = resp.data;

  if (data?.errors && typeof data.errors === 'object') {
    const lines: string[] = [];
    for (const [field, msgs] of Object.entries<any>(data.errors)) {
      if (Array.isArray(msgs) && msgs.length) {
        lines.push(`${field}: ${msgs.join(' | ')}`);
      }
    }
    if (lines.length) return `Errores de validación:\n${lines.join('\n')}`;
  }

  // ProblemDetails estándar: { title, detail }
  if (data?.detail || data?.title) {
    return `${data.title ?? 'Error'}${data.detail ? `: ${data.detail}` : ''}`;
  }

  // Texto plano o string
  if (typeof data === 'string') return data;

  // Fallback: stringify
  try {
    return JSON.stringify(data);
  } catch {
    return resp.statusText || 'Error de servidor';
  }
}
  const defaultRegimen: RegimenTributario = {
    id: 0,
    nombre: '',
    descripcion: '',
    codigo: '',
    estado: true,
  };

  const [regimenes, setRegimenes] = useState<RegimenTributario[]>([]);
  const [editedRegimen, setEditedRegimen] = useState<RegimenTributario>(defaultRegimen);
  const [deleteRegimenId, setDeleteRegimenId] = useState<number>(defaultRegimen.id);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [showContent, setShowContent] = useState(true);

  // Cerrar modal
  const closeModal = () => setModalType(null);

  // Validación del formulario (mismo hook)
  const isFormValid = useFormValidation({
    nombre:      { value: editedRegimen.nombre,      required: true,  type: 'string' },
    descripcion: { value: editedRegimen.descripcion, required: true,  type: 'string' },
    codigo:      { value: editedRegimen.codigo,      required: true,  type: 'string'},
  });

  // Obtener todos
  const fetchListaRegimenes = () => {
    RegimenTributarioService.getAll()
      .then((response) => {
        typeof (response.data) === 'string' ? setShowContent(false) : setRegimenes(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener la lista de Regímenes Tributarios", error);
      });
  };
  

  useEffect(() => {
    fetchListaRegimenes();
  }, []);

  // Obtener uno (editar)
  const fetchRegimen = (id: number) => {
    RegimenTributarioService.get(id)
      .then((response) => {
        setEditedRegimen(response.data);
        setModalType('edit');
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el régimen", error);
      });
  };
// Crear
const createRegimen = (data: RegimenTributario) => {
  RegimenTributarioService.create(data)
    .then(() => {
      setEditedRegimen(defaultRegimen);
      closeModal();
      fetchListaRegimenes();
    })
    .catch((error) => {
      console.error("Hubo un error al crear el régimen", error);
      alert(`Error al crear régimen:\n${formatApiError(error)}`);
    });
};

// Actualizar
const updateRegimen = (data: RegimenTributario) => {
  RegimenTributarioService.update(data)
    .then(() => {
      setEditedRegimen(defaultRegimen);
      closeModal();
      fetchListaRegimenes();
    })
    .catch((error) => {
      console.error("Hubo un error al actualizar el régimen", error);
      alert(`Error al actualizar régimen:\n${formatApiError(error)}`);
    });
};

// Eliminar
const deleteRegimen = () => {
  RegimenTributarioService.remove(deleteRegimenId)
    .then(() => {
      setDeleteRegimenId(defaultRegimen.id);
      closeModal();
      fetchListaRegimenes();
    })
    .catch((error) => {
      console.error("Hubo un error al eliminar el régimen", error);
      alert(`Error al eliminar régimen:\n${formatApiError(error)}`);
    });
};

 
  // Abrir confirmación de eliminación
  const openDeleteModal = (id: number) => {
    setDeleteRegimenId(id);
    setModalType('delete');
  };

  // Columnas DataGrid (calcadas, con chip para estado)
  const columnas: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'descripcion', headerName: 'Descripción', flex: 2 },
    { field: 'codigo', headerName: 'Código', flex: 1 },
    {
    field: 'estado',
    headerName: 'Estado',
    width: 140,
    renderCell: (params: GridRenderCellParams) => {
        const value = Boolean(params.value);
        return (
        <Chip
            label={value ? 'Activo' : 'Inactivo'}
            color={value ? 'success' : 'default'}
            size="small"
            variant="filled"
            sx={{ fontWeight: 'bold' }}
        />
        );
    },
    },

    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton onClick={() => fetchRegimen(params.row.id)}>
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
      <div id="regimen" className="bloque-formulario">
        <div><h2>Listado de Regímenes Tributarios</h2></div>

        <div className="bloque-botones">
          <button
            style={{ marginTop: '0px' }}
            className="boton-formulario"
            onClick={() => {
              setEditedRegimen(defaultRegimen);
              setModalType('create');
            }}>
            Agregar Nuevo Régimen
          </button>

          <div style={{ height: '70%', width: '96%', margin: '1rem' }}>
            <DataGrid
              rows={regimenes}
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
            title={modalType === 'create' ? "Agregar Régimen Tributario" : "Editar Régimen Tributario"}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del régimen"
                    value={editedRegimen.nombre || ''}
                    onChange={(e) =>
                      setEditedRegimen(prev => ({
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
                    value={editedRegimen.descripcion || ''}
                    onChange={(e) =>
                      setEditedRegimen(prev => ({
                        ...prev,
                        descripcion: e.target.value
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Código</label>
                  <input
                    type="text"
                    placeholder="Código"
                    value={editedRegimen.codigo || ''}
                    onChange={(e) =>
                      setEditedRegimen(prev => ({
                        ...prev,
                        codigo: e.target.value
                      }))
                    }
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!editedRegimen.estado}
                        onChange={(e) =>
                          setEditedRegimen(prev => ({
                            ...prev,
                            estado: e.target.checked
                          }))
                        }
                      />
                    }
                    label={<span style={{ color: 'white' }}>Estado (Activo)</span>}
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createRegimen(editedRegimen);
              } else {
                updateRegimen(editedRegimen);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el régimen ${regimenes.find(r => r.id === deleteRegimenId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteRegimen}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
}
