import { useState, useEffect } from "react";
import { Rol } from "../../interfaces/Configuracion/Roles";
import { Empresa } from "../../interfaces/seguridad/Empresa";
import RolService from "../../services/Configuracion/RolService";
import EmpresaService from "../../services/Configuracion/EmpresaService";
import '../../Styles/estilos.css';
import { ModalDialog } from "../components/ModalDialog";
import { grid2ColStyle } from "../../utils";
import { useFormValidation } from '../../hooks/useFormValidation';
import { GridColDef, GridRenderCellParams, DataGrid } from '@mui/x-data-grid';
import { IconButton, Box } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

// Helper opcional para errores legibles
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

export function RolWidget() {

  const defaultRol: Rol = {
    id: 0,
    nombre: '',
    descripcion: '',
    empresaId: 0,
    rolempresaFk: null
  };

  const [roles, setRoles] = useState<Rol[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [editedRol, setEditedRol] = useState<Rol>(defaultRol);
  const [deleteRolId, setDeleteRolId] = useState<number>(defaultRol.id);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [showContent, setShowContent] = useState(true);
  const closeModal = () => setModalType(null);

  // Validación (según tu modelo)
  const isFormValid = useFormValidation({
    nombre:      { value: editedRol.nombre,      required: true, type: 'string'},
    descripcion: { value: editedRol.descripcion, required: true, type: 'string'},
    empresaId:   { value: editedRol.empresaId,   required: true, type: 'number'},
  });

  // Cargar listas
  const fetchRoles = () => {
    RolService.getAll()
      .then((response) => {
        typeof response.data === 'string' ? setShowContent(false) : setRoles(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener la lista de Roles", error);
      });
  };
//corregir este metodo
  const fetchEmpresas = () => {
    EmpresaService.getAll()
      .then((response) => {
        if (Array.isArray(response.data)) setEmpresas(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener empresas", error);
      });
  };

  useEffect(() => {
    fetchEmpresas();
    fetchRoles();
  }, []);

  // Obtener uno (editar)
  const fetchRol = (id: number) => {
    RolService.get(id)
      .then((response) => {
        setEditedRol(response.data);
        setModalType('edit');
      })
      .catch((error) => {
        console.error("Hubo un error al obtener el rol", error);
      });
  };

  // Crear
  const createRol = (data: Rol) => {
    RolService.create(data)
      .then(() => {
        setEditedRol(defaultRol);
        closeModal();
        fetchRoles();
      })
      .catch((error) => {
        console.error("Hubo un error al crear el rol", error);
        alert(`Error al crear rol:\n${formatApiError(error)}`);
      });
  };

  // Actualizar
  const updateRol = (data: Rol) => {
    RolService.update(data)
      .then(() => {
        setEditedRol(defaultRol);
        closeModal();
        fetchRoles();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el rol", error);
        alert(`Error al actualizar rol:\n${formatApiError(error)}`);
      });
  };

  // Eliminar
  const deleteRol = () => {
    RolService.remove(deleteRolId)
      .then(() => {
        setDeleteRolId(defaultRol.id);
        closeModal();
        fetchRoles();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el rol", error);
        alert(`Error al eliminar rol:\n${formatApiError(error)}`);
      });
  };

  // Abrir confirmación de eliminación
  const openDeleteModal = (id: number) => {
    setDeleteRolId(id);
    setModalType('delete');
  };

  // Helper para obtener nombre de empresa por id (si el API no manda rolempresaFk)
  const getEmpresaNombre = (row: Rol) => {
    if (row.rolempresaFk?.nombreComercial) return row.rolempresaFk.nombreComercial;
    const emp = empresas.find(e => e.id === row.empresaId);
    return emp ? emp.nombreComercial : `ID ${row.empresaId}`;
    // Si tu API devuelve "Id" en empresa, ajusta comparaciones.
  };

  // Columnas DataGrid
  const columnas: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'descripcion', headerName: 'Descripción', flex: 2 },
    {
      field: 'empresaId',
      headerName: 'Empresa',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <span>{getEmpresaNombre(params.row as Rol)}</span>
      ),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton onClick={() => fetchRol(params.row.id)}>
            <Edit style={{color: 'rgba(241, 218, 6, 1)'}} className="icon-editar" />     
          </IconButton>
          <IconButton onClick={() => openDeleteModal(params.row.id)}>
            <Delete style={{color: 'rgba(228, 69, 6, 1)'}} className="icon-eliminar" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <div className="contenido">
      <div id="rol" className="bloque-formulario">
        <div><h2>Listado de Roles</h2></div>

        <div className="bloque-botones">
          <button
            style={{ marginTop: '0px' }}
            className="boton-formulario"
            onClick={() => {
              setEditedRol(defaultRol);
              setModalType('create');
            }}>
            Agregar Rol
          </button>

          <div style={{ height: '70%', width: '96%', margin: '1rem' }}>
            <DataGrid
              rows={roles}
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
            title={modalType === 'create' ? "Agregar Rol" : "Editar Rol"}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del rol"
                    value={editedRol.nombre || ''}
                    onChange={(e) => setEditedRol(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Descripción</label>
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={editedRol.descripcion || ''}
                    onChange={(e) => setEditedRol(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Empresa</label>
                  <select
                    className="form-control"
                    value={editedRol.empresaId || 0}
                    onChange={(e) => setEditedRol(prev => ({ ...prev, empresaId: Number(e.target.value) }))}
                     style={{backgroundColor: 'rgb(10, 70, 120)', color:'white'}}
                    required
                  >
                    <option value={0} disabled>Seleccione una empresa</option>
                    {empresas.map(emp => (
                      <option  style={{backgroundColor: 'rgb(10, 70, 120)', color:'white'}} key={emp.id} value={emp.id}>{emp.nombreComercial}</option>
                    ))}
                  </select>
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createRol(editedRol);
              } else {
                updateRol(editedRol);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el rol ${roles.find(r => r.id === deleteRolId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteRol}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
}
