import { useEffect, useMemo, useState } from 'react';
import '../../Styles/estilos.css';
import { ModalDialog } from '../components/ModalDialog';
import { useFormValidation } from '../../hooks/useFormValidation';
import { grid2ColStyle } from '../../utils';

import { Box, Card, CardContent, CardHeader, Typography, IconButton, Tooltip, Grid, Pagination } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

import ProveedorService from '../../services/Ventas/ProveedorService';
import { Proveedor } from '../../interfaces/Ventas/Proveedor';

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

export function ProveedoresWidget() {
  const defaultItem: Proveedor = {
    id: 0,
    empresaId: 0, // se fija en servidor
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  };

  const [items, setItems] = useState<Proveedor[]>([]);
  const [edited, setEdited] = useState<Proveedor>(defaultItem);
  const [deleteId, setDeleteId] = useState<number>(0);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 8 });

  const closeModal = () => setModalType(null);

  const isFormValid = useFormValidation({
    nombre:   { value: edited.nombre, required: true, type: 'string' },
    email:    { value: edited.email, required: true, type: 'email' },
    telefono: { value: edited.telefono, required: true, type: 'string' },
  });

  const fetchAll = () => {
    setLoading(true);
    setError(null);
    ProveedorService.getAll()
      .then((resp) => setItems(Array.isArray(resp.data) ? resp.data : []))
      .catch((err) => {
        console.error('Error al cargar proveedores', err);
        setError(formatApiError(err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEdited(defaultItem); setModalType('create'); };
  const openEdit = (id: number) => {
    setLoading(true);
    ProveedorService.get(id)
      .then(resp => { setEdited(resp.data as Proveedor); setModalType('edit'); })
      .catch(err => {
        console.error('Error al consultar proveedor', err);
        alert(`No fue posible consultar:\n${formatApiError(err)}`);
      })
      .finally(() => setLoading(false));
  };
  const openDelete = (id: number) => { setDeleteId(id); setModalType('delete'); };

  const createItem = () => {
    setSaving(true);
    ProveedorService.create(edited)
      .then(() => { closeModal(); fetchAll(); })
      .catch(err => { console.error('Error al crear proveedor', err); alert(`Error al crear:\n${formatApiError(err)}`); })
      .finally(() => setSaving(false));
  };
  const updateItem = () => {
    setSaving(true);
    ProveedorService.update(edited)
      .then(() => { closeModal(); fetchAll(); })
      .catch(err => { console.error('Error al actualizar proveedor', err); alert(`Error al actualizar:\n${formatApiError(err)}`); })
      .finally(() => setSaving(false));
  };
  const deleteItem = () => {
    ProveedorService.remove(deleteId)
      .then(() => { closeModal(); fetchAll(); })
      .catch(err => { console.error('Error al eliminar proveedor', err); alert(`Error al eliminar:\n${formatApiError(err)}`); });
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / paginationModel.pageSize)),
    [items.length, paginationModel.pageSize]
  );
  const pageItems = useMemo(() => {
    const start = paginationModel.page * paginationModel.pageSize;
    const end = start + paginationModel.pageSize;
    return items.slice(start, end);
  }, [items, paginationModel]);

  return (
    <div className="contenido">
      <div id="proveedor" className="bloque-formulario">
        <div><h2>Listado de Proveedores</h2></div>

        <div className="bloque-botones">
          <button
            style={{ marginTop: '0px' }}
            className="boton-formulario"
            onClick={openCreate}
          >
            Agregar Proveedor
          </button>
        </div>

        {/* Listado como Tarjetas */}
        <Box sx={{ width: '100%', mt: 2, px: 2 }}>
          {loading && <div>Cargando...</div>}
          {error && <div className="text-danger">{error}</div>}

          <Grid container spacing={2}>
            {pageItems.map(p => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
                <Card className="user-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardHeader
                    title={
                      <Box>
                        <Typography variant="subtitle1" className="user-title">
                          {p.nombre}
                        </Typography>
                        <Typography variant="caption" className="user-subtitle">
                          ID: {p.id}
                        </Typography>
                      </Box>
                    }
                    action={
                      <Box>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => openEdit(p.id)}>
                            <Edit className="icon-editar" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton onClick={() => openDelete(p.id)}>
                            <Delete className="icon-eliminar" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    }
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ pt: 1 }}>
                    <Box className="user-field" sx={{ mb: 1 }}><strong>Email:</strong> {p.email}</Box>
                    <Box sx={{ mb: 1 }}><strong>Teléfono:</strong> {p.telefono}</Box>
                    <Box sx={{ mb: 1 }}><strong>Dirección:</strong> {p.direccion ?? '-'}</Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={paginationModel.page + 1}
              onChange={(_, value) => setPaginationModel(prev => ({ ...prev, page: value - 1 }))}
              color="primary"
            />
          </Box>
        </Box>

        {/* Modal Crear/Editar */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? 'Crear Proveedor' : 'Editar Proveedor'}
            isFormValid={isFormValid}
            textBtn={'Guardar'}
            onConfirm={() => { modalType === 'create' ? createItem() : updateItem(); }}
            closeModal={closeModal}
            content={
              <div style={grid2ColStyle as any}>
                <div className="form-group">
                  <label className="form-label label-light required">Nombre</label>
                  <input
                    type="text"
                    value={edited.nombre}
                    onChange={(e) => setEdited(prev => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label label-light required">Email</label>
                  <input
                    type="email"
                    value={edited.email}
                    onChange={(e) => setEdited(prev => ({ ...prev, email: e.target.value }))}
                    className="form-control"
                    maxLength={100}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label label-light required">Teléfono</label>
                  <input
                    type="text"
                    value={edited.telefono}
                    onChange={(e) => setEdited(prev => ({ ...prev, telefono: e.target.value }))}
                    className="form-control"
                    maxLength={50}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label label-light">Dirección</label>
                  <input
                    type="text"
                    value={edited.direccion ?? ''}
                    onChange={(e) => setEdited(prev => ({ ...prev, direccion: e.target.value }))}
                    className="form-control"
                    maxLength={100}
                  />
                </div>
              </div>
            }
          />
        )}

        {/* Modal Eliminar */}
        {modalType === 'delete' && (
          <ModalDialog
            title={'Eliminar Proveedor'}
            content={`¿Está seguro que desea eliminar el proveedor "${items.find(x => x.id === deleteId)?.nombre}"?`}
            textBtn={'Eliminar'}
            confirmButtonClass={'btn-danger'}
            onConfirm={deleteItem}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
}
