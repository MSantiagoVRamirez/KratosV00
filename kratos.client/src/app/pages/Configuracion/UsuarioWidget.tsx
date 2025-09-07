// components/Seguridad/UsuarioWidget.tsx
import { useEffect, useMemo, useState } from 'react';
import { Usuario } from '../../interfaces/Configuracion/Usuario';
import UsuarioService from '../../services/Configuracion/UsuarioService';
import '../../Styles/estilos.css';
import { ModalDialog } from '../components/ModalDialog';
import { grid2ColStyle } from '../../utils';
import { useFormValidation } from '../../hooks/useFormValidation';
import { Rol } from '../../interfaces/Configuracion/Roles';
import RolService from "../../services/Configuracion/RolService";

import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Pagination,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
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

export function UsuarioWidget() {

  const defaultUsuario: Usuario = {
    id: 0,
    rolesId: 0,
    contraseña: '123456789',
    confirmarContraseña: '123456789',
    token: '',
    email: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    estado: true,
    imagenUrl: null,
    imagenArchivo: null
  };

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [editedUsuario, setEditedUsuario] = useState<Usuario>(defaultUsuario);
  const [rol, setRol] = useState<Rol[]>([]);
  const [deleteUsuarioId, setDeleteUsuarioId] = useState<number>(defaultUsuario.id);

  // Mantengo un modelo de paginación parecido al DataGrid
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 8 });
  const pageSizeOptions = [8, 16, 24];

  // Modal de Creación/Edición/Eliminación
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [showContent, setShowContent] = useState(true);
  const closeModal = () => setModalType(null);

  // Validación (requeridos y tipos)
  const isFormValid = useFormValidation({
    rolesId: { value: editedUsuario.rolesId, required: true, type: 'number' },
    contraseña: { value: editedUsuario.contraseña, required: true, type: 'string' },
    confirmarContraseña: { value: editedUsuario.confirmarContraseña, required: true, type: 'string' },
    token: { value: editedUsuario.token, required: true, type: 'string' },
    email: { value: editedUsuario.email, required: true, type: 'email' },
    nombres: { value: editedUsuario.nombres, required: true, type: 'string' },
    apellidos: { value: editedUsuario.apellidos, required: true, type: 'string' },
    telefono: { value: editedUsuario.telefono, required: true, type: 'string' },
  });

  // Obtener todos
  const fetchListaUsuarios = () => {
    UsuarioService.getAll()
      .then((response) => {
        typeof response.data === 'string' ? setShowContent(false) : setUsuarios(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener la lista de Usuarios', error);
      });
  };
    const fetchRol = () => {
      RolService.getAll()
        .then((response) => {
          if (Array.isArray(response.data)) setRol(response.data);
        })
        .catch((error) => {
          console.error("Error al obtener empresas", error);
        });
    };

  useEffect(() => {
    fetchListaUsuarios();
    fetchRol();
  }, []);

  // Obtener uno (editar)
  const fetchUsuario = (id: number) => {
    UsuarioService.get(id)
      .then((response) => {
        // Normaliza nombres de propiedades por si el backend usa 'ImagenUrl'
        const data = response.data as any;
        const normalized: Usuario = {
          ...defaultUsuario,
          ...data,
          imagenUrl: data.imagenUrl ?? data.ImagenUrl ?? null,
          imagenArchivo: null,
        };
        setEditedUsuario(normalized);
        setModalType('edit');
      })
      .catch((error) => {
        console.error('Hubo un error al obtener el usuario', error);
      });
  };

  // Crear
  const createUsuario = (data: Usuario) => {
    if (data.contraseña !== data.confirmarContraseña) {
      alert('Las contraseñas no coinciden');
      return;
    }
    UsuarioService.create(data)
      .then(() => {
        setEditedUsuario(defaultUsuario);
        closeModal();
        fetchListaUsuarios();
      })
      .catch((error) => {
        console.error('Hubo un error al crear el usuario', error);
        alert(`Error al crear usuario:\n${formatApiError(error)}`);
      });
  };

  // Actualizar
  const updateUsuario = (data: Usuario) => {
    if (data.contraseña !== data.confirmarContraseña) {
      alert('Las contraseñas no coinciden');
      return;
    }
    UsuarioService.update(data)
      .then(() => {
        setEditedUsuario(defaultUsuario);
        closeModal();
        fetchListaUsuarios();
      })
      .catch((error) => {
        console.error('Hubo un error al actualizar el usuario', error);
        alert(`Error al actualizar usuario:\n${formatApiError(error)}`);
      });
  };

  // Eliminar
  const deleteUsuario = () => {
    UsuarioService.remove(deleteUsuarioId)
      .then(() => {
        setDeleteUsuarioId(defaultUsuario.id);
        closeModal();
        fetchListaUsuarios();
      })
      .catch((error) => {
        console.error('Hubo un error al eliminar el usuario', error);
        alert(`Error al eliminar usuario:\n${formatApiError(error)}`);
      });
  };

  // Abrir confirmación de eliminación
  const openDeleteModal = (id: number) => {
    setDeleteUsuarioId(id);
    setModalType('delete');
  };

  // Paginación de tarjetas
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(usuarios.length / paginationModel.pageSize)),
    [usuarios.length, paginationModel.pageSize]
  );

  const pagedUsuarios = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return usuarios.slice(start, end);
  }, [usuarios, paginationModel]);

  return (
    <div className="contenido">
      <div id="proveedor" className="bloque-formulario">
        <div><h2>Listado de Usuarios</h2></div>

        <div className="bloque-botones">
          <button
            style={{ marginTop: '0px' }}
            className="boton-formulario"
            onClick={() => {
              setEditedUsuario(defaultUsuario);
              setModalType('create');
            }}>
            Agregar Usuario
          </button>
        </div>

        {/* Listado como Tarjetas */}
        <Box sx={{ width: '100%', mt: 2, px: 2 }}>
          <Grid container spacing={2}>
            {pagedUsuarios.map((u) => (
              <Grid >
                <Card className="user-card" sx={{ height: '100%' }}>
                  <CardHeader
                    avatar={
                      <Avatar
                        src={u.imagenUrl ?? undefined}
                        alt={`${u.nombres} ${u.apellidos}`}
                        className="user-avatar"
                      >
                        {(!u.imagenUrl && u.nombres) ? u.nombres[0]?.toUpperCase() : ''}
                      </Avatar>
                    }
                    title={
                      <Typography variant="subtitle1" className="user-title">
                        {u.nombres} {u.apellidos}
                      </Typography>
                    }
                    subheader={
                       <Typography variant="caption" className="user-subtitle">
                        ID: {u.id} • Rol: {rol.find(r => r.id === u.rolesId)?.nombre ?? `#${u.rolesId}`}
                       </Typography>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ pt: 1 }}>
                    <Typography variant="body2" className="user-field">
                      <strong>Email:</strong> {u.email}
                    </Typography>
                    <Typography variant="body2" className="user-field">
                      <strong>Teléfono:</strong> {u.telefono}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={u.estado ? 'Activo' : 'Inactivo'}
                        color={u.estado ? 'success' : 'default'}
                        size="medium"
                        className="user-chip"
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Tooltip title="Editar">
                      <IconButton  onClick={() => fetchUsuario(u.id)}>
                        <Edit className="icon-editar" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => openDeleteModal(u.id)}>
                        <Delete className="icon-eliminar" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Controles de paginación similares al DataGrid */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="page-size-label" sx={{ color: '#fff' }}>Tamaño página</InputLabel>
              <Select
                labelId="page-size-label"
                label="Tamaño página"
                value={paginationModel.pageSize}
                onChange={(e) => setPaginationModel(p => ({ ...p, pageSize: Number(e.target.value), page: 0 }))}
                className="mui-select-light"
              >
                {pageSizeOptions.map(ps => (
                  <MenuItem key={ps} value={ps}>{ps}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Pagination
              count={totalPages}
              page={paginationModel.page + 1}
              onChange={(_, newPage) => setPaginationModel(p => ({ ...p, page: newPage - 1 }))}
            />
          </Box>
        </Box>

        {/* Formulario Unificado (Crear/Editar) */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? 'Agregar Usuario' : 'Editar Usuario'}
            isFormValid={isFormValid}
            content={
              <div style={grid2ColStyle}>
                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Nombres</label>
                  <input
                    type="text"
                    value={editedUsuario.nombres}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, nombres: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Apellidos</label>
                  <input
                    type="text"
                    value={editedUsuario.apellidos}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, apellidos: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Email</label>
                  <input
                    type="email"
                    value={editedUsuario.email}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, email: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Teléfono</label>
                  <input
                    type="text"
                    value={editedUsuario.telefono}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, telefono: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                
                <div className="form-group">
                <label style={{ color: 'white' }} className="form-label required">Rol</label>
             <select
                value={editedUsuario.rolesId}
                onChange={(e) => setEditedUsuario(prev => ({ ...prev, rolesId: Number(e.target.value) }))}
                className="form-control"
                required
                >
                <option value={0}>Seleccione un rol</option>
                {rol.map(r => (
                <option key={r.id} value={r.id}>
                {r.nombre}
                 </option>
                ))}
                </select>
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Token</label>
                  <input
                    type="text"
                    value={editedUsuario.token}
                    onChange={(e) => setEditedUsuario(prev => ({ ...prev, token: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label">Imagen (opcional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setEditedUsuario(prev => ({ ...prev, imagenArchivo: file }));
                    }}
                    className="form-control"
                  />
                  {(editedUsuario.imagenArchivo || editedUsuario.imagenUrl) && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img
                        src={editedUsuario.imagenArchivo ? URL.createObjectURL(editedUsuario.imagenArchivo) : (editedUsuario.imagenUrl as string)}
                        alt="Preview"
                        style={{ maxWidth: '180px', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editedUsuario.estado}
                        onChange={(e) => setEditedUsuario(prev => ({ ...prev, estado: e.target.checked }))}
                      />
                    }
                    label={<span style={{ color: 'white' }}>Usuario Activo</span>}
                  />
                </div>
              </div>
            }
            textBtn="Guardar"
            onConfirm={() => {
              if (modalType === 'create') {
                createUsuario(editedUsuario);
              } else {
                updateUsuario(editedUsuario);
              }
            }}
            closeModal={closeModal}
          />
        )}

        {/* Confirmación de Eliminación */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el usuario ${usuarios.find(x => x.id === deleteUsuarioId)?.nombres} ${usuarios.find(x => x.id === deleteUsuarioId)?.apellidos}?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteUsuario}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
}
