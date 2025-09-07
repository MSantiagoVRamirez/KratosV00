import { useEffect, useMemo, useState } from 'react';
import '../../Styles/estilos.css';
import { ModalDialog } from '../components/ModalDialog';
import { grid2ColStyle } from '../../utils';
import { useFormValidation } from '../../hooks/useFormValidation';

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid'; // 👈 Grid v2
import { Edit, Delete } from '@mui/icons-material';

// Servicios / interfaces
import PuntoVentaService from '../../services/Ventas/PuntoVentaService';
import { PuntoVenta } from '../../interfaces/Ventas/PuntoVenta';

import  { Empresa } from '../../interfaces/Configuracion/Empresa'
import EmpresaService from '../../services/Configuracion/EmpresaService';
import UsuarioService from '../../services/Configuracion/UsuarioService';
import { Usuario } from '../../interfaces/Configuracion/Usuario';

// Helper para errores legibles
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

export function PuntoVentaWidget() {
  const defaultPV: PuntoVenta = {
    id: 0,
    nombre: '',
    direccion: '',
    telefono: '',
    responsableId: 0,
    activo: true,
    empresaId: 0,
    // creadoEn / actualizadoEn opcionales
  };

  const [items, setItems] = useState<PuntoVenta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ empresas, setEmpresas] = useState<Empresa[]>([]); 

  const [edited, setEdited] = useState<PuntoVenta>(defaultPV);
  const [deleteId, setDeleteId] = useState<number>(0);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const closeModal = () => setModalType(null);

  // Validaciones básicas
  const isFormValid = useFormValidation({
    nombre:        { value: edited.nombre, required: true, type: 'string' },
    direccion:     { value: edited.direccion, required: true, type: 'string' },
    telefono:      { value: edited.telefono, required: true, type: 'string' },
    responsableId: { value: edited.responsableId, required: true, type: 'number' },
  });

  // Cargar PV + Usuarios
  const fetchAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      PuntoVentaService.getAll(),  // GET /api/PuntoVentas/leer
      UsuarioService.getAll(),     // Ajusta si tu endpoint es distinto
      EmpresaService.getAll(),
    ])
      .then(([pvResp, usrResp, empResp]) => {
        setItems(Array.isArray(pvResp.data) ? pvResp.data : []);
        setUsuarios(Array.isArray(usrResp.data) ? usrResp.data : []);
        setEmpresas(Array.isArray(empResp.data) ? empResp.data: []);
      })
      .catch((err) => {
        console.error('Error al cargar puntos de venta/usuarios', err);
        setError(formatApiError(err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getResponsableNombre = (id: number) => {
    const u = usuarios.find(x => x.id === id);
    if (!u) return `ID ${id}`;
    const full = `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim();
    return full || u.email || `ID ${id}`;
  };

  const getEmpresaNombre = (id: number) => {
    const e = empresas.find(e => e.id === id );
    if (!e) return `ID ${id}`;
    const full = `${e.nombreComercial ?? ''}`.trim();
    return full;
  }

  const openCreate = () => {
    setEdited(defaultPV);
    setModalType('create');
  };

  const openEdit = (id: number) => {
    setLoading(true);
    PuntoVentaService.get(id) // GET /api/PuntoVentas/consultar?Id=#
      .then(resp => {
        setEdited(resp.data as PuntoVenta);
        setModalType('edit');
      })
      .catch(err => {
        console.error('Error al consultar punto de venta', err);
        alert(`No fue posible consultar:\n${formatApiError(err)}`);
      })
      .finally(() => setLoading(false));
  };

  const openDelete = (id: number) => {
    setDeleteId(id);
    setModalType('delete');
  };

  const createItem = () => {
    setSaving(true);
    PuntoVentaService.create(edited) // POST /api/PuntoVentas/insertar
      .then(() => {
        closeModal();
        fetchAll();
      })
      .catch(err => {
        console.error('Error al crear punto de venta', err);
        alert(`Error al crear:\n${formatApiError(err)}`);
      })
      .finally(() => setSaving(false));
  };

  const updateItem = () => {
    setSaving(true);
    PuntoVentaService.update(edited) // PUT /api/PuntoVentas/editar
      .then(() => {
        closeModal();
        fetchAll();
      })
      .catch(err => {
        console.error('Error al actualizar punto de venta', err);
        alert(`Error al actualizar:\n${formatApiError(err)}`);
      })
      .finally(() => setSaving(false));
  };

  const deleteItem = () => {
    PuntoVentaService.remove(deleteId) // DELETE /api/PuntoVentas/eliminar?Id=#
      .then(() => {
        closeModal();
        fetchAll();
      })
      .catch(err => {
        console.error('Error al eliminar punto de venta', err);
        alert(`Error al eliminar:\n${formatApiError(err)}`);
      });
  };

  // Tarjeta (misma estética que usuarios)
  const CardPV = (pv: PuntoVenta) => (
    <Card
      key={pv.id}
      className="user-card"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={
          <Box>
            <Typography variant="subtitle1" className="user-title">
              {pv.nombre}
            </Typography>
            <Typography variant="caption" className="user-subtitle">
              ID: {pv.id}
            </Typography>
          </Box>
        }
        action={
          <Box>
            <Tooltip title="Editar">
              <IconButton onClick={() => openEdit(pv.id)}>
                <Edit className="icon-editar" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton onClick={() => openDelete(pv.id)}>
                <Delete className="icon-eliminar" />
              </IconButton>
            </Tooltip>
          </Box>
        }
        sx={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 1 }}>
          <strong>Dirección:</strong> {pv.direccion || '-'}
        </Box>
        <Box sx={{ mb: 1 }}>
          <strong>Teléfono:</strong> {pv.telefono || '-'}
        </Box>
        <Box sx={{ mb: 1 }}>
          <strong>Responsable:</strong> {getResponsableNombre(pv.responsableId)}
        </Box>
        <Box sx={{ mb: 1 }}>
          <strong>Empresa:</strong> {getEmpresaNombre(pv.empresaId)}
        </Box>
        <Box sx={{ mb: 1 }}>
          <strong>Estado:</strong>{' '}
          <Chip
            label={pv.activo ? 'Activo' : 'Inactivo'}
            color={pv.activo ? 'success' : 'default'}
            size="small"
            className="user-chip"
          />
        </Box>
        <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, fontSize: '0.85rem' }}>
          <div><strong>Creado:</strong> {pv.creadoEn ? new Date(pv.creadoEn).toLocaleString() : '-'}</div>
          <div><strong>Actualizado:</strong> {pv.actualizadoEn ? new Date(pv.actualizadoEn).toLocaleString() : '-'}</div>
        </Box>
      </CardContent>
    </Card>
  );

  // Paginado simple en cliente
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const pageItems = useMemo(() => {
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page]);

  return (
    <div className="contenido">
      <div id="puntos-venta" className="bloque-formulario">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Listado de Puntos de Venta</h2>
          <button className="boton-formulario" onClick={openCreate}>
            Agregar Punto de Venta
          </button>
        </div>

        {loading && <p style={{ color: '#fff' }}>Cargando...</p>}
        {error && <p style={{ color: '#ffb3b3' }}>{error}</p>}

        {!loading && !error && (
          <>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {pageItems.map((pv) => (
                <Grid key={pv.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  {CardPV(pv)}
                </Grid>
              ))}

              {pageItems.length === 0 && (
                <Grid size={12}>
                  <Card className="user-card" sx={{ p: 2 }}>
                    <Typography>No hay puntos de venta registrados.</Typography>
                  </Card>
                </Grid>
              )}
            </Grid>

            {/* Paginación simple */}
            {items.length > pageSize && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8, mt: 2 }}>
                <button
                  className="boton-formulario"
                  style={{ opacity: page === 0 ? 0.6 : 1 }}
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Anterior
                </button>
                <button
                  className="boton-formulario"
                  style={{ opacity: (page + 1) * pageSize >= items.length ? 0.6 : 1 }}
                  disabled={(page + 1) * pageSize >= items.length}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </button>
              </Box>
            )}
          </>
        )}

        {/* Modal Crear/Editar */}
        {(modalType === 'create' || modalType === 'edit') && (
          <ModalDialog
            title={modalType === 'create' ? 'Agregar Punto de Venta' : 'Editar Punto de Venta'}
            isFormValid={isFormValid}
            textBtn={saving ? 'Guardando...' : 'Guardar'}
            onConfirm={modalType === 'create' ? createItem : updateItem}
            closeModal={closeModal}
            content={
              <div style={grid2ColStyle}>
                <div className="form-group">
                  <label className="form-label required label-light">Nombre</label>
                  <input
                    type="text"
                    value={edited.nombre}
                    onChange={(e) => setEdited((prev) => ({ ...prev, nombre: e.target.value }))}
                    className="form-control"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required label-light">Teléfono</label>
                  <input
                    type="text"
                    value={edited.telefono}
                    onChange={(e) => setEdited((prev) => ({ ...prev, telefono: e.target.value }))}
                    className="form-control"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label required label-light">Dirección</label>
                  <input
                    type="text"
                    value={edited.direccion}
                    onChange={(e) => setEdited((prev) => ({ ...prev, direccion: e.target.value }))}
                    className="form-control"
                    maxLength={100}
                    required
                  />
                </div>
                {/* empresa */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label label-light">Empresa</label>
                  <select
                    className="form-control"
                    value={edited.responsableId || 0}
                    onChange={(e) => setEdited((prev) => ({ ...prev, responsableId: Number(e.target.value) }))}
                    
                  >
                    <option value={0} disabled>-- Seleccione --</option>
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {`${e.nombreComercial ?? ''}`.trim()}
                      </option>
                    ))}
                  </select>
                </div>


                {/* Responsable */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label required label-light">Responsable</label>
                  <select
                    className="form-control"
                    value={edited.responsableId || 0}
                    onChange={(e) => setEdited((prev) => ({ ...prev, responsableId: Number(e.target.value) }))}
                    required
                  >
                    <option value={0} disabled>-- Seleccione --</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {`${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim() || u.email || `ID ${u.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado */}
                <div className="form-group">
                  <label className="form-label label-light">Estado</label>
                  <select
                    className="form-control"
                    value={edited.activo ? '1' : '0'}
                    onChange={(e) => setEdited((prev) => ({ ...prev, activo: e.target.value === '1' }))}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
              </div>
            }
          />
        )}

        {/* Modal Eliminar */}
        {modalType === 'delete' && (
          <ModalDialog
            title="Confirmar Eliminación"
            content={`¿Está seguro que desea eliminar el punto de venta "${items.find((x) => x.id === deleteId)?.nombre}"?`}
            textBtn="Eliminar"
            confirmButtonClass="btn-danger"
            onConfirm={deleteItem}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
}

export default PuntoVentaWidget;
