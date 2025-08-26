// components/Ventas/ProductoCreateWidget.tsx
import { useState } from 'react';
import '../../Styles/estilos.css';
import { grid2ColStyle } from '../../utils';
import { useFormValidation } from '../../hooks/useFormValidation';

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from '@mui/material';

import ProductoService from '../../services/Ventas/ProductoService';
import { Producto } from '../../interfaces/Ventas/Producto';

// Helper de errores legibles (mismo patrón)
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

export function ProductoCreateWidget() {
  const defaultProducto: Producto = {
    id: 0,
    codigo: '',
    nombre: '',
    descripcion: '',
    categoriaId: 0,
    subCategoriaId: 0,
    precio: 0,
    costo: 0,
    stockMinimo: 0,
    activo: true,
    imagenUrl: null,
    ImagenUrl: null,
    ImagenArchivo: null,
  };

  const [producto, setProducto] = useState<Producto>(defaultProducto);
  const [guardando, setGuardando] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // Validación según DataAnnotations
  const isFormValid = useFormValidation({
    codigo:        { value: producto.codigo, required: true, type: 'string'  },
    nombre:        { value: producto.nombre, required: true, type: 'string' },
    descripcion:   { value: producto.descripcion, required: true, type: 'string'},
    categoriaId:   { value: producto.categoriaId, required: true, type: 'number' },
    subCategoriaId:{ value: producto.subCategoriaId, required: true, type: 'number' },
    precio:        { value: producto.precio, required: true, type: 'number' },
    costo:         { value: producto.costo, required: true, type: 'number' },
    stockMinimo:   { value: producto.stockMinimo, required: true, type: 'number' },
    activo:        { value: producto.activo, required: true, type: 'boolean' },
  });

  const handleFileChange = (file: File | null) => {
    setProducto(prev => ({ ...prev, ImagenArchivo: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImg(url);
      // Si carga archivo, limpiamos URL para evitar ambigüedad (opcional)
      setProducto(prev => ({ ...prev, imagenUrl: null, ImagenUrl: null }));
    } else {
      setPreviewImg(null);
    }
  };

  const handleUrlChange = (url: string) => {
    setProducto(prev => ({ ...prev, imagenUrl: url || null, ImagenUrl: url || null }));
    setPreviewImg(url || null);
    // Si escribe URL, limpiamos archivo
    setProducto(prev => ({ ...prev, ImagenArchivo: null }));
  };

  const resetForm = () => {
    setProducto(defaultProducto);
    setPreviewImg(null);
  };

  const guardar = async () => {
    if (!isFormValid) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      await ProductoService.insertar(producto);
      alert('Producto creado correctamente.');
      resetForm();
    } catch (err) {
      console.error('Error al crear producto', err);
      alert(`Error al crear producto:\n${formatApiError(err)}`);
    } finally {
      setGuardando(false);
    }
  };

  // Sección helper
  const seccion = (title: string, content: React.ReactNode) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
        {title}
      </Typography>
      <Box
        sx={{
          p: 1.5,
          borderRadius: '8px',
          backgroundColor: 'rgba(255,255,255,0.10)',
          color: '#fff',
          lineHeight: 1.6
        }}
      >
        {content}
      </Box>
    </Box>
  );

  return (
    <div className="contenido">
      <div id="productos" className="bloque-formulario">
        <div><h2>Crear Producto</h2></div>

        <Card
          sx={{
            mt: 1,
            background: 'linear-gradient(45deg, rgba(10, 70, 120, 0.7), rgba(21, 154, 230, 0.7))',
            color: '#fff',
            borderRadius: '12px'
          }}
        >
          <CardHeader
            title={<Typography variant="h6" sx={{ fontWeight: 800, color: '#fff' }}>Registro de Producto</Typography>}
            sx={{ borderBottom: '1px solid rgba(255,255,255,0.2)', pb: 1.5 }}
          />

          <CardContent>
            {/* Sección: Imagen */}
            {seccion('Imagen del Producto', (
              <div style={grid2ColStyle}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label">URL de Imagen</label>
                  <input
                    type="text"
                    placeholder="https://tusitio.com/imagen.png (opcional si cargas archivo)"
                    value={producto.imagenUrl ?? ''}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="form-control"
                  />
                  <label style={{ color: 'white', marginTop: '8px' }} className="form-label">Cargar imagen desde tu equipo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    className="form-control"
                  />
                  {previewImg && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <img src={previewImg} alt="Preview" style={{ maxWidth: '220px', borderRadius: '8px' }} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* Sección: Información Básica */}
            {seccion('Información Básica', (
              <div style={grid2ColStyle}>
                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Código</label>
                  <input
                    type="text"
                    maxLength={100}
                    value={producto.codigo}
                    onChange={(e) => setProducto(p => ({ ...p, codigo: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Nombre</label>
                  <input
                    type="text"
                    maxLength={100}
                    value={producto.nombre}
                    onChange={(e) => setProducto(p => ({ ...p, nombre: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: 'white' }} className="form-label required">Descripción</label>
                  <textarea
                    maxLength={500}
                    value={producto.descripcion}
                    onChange={(e) => setProducto(p => ({ ...p, descripcion: e.target.value }))}
                    className="form-control"
                    rows={3}
                    required
                  />
                </div>
              </div>
            ))}

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* Sección: Clasificación */}
            {seccion('Clasificación', (
              <div style={grid2ColStyle}>
                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Categoría (ID)</label>
                  <input
                    type="number"
                    min={0}
                    value={producto.categoriaId}
                    onChange={(e) => setProducto(p => ({ ...p, categoriaId: Number(e.target.value) }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Subcategoría (ID)</label>
                  <input
                    type="number"
                    min={0}
                    value={producto.subCategoriaId}
                    onChange={(e) => setProducto(p => ({ ...p, subCategoriaId: Number(e.target.value) }))}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            ))}

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* Sección: Precios */}
            {seccion('Precios', (
              <div style={grid2ColStyle}>
                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={producto.precio}
                    onChange={(e) => setProducto(p => ({ ...p, precio: Number(e.target.value) }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Costo</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={producto.costo}
                    onChange={(e) => setProducto(p => ({ ...p, costo: Number(e.target.value) }))}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            ))}

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* Sección: Inventario / Estado */}
            {seccion('Inventario y Estado', (
              <div style={grid2ColStyle}>
                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label required">Stock mínimo</label>
                  <input
                    type="number"
                    min={0}
                    value={producto.stockMinimo}
                    onChange={(e) => setProducto(p => ({ ...p, stockMinimo: Number(e.target.value) }))}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: 'white' }} className="form-label">Estado</label>
                  <select
                    className="form-control"
                    value={producto.activo ? '1' : '0'}
                    onChange={(e) => setProducto(p => ({ ...p, activo: e.target.value === '1' }))}
                    style={{backgroundColor: 'rgb(10, 70, 120)', color:'white'}}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
              </div>
            ))}

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* Acciones */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <button
                className="boton-formulario"
                style={{ opacity: guardando ? 0.7 : 1 }}
                onClick={guardar}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                className="boton-formulario"
                style={{ backgroundColor: '#666' }}
                onClick={resetForm}
                disabled={guardando}
              >
                Limpiar
              </button>
            </Box>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProductoCreateWidget;
