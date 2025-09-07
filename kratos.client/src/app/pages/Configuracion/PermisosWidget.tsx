import { useEffect, useState } from "react";
import { Permiso } from "../../interfaces/Configuracion/Permiso";
import { Rol } from "../../interfaces/Configuracion/Roles";
import { Modulo } from "../../interfaces/Configuracion/Modulo";
import PermisoService from "../../services/Configuracion/PermisoService";
import RolService from "../../services/Configuracion/RolService";
import ModuloService from "../../services/Configuracion/ModuloService";
import '../../Styles/estilos.css';
import { ModalDialog } from "../components/ModalDialog";
import { grid2ColStyle } from "../../utils";
import { useFormValidation } from "../../hooks/useFormValidation";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton, Chip, Switch, FormControlLabel } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

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

export function PermisoWidget() {

  const defaultPermiso: Permiso = {
    id: 0,
    rolesId: 0,
    permisosrolesId: null,
    modulosId: 0,
    permisosmodulosId: null,
    nombre: '',
    descripcion: '',
    codigo: '',
    consultar: false,
    leer: false,
    insertar: false,
    editar: false,
    eliminar: false,
    importar: false,
    exportar: false,
  };

  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [editedPermiso, setEditedPermiso] = useState<Permiso>(defaultPermiso);
  const [deletePermisoId, setDeletePermisoId] = useState<number>(defaultPermiso.id);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

  // Modal
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [showContent, setShowContent] = useState(true);

  const closeModal = () => setModalType(null);

  // Validación (según modelo: MaxLength 100)
  const isFormValid = useFormValidation({
    rolesId:     { value: editedPermiso.rolesId,     required: true, type: 'number' },
    modulosId:   { value: editedPermiso.modulosId,   required: true, type: 'number' },
    nombre:      { value: editedPermiso.nombre,      required: true, type: 'string' },
    descripcion: { value: editedPermiso.descripcion, required: true, type: 'string' },
    codigo:      { value: editedPermiso.codigo,      required: true, type: 'string' },
    consultar:   { value: editedPermiso.consultar,   required: false, type: 'boolean' },
    leer:        { value: editedPermiso.leer,        required: false, type: 'boolean' },
    insertar:    { value: editedPermiso.insertar,    required: false, type: 'boolean' },
    editar:      { value: editedPermiso.editar,      required: false, type: 'boolean' },
    eliminar:    { value: editedPermiso.eliminar,    required: false, type: 'boolean' },
    importar:    { value: editedPermiso.importar,    required: false, type: 'boolean' },
    exportar:    { value: editedPermiso.exportar,    required: false, type: 'boolean' },
  });

  // Cargas iniciales
  const fetchPermisos = () => {
    PermisoService.getAll()
      .then((response) => {
        typeof response.data === 'string' ? setShowContent(false) : setPermisos(response.data);
      })
      .catch((error) => console.error("Error al obtener la lista de Permisos", error));
  };
  const fetchRoles = () => {
    RolService.getAll()
      .then((response) => { if (Array.isArray(response.data)) setRoles(response.data); })
      .catch((error) => console.error("Error al obtener roles", error));
  };
  const fetchModulos = () => {
    ModuloService.getAll()
      .then((response) => { if (Array.isArray(response.data)) setModulos(response.data); })
      .catch((error) => console.error("Error al obtener módulos", error));
  };

  useEffect(() => {
    fetchRoles();
    fetchModulos();
    fetchPermisos();
  }, []);

  // Operaciones CRUD
  const fetchPermiso = (id: number) => {
    PermisoService.get(id)
      .then((response) => {
        setEditedPermiso(response.data);
        setModalType('edit');
      })
      .catch((error) => console.error("Hubo un error al obtener el permiso", error));
  };

  const createPermiso = (data: Permiso) => {
    PermisoService.create(data)
      .then(() => { setEditedPermiso(defaultPermiso); closeModal(); fetchPermisos(); })
      .catch((error) => { console.error("Hubo un error al crear el permiso", error); alert(`Error al crear permiso:\n${formatApiError(error)}`); });
  };

  const updatePermiso = (data: Permiso) => {
    PermisoService.update(data)
      .then(() => { setEditedPermiso(defaultPermiso); closeModal(); fetchPermisos(); })
      .catch((error) => { console.error("Hubo un error al actualizar el permiso", error); alert(`Error al actualizar permiso:\n${formatApiError(error)}`); });
  };

  const deletePermiso = () => {
    PermisoService.remove(deletePermisoId)
      .then(() => { setDeletePermisoId(defaultPermiso.id); closeModal(); fetchPermisos(); })
      .catch((error) => { console.error("Hubo un error al eliminar el permiso", error); alert(`Error al eliminar permiso:\n${formatApiError(error)}`); });
  };

  const openDeleteModal = (id: number) => { setDeletePermisoId(id); setModalType('delete'); };

  // Helpers
  const getRolNombre = (row: Permiso) => {
    if (row.permisosrolesId?.nombre) return row.permisosrolesId.nombre;
    const r = roles.find(x => x.id === row.rolesId);
    return r ? r.nombre : `Rol ID ${row.rolesId}`;
  };
  const getModuloNombre = (row: Permiso) => {
    if (row.permisosmodulosId?.nombre) return row.permisosmodulosId.nombre;
    const m = modulos.find(x => x.id === row.modulosId);
    return m ? m.nombre : `Módulo ID ${row.modulosId}`;
  };

  // Render boolean como chip
  const BoolChip = ({ v }: { v: boolean }) => (
    <Chip label={v ? 'Autorizado' : 'No Autorizado'} color={v ? 'success' : 'default'} size="small" sx={{ fontWeight: 'bold' }} />
  );

  // Columnas DataGrid
  const columnas: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'descripcion', headerName: 'Descripción', flex: 2 },
    { field: 'codigo', headerName: 'Código', flex: 1 },
    { field: 'rolesId', headerName: 'Rol', flex: 1, renderCell: (params: GridRenderCellParams) => <span>{getRolNombre(params.row as Permiso)}</span> },
    { field: 'modulosId', headerName: 'Módulo', flex: 1, renderCell: (params: GridRenderCellParams) => <span>{getModuloNombre(params.row as Permiso)}</span> },
    { field: 'consultar', headerName: 'Consultar', width: 110, type: 'boolean', renderCell: (p) => <BoolChip v={!!p.value} /> },
    { field: 'leer', headerName: 'Leer', width: 90, type: 'boolean', renderCell: (p) => <BoolChip v={!!p.value} /> },
    { field: 'insertar', headerName: 'Insertar', width: 110, type: 'boolean', renderCell: (p) => <BoolChip v={!!p.value} /> },
    { field: 'editar', headerName: 'Editar', width: 90, type: 'boolean', renderCell: (p) => <BoolChip v={!!p.value} /> },
    { field: 'eliminar', headerName: 'Eliminar', width: 110, type: 'boolean', renderCell: (p) => <BoolChip v={!!p.value} /> },
    { field: 'importar', headerName: 'Importar', width: 110, type: 'boolean', renderCell: (p) => <BoolChip v={!!p.value} /> },
    { field: 'exportar', headerName: 'Exportar', width: 110, type: 'boolean', renderCell: (p) => <BoolChip v={!!p.value} /> },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton onClick={() => fetchPermiso(params.row.id)}>
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
      <div id="permiso" className="bloque-formulario">
        <div><h2>Listado de Permisos</h2></div>

        <div className="bloque-botones">
          <button
            style={{ marginTop: '0px' }}
            className="boton-formulario"
            onClick={() => { setEditedPermiso(defaultPermiso); setModalType('create'); }}>
            Agregar Permiso
          </button>

          <div style={{ height: '70%', width: '96%', margin: '1rem' }}>
            <DataGrid
              rows={permisos}
              columns={columnas}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 15]}

            />
          </div>
        </div>

        {/* Formulario Unificado */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? "Agregar Permiso" : "Editar Permiso"}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                {/* Relación Rol */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Rol</label>
                  <select
                    className="form-control"
                    value={editedPermiso.rolesId || 0}
                    onChange={(e) => setEditedPermiso(prev => ({ ...prev, rolesId: Number(e.target.value) }))}
                    required
                  >
                    <option value={0} disabled>Seleccione un rol</option>
                    {roles.map(r => (<option key={r.id} value={r.id}>{r.nombre}</option>))}
                  </select>
                </div>

                {/* Relación Módulo */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Módulo</label>
                  <select
                    className="form-control"
                    value={editedPermiso.modulosId || 0}
                    onChange={(e) => setEditedPermiso(prev => ({ ...prev, modulosId: Number(e.target.value) }))}
                    required
                  >
                    <option value={0} disabled>Seleccione un módulo</option>
                    {modulos.map(m => (<option key={m.id} value={m.id}>{m.nombre}</option>))}
                  </select>
                </div>

                {/* Campos básicos */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Nombre</label>
                  <input
                    type="text"
                    placeholder="Nombre del permiso"
                    value={editedPermiso.nombre || ''}
                    onChange={(e) => setEditedPermiso(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Descripción</label>
                  <input
                    type="text"
                    placeholder="Descripción"
                    value={editedPermiso.descripcion || ''}
                    onChange={(e) => setEditedPermiso(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Código</label>
                  <input
                    type="text"
                    placeholder="Código"
                    value={editedPermiso.codigo || ''}
                    onChange={(e) => setEditedPermiso(prev => ({ ...prev, codigo: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                {/* Flags booleanos */}
                <div className="form-group" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '0.5rem' }}>
                  {([
                    ['consultar','Consultar'],
                    ['leer','Leer'],
                    ['insertar','Insertar'],
                    ['editar','Editar'],
                    ['eliminar','Eliminar'],
                    ['importar','Importar'],
                    ['exportar','Exportar'],
                  ] as const).map(([key, label]) => (
                    <FormControlLabel
                      key={key}
                      control={
                        <Switch
                          checked={!!(editedPermiso as any)[key]}
                          onChange={(e) => setEditedPermiso(prev => ({ ...prev, [key]: e.target.checked } as any))}
                        />
                      }
                      label={<span style={{ color: 'white' }}>{label}</span>}
                    />
                  ))}
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') createPermiso(editedPermiso);
              else updatePermiso(editedPermiso);
            }}
            closeModal={closeModal}
          />
        )}

        {/* Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el permiso ${permisos.find(p => p.id === deletePermisoId)?.nombre}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deletePermiso}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
}
