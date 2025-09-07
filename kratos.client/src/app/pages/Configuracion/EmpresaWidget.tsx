import { useEffect, useState } from 'react';
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
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit } from '@mui/icons-material';

import EmpresaService from '../../services/Configuracion/EmpresaService';
import { Empresa } from '../../interfaces/Configuracion/Empresa';
import { ActividadEconomica } from '../../interfaces/Configuracion/ActividadEconomica';
import { RegimenTributario } from '../../interfaces/Configuracion/RegimenTributario';
import { TipoSociedad } from '../../interfaces/Configuracion/TipoSociedad';

import ActividadEconomicaService from '../../services/Configuracion/ActividadEconomicaService';
import RegimenTributarioService from '../../services/Configuracion/RegimenTributarioService';
import TipoSociedadService from '../../services/Configuracion/TipoSociedadService';

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

// Para convertir archivo a base64 si decides guardar la imagen como string
const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function EmpresaWidget() {
  const defaultEmpresa: Empresa = {
    id: 0,
    contraseña: '',
    confirmarContraseña: '',
    tiposociedadId: 0,
    actividadId: 0,
    regimenId: 0,
    token: '',
    razonSocial: '',
    nombreComercial: '',
    nit: '',
    dv: '',
    telefono: '',
    email: '',
    representanteLegal: '',
    activo: true,
    creadoEn: '',
    actualizadoEn: '',
    imagenUrl: null,
  };

  const [empresa, setEmpresa] = useState<Empresa>(defaultEmpresa);
  const [editedEmpresa, setEditedEmpresa] = useState<Empresa>(defaultEmpresa);
  const [modalType, setModalType] = useState<'edit' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSave, setLoadingSave] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // nombres actuales (detalle)
  const [actividad, setActividad] = useState<ActividadEconomica | null>(null);
  const [regimen, setRegimen] = useState<RegimenTributario | null>(null);
  const [tipoSociedad, setTipoSociedad] = useState<TipoSociedad | null>(null);

  // catálogos para selects (modal)
  const [actividades, setActividades] = useState<ActividadEconomica[]>([]);
  const [regimenes, setRegimenes] = useState<RegimenTributario[]>([]);
  const [tiposSociedad, setTiposSociedad] = useState<TipoSociedad[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(false);

  // imagen local (modal)
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  const closeModal = () => {
    setModalType(null);
    setImagenFile(null);
    setImagenPreview(null);
  };

  // Validación
  const isFormValid = useFormValidation({
    nombreComercial: { value: editedEmpresa.nombreComercial, required: true, type: 'string' },
    razonSocial:     { value: editedEmpresa.razonSocial, required: true, type: 'string' },
    nit:             { value: editedEmpresa.nit, required: true, type: 'string' },
    dv:              { value: editedEmpresa.dv, required: true, type: 'string' },
    telefono:        { value: editedEmpresa.telefono, required: true, type: 'string' },
    email:           { value: editedEmpresa.email, required: true, type: 'email' },
    representanteLegal: { value: editedEmpresa.representanteLegal, required: true, type: 'string' },
    tiposociedadId:  { value: editedEmpresa.tiposociedadId, required: true, type: 'number' },
    actividadId:     { value: editedEmpresa.actividadId, required: true, type: 'number' },
    regimenId:       { value: editedEmpresa.regimenId, required: true, type: 'number' },
  });

  const fetchEmpresa = () => {
    setLoading(true);
    setError(null);
    EmpresaService.get()
      .then((resp) => {
        const data = resp.data as Empresa;
        setEmpresa(data);
        // Traer nombres actuales para el detalle
        if (data.actividadId)   ActividadEconomicaService.get(data.actividadId).then(r => setActividad(r.data)).catch(() => setActividad(null));
        if (data.regimenId)     RegimenTributarioService.get(data.regimenId).then(r => setRegimen(r.data)).catch(() => setRegimen(null));
        if (data.tiposociedadId)TipoSociedadService.get(data.tiposociedadId).then(r => setTipoSociedad(r.data)).catch(() => setTipoSociedad(null));
      })
      .catch((err) => {
        console.error('Error al consultar empresa', err);
        setError(formatApiError(err));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmpresa();
  }, []);

  // Cargar catálogos (solo al abrir el modal, para no pedirlos siempre)
  const loadCatalogs = async () => {
    setCatalogsLoading(true);
    try {
      const [act, reg, tip] = await Promise.all([
        ActividadEconomicaService.getAll().then(r => r.data).catch(() => [] as ActividadEconomica[]),
        RegimenTributarioService.getAll().then(r => r.data).catch(() => [] as RegimenTributario[]),
        TipoSociedadService.getAll().then(r => r.data).catch(() => [] as TipoSociedad[]),
      ]);
      setActividades(act || []);
      setRegimenes(reg || []);
      setTiposSociedad(tip || []);
    } finally {
      setCatalogsLoading(false);
    }
  };

  const openEdit = async () => {
    setEditedEmpresa(prev => ({
      ...prev,
      ...empresa,
      imagenUrl: empresa.imagenUrl ?? '', // editable
    }));
    setImagenFile(null);
    setImagenPreview(null);
    await loadCatalogs();
    setModalType('edit');
  };

  const saveEdit = async () => {
  if (editedEmpresa.contraseña && editedEmpresa.confirmarContraseña &&
      editedEmpresa.contraseña !== editedEmpresa.confirmarContraseña) {
    alert('Las contraseñas no coinciden');
    return;
  }

  setLoadingSave(true);
  try {
    await EmpresaService.update(editedEmpresa, imagenFile /* <- aquí */);
    closeModal();
    fetchEmpresa();
  } catch (err) {
    console.error('Error al actualizar empresa', err);
    alert(`Error al actualizar:\n${formatApiError(err)}`);
  } finally {
    setLoadingSave(false);
  }
};

  const seccion = (title: string, content: React.ReactNode) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'rgb(18, 30, 130)', mb: 0.5 }}>{title}</Typography>
      <Box
        sx={{
          p: 1.5,
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 255,255, 0.5)',
          color: 'rgb(18, 30, 130)',
          lineHeight: 1.6
        }}
      >
        {content}
      </Box>
    </Box>
  );

  const headerActions = (
    <Tooltip title="Editar">
      <IconButton onClick={openEdit}>
        <Edit style={{ color: 'rgba(241, 218, 6, 1)' }} className="icon-editar" />
      </IconButton>
    </Tooltip>
  );

  if (loading) {
    return (
      <div className="contenido">
        <div className="bloque-formulario">
          <h2>Detalles de Empresa</h2>
          <p style={{ color: '#d80d0dff' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenido">
        <div className="bloque-formulario">
          <h2>Detalles de Empresa</h2>
          <p style={{ color: '#dd1b1bff' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div  className="contenido">
      <div id="empresa" className="bloque-formulario">
        <div ><h2>Detalles de Empresa</h2></div>

        <Card
          sx={{
            mt: 1,
            background: 'rgb(227, 227, 236)',
            color: 'rgb(18, 30, 130)',
            borderRadius: '12px',
            margin: "3%"
          }}
        >
          <CardHeader
            title={
              <Box>
                <Typography variant="h6" sx={{ fontSize: "100%", fontWeight: 800, color: 'rgba(255, 255, 255, 1)' }}>
                  {empresa.nombreComercial || 'Empresa'}
                </Typography>
                <Typography variant="caption" sx={{  fontSize: "70%", color: 'rgba(255, 255, 255, 1)' }}>
                  ID: {empresa.id} • NIT: {empresa.nit}-{empresa.dv}
                </Typography>
              </Box>
            }
            action={headerActions}
            sx={{ backgroundColor: "rgb(18, 30, 130)",  borderBottom: '1px solid rgb(18, 30, 130)', pb: 1.5 }}
          />

          {/* Imagen destacada */}
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            {empresa.imagenUrl ? (
              <img
                src={empresa.imagenUrl}
                alt="Logo/Imagen de la empresa"
                style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 10, boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 160,
                  borderRadius: '10px',
                  backgroundColor: 'rgb(18, 30, 130)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                }}
              >
                Sin imagen
              </Box>
            )}
          </Box>

          <CardContent sx={{ fontSize: "110%" }}>
            {/* Sección: Identificación */}
            {seccion('Identificación', (
              <Box>
                <div><strong>Razón Social:</strong> {empresa.razonSocial || '-'}</div>
                <div><strong>Nombre Comercial:</strong> {empresa.nombreComercial || '-'}</div>
                <div><strong>NIT:</strong> {empresa.nit || '-'} <strong>DV:</strong> {empresa.dv || '-'}</div>
              </Box>
            ))}

            {/* Sección: Clasificación (nombres) */}
            {seccion('Clasificación', (
              <Box sx={{ fontSize: "110%", display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                <div><strong>Tipo de Sociedad:</strong> {tipoSociedad?.nombre ?? '-'}</div>
                <div><strong>Actividad Económica:</strong> {actividad?.nombre ?? '-'}</div>
                <div><strong>Régimen Tributario:</strong> {regimen?.nombre ?? '-'}</div>
              </Box>
            ))}

            {/* Sección: Contacto */}
            {seccion('Contacto', (
              <Box sx={{ fontSize: "110%", display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                <div><strong>Teléfono:</strong> {empresa.telefono || '-'}</div>
                <div><strong>Email:</strong> {empresa.email || '-'}</div>
                <div><strong>Representante Legal:</strong> {empresa.representanteLegal || '-'}</div>
              </Box>
            ))}

            {/* Sección: Estado / Sistema */}
            {seccion('Estado y Sistema', (
              <Box sx={{ fontSize: "110%", display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                <div>
                  <strong>Estado:</strong>{' '}
                  <Chip
                    label={empresa.activo ? 'Activo' : 'Inactivo'}
                    color={empresa.activo ? 'success' : 'default'}
                    size="small"
                    sx={{ color: 'rgb(18, 30, 130)' }}
                  />
                </div>
                <div><strong>Creado en:</strong> {empresa.creadoEn ? new Date(empresa.creadoEn).toLocaleString() : '-'}</div>
                <div><strong>Actualizado en:</strong> {empresa.actualizadoEn ? new Date(empresa.actualizadoEn).toLocaleString() : '-'}</div>
              </Box>
            ))}

            <Divider sx={{ my: 2, borderColor: 'rgb(18, 30, 130)' }} />

            
          </CardContent>
        </Card>

        {/* Modal de Edición */}
        {modalType === 'edit' && (
          <ModalDialog
            title="Editar Empresa"
            isFormValid={isFormValid && !catalogsLoading}
            textBtn={loadingSave ? 'Guardando...' : 'Guardar'}
            onConfirm={saveEdit}
            closeModal={closeModal}
            content={
              <div style={grid2ColStyle}>
                {/* Imagen: URL + archivo local */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label">URL de Imagen</label>
                  <input
                    type="text"
                    placeholder="https://tusitio.com/logo.png (opcional si cargas archivo)"
                    value={editedEmpresa.imagenUrl ?? ''}
                    onChange={(e) => {
                      setEditedEmpresa(prev => ({ ...prev, imagenUrl: e.target.value }));
                      setImagenPreview(e.target.value || null);
                      setImagenFile(null);
                    }}
                    className="form-control"
                  />
                  <label style={{ color: 'white', marginTop: '8px' }} className="form-label">Cargar imagen desde tu equipo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setImagenFile(file);
                      setImagenPreview(file ? URL.createObjectURL(file) : (editedEmpresa.imagenUrl || null));
                    }}
                    className="form-control"
                  />
                  {(imagenPreview) && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img
                        src={imagenPreview}
                        alt="Preview"
                        style={{ maxWidth: '220px', borderRadius: '8px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Identificación */}
                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Nombre Comercial</label>
                  <input
                    type="text"
                    value={editedEmpresa.nombreComercial}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, nombreComercial: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Razón Social</label>
                  <input
                    type="text"
                    value={editedEmpresa.razonSocial}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, razonSocial: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">NIT</label>
                  <input
                    type="text"
                    value={editedEmpresa.nit}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, nit: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">DV</label>
                  <input
                    type="text"
                    value={editedEmpresa.dv}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, dv: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                {/* Clasificación con SELECTS */}
                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Tipo de Sociedad</label>
                  <select
                    className="form-control"
                    value={editedEmpresa.tiposociedadId}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, tiposociedadId: Number(e.target.value) }))}
                    disabled={catalogsLoading}
                    required
                  >
                    <option value={0} disabled>-- Seleccione --</option>
                    {tiposSociedad.map(ts => (
                      <option key={ts.id} value={ts.id}>{ts.nombre}</option>
                    ))}
                  </select>
                  <small style={{ color: '#ddd' }}>Actual: {tipoSociedad?.nombre ?? '-'}</small>
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Actividad Económica</label>
                  <select
                    className="form-control"
                    value={editedEmpresa.actividadId}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, actividadId: Number(e.target.value) }))}
                    disabled={catalogsLoading}
                    required
                  >
                    <option value={0} disabled>-- Seleccione --</option>
                    {actividades.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                  <small style={{ color: '#ddd' }}>Actual: {actividad?.nombre ?? '-'}</small>
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Régimen Tributario</label>
                  <select
                    className="form-control"
                    value={editedEmpresa.regimenId}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, regimenId: Number(e.target.value) }))}
                    disabled={catalogsLoading}
                    required
                  >
                    <option value={0} disabled>-- Seleccione --</option>
                    {regimenes.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                  <small style={{ color: '#ddd' }}>Actual: {regimen?.nombre ?? '-'}</small>
                </div>

                {/* Contacto */}
                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Teléfono</label>
                  <input
                    type="text"
                    value={editedEmpresa.telefono}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, telefono: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Email</label>
                  <input
                    type="email"
                    value={editedEmpresa.email}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, email: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Representante Legal</label>
                  <input
                    type="text"
                    value={editedEmpresa.representanteLegal}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, representanteLegal: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                {/* Estado */}
                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label">Estado</label>
                  <select
                    className="form-control"
                    value={editedEmpresa.activo ? '1' : '0'}
                    onChange={(e) => setEditedEmpresa(prev => ({ ...prev, activo: e.target.value === '1' }))}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default EmpresaWidget;
