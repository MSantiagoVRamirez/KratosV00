// components/Ventas/ProductoCreateWidget.tsx
import { useEffect, useState } from 'react';
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
import CategoriasService from '../../services/Ventas/CategoriaService';

// Tipo UI interno para normalizar el shape del backend (nombre/Nombre, activo/Activo)
type UICategoria = { id: number; nombre: string; activo?: boolean | null };

// Helper de errores legibles
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
    productoServicio: false,
  };

  const [producto, setProducto] = useState<Producto>(defaultProducto);
  const [guardando, setGuardando] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // Estados para categorías / subcategorías
  const [categorias, setCategorias] = useState<UICategoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<UICategoria[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [subCatLoading, setSubCatLoading] = useState(false);

  // Validación (incluye categoría/subcategoría como obligatorias)
  const isFormValid = useFormValidation({
    codigo:        { value: producto.codigo, required: true, type: 'string' },
    nombre:        { value: producto.nombre, required: true, type: 'string' },
    descripcion:   { value: producto.descripcion, required: true, type: 'string' },
    categoriaId:   { value: producto.categoriaId, required: true, type: 'number' },
    subCategoriaId:{ value: producto.subCategoriaId, required: true, type: 'number' },
    precio:        { value: producto.precio, required: true, type: 'number' },
    costo:         { value: producto.costo, required: true, type: 'number' },
    stockMinimo:   { value: producto.stockMinimo, required: true, type: 'number' },
    activo:        { value: producto.activo, required: true, type: 'boolean' },
  });
  // 👇 mantén un estado auxiliar de strings
    const [precioText, setPrecioText] = useState('');
    const [costoText, setCostoText] = useState('');

    // Cuando se edite el producto (ej: editar existente) sincronizas
    useEffect(() => {
    setPrecioText(producto.precio ? producto.precio.toString() : '');
    setCostoText(producto.costo ? producto.costo.toString() : '');
    }, [producto.precio, producto.costo]);

    // tu formatCurrency ya existente:
    const formatCurrency = (number: number) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(number);
    };

  // Cargar categorías al iniciar
  useEffect(() => {
    const loadCategorias = async () => {
      setCatLoading(true);
      try {
        const resp = await CategoriasService.getCategoriasProductos();
        const data = Array.isArray(resp.data) ? resp.data : [];
        const parsed: UICategoria[] = data.map((c: any) => ({
          id: Number(c.id),
          nombre: String(c.nombre ?? c.Nombre ?? ''),
          activo: c.activo ?? c.Activo ?? true,
        }));
        setCategorias(parsed.filter(c => c.activo !== false));
      } catch (e) {
        console.error('Error cargando categorías', e);
      } finally {
        setCatLoading(false);
      }
    };
    loadCategorias();
  }, []);

  // Al cambiar categoría: set id, reset subcat, y cargar subcategorías
  const handleCategoriaChange = async (idStr: string) => {
    const id = Number(idStr);
    setProducto(prev => ({ ...prev, categoriaId: id, subCategoriaId: 0 }));
    setSubcategorias([]);

    if (!id || id <= 0) return;

    setSubCatLoading(true);
    try {
      const resp = await CategoriasService.getSubCategoriasProductos(id);

      // Log de depuración (puedes comentarlo luego)
      // console.log('GET subcategorias', { url: resp.config?.url, params: (resp.config as any)?.params, data: resp.data });

      // Permite que la API responda como array directo o envuelto en { data: [...] }
      const raw = Array.isArray(resp.data)
        ? resp.data
        : (Array.isArray(resp.data?.data) ? resp.data.data : []);

      const parsed: UICategoria[] = raw.map((c: any) => ({
        id: Number(c.id),
        nombre: String(c.nombre ?? c.Nombre ?? ''),
        activo: c.activo ?? c.Activo ?? true,
      }));

      // Si tu API no maneja "activo", no filtres para evitar lista vacía.
      const onlyActive = parsed; // o parsed.filter(s => s.activo !== false)

      setSubcategorias(onlyActive);

      if (onlyActive.length === 0) {
        console.warn('Subcategorías vacías para categoría', id, resp);
      }
    } catch (e) {
      console.error('Error cargando subcategorías', e);
    } finally {
      setSubCatLoading(false);
    }
  };

  const handleSubCategoriaChange = (idStr: string) => {
    const id = Number(idStr);
    setProducto(prev => ({ ...prev, subCategoriaId: id }));
  };

  const handleFileChange = (file: File | null) => {
    setProducto(prev => ({ ...prev, ImagenArchivo: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImg(url);
      // Si hay archivo, limpiamos URL para evitar ambigüedad (opcional)
      setProducto(prev => ({ ...prev, imagenUrl: null, ImagenUrl: null }));
    } else {
      setPreviewImg(null);
    }
  };

  const handleUrlChange = (url: string) => {
    setProducto(prev => ({ ...prev, imagenUrl: url || null, ImagenUrl: url || null, ImagenArchivo: null }));
    setPreviewImg(url || null);
  };

  const resetForm = () => {
    setProducto(defaultProducto);
    setPreviewImg(null);
    setSubcategorias([]);
  };

  const guardar = async () => {
    if (!isFormValid) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }
    if (!producto.categoriaId || !producto.subCategoriaId) {
      alert('Selecciona una categoría y subcategoría.');
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
      <Typography variant="subtitle1" className="user-title" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Box className="section-box">
        {content}
      </Box>
    </Box>
  );

  return (
    <div className="contenido">
      <div id="productos" className="bloque-formulario">
        <div><h2>Registrar Producto</h2></div>

        <Card className="user-card" sx={{ mt: 1, margin: '3%' }}>
          <CardHeader
            title={<Typography variant="h6" className="user-title">Registro de Producto</Typography>}
            sx={{ borderBottom: '1px solid rgba(18,30,130,0.15)', pb: 1.5 }}
          />

          <CardContent>
            {/* Sección: Imagen */}
            {seccion('Imagen del Producto', (
              <div style={grid2ColStyle}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">URL de Imagen</label>
                  <input
                    type="text"
                    placeholder="https://tusitio.com/imagen.png (opcional si cargas archivo)"
                    value={producto.imagenUrl ?? ''}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="form-control"
                  />
                  <label style={{ marginTop: '8px' }} className="form-label">Cargar imagen desde tu equipo</label>
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
                  <label className="form-label required">Código</label>
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
                  <label className="form-label required">Nombre</label>
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
                  <label className="form-label required">Descripción</label>
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

            {/* Sección: Clasificación con SELECTS */}
            {seccion('Clasificación', (
              <div style={grid2ColStyle}>
                {/* Categoría */}
                <div className="form-group">
                  <label className="form-label required">Categoría</label>
                  <select
                    className="form-control"
                    value={producto.categoriaId || 0}
                    onChange={(e) => handleCategoriaChange(e.target.value)}
                    disabled={catLoading}
                    
                    required
                  >
                    <option value={0} disabled>{catLoading ? 'Cargando...' : '-- Seleccione --'}</option>
                    {categorias.map(c => (
                      <option   key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategoría */}
                <div className="form-group">
                  <label className="form-label required">Subcategoría</label>
                  <select
                    className="form-control"
                    value={producto.subCategoriaId || 0}
                    onChange={(e) => handleSubCategoriaChange(e.target.value)}
                    disabled={subCatLoading || !producto.categoriaId}
                    
                    required
                  >
                    <option value={0} disabled>
                      {subCatLoading
                        ? 'Cargando...'
                        : (!producto.categoriaId ? 'Seleccione una categoría' : '-- Seleccione --')}
                    </option>
                    {subcategorias.map(sc => (
                      <option  key={sc.id} value={sc.id}>{sc.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />

            {/* Sección: Precios */}
            {seccion('Precios', (
              <div style={grid2ColStyle}>
                <div className="form-group">
                 <label className="form-label required">Precio</label>
                    <input
                      type="text"
                      value={precioText}
                      onChange={(e) => {
                        // permitir hasta 14 dígitos y opcionalmente 2 decimales
                        const raw = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                        if (raw.length <= 18) { // 14 enteros + 2 decimales + punto
                          setPrecioText(raw);
                        }
                      }}
                      onBlur={(e) => {
                        const num = parseFloat(precioText);
                        if (!isNaN(num)) {
                          setProducto(p => ({ ...p, precio: num }));
                          setPrecioText(formatCurrency(num)); // mostrar formateado
                        } else {
                          setProducto(p => ({ ...p, precio: 0 }));
                          setPrecioText('');
                        }
                      }}
                      onFocus={(e) => {
                        // mostrar valor crudo al enfocar
                        setPrecioText(producto.precio ? producto.precio.toString() : '');
                      }}
                      className="form-control"
                      required
                    />
                </div>

                <div className="form-group">
                   <label className="form-label required">Costo</label>
                    <input
                      type="text"
                      value={costoText}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                        if (raw.length <= 18) {
                          setCostoText(raw);
                        }
                      }}
                      onBlur={(e) => {
                        const num = parseFloat(costoText);
                        if (!isNaN(num)) {
                          setProducto(p => ({ ...p, costo: num }));
                          setCostoText(formatCurrency(num));
                        } else {
                          setProducto(p => ({ ...p, costo: 0 }));
                          setCostoText('');
                        }
                      }}
                      onFocus={(e) => {
                        setCostoText(producto.costo ? producto.costo.toString() : '');
                      }}
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
                  <label className="form-label required">Stock mínimo</label>
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
                  <label className="form-label">Estado</label>
                  <select
                    className="form-control"
                    value={producto.activo ? '1' : '0'}
                    onChange={(e) => setProducto(p => ({ ...p, activo: e.target.value === '1' }))}
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
                className="btn btn-primary"
                style={{ opacity: guardando ? 0.7 : 1 }}
                onClick={guardar}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                className="btn btn-outline btn-active-light"
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
