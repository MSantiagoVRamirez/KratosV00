// Interfaces
import { ODS } from "../../interfaces/contratos-ods/ODS";
import { Usuario } from "../../interfaces/seguridad/Usuario";
import { Planta } from "../../interfaces/contratos-ods/Planta"
import { Sistema } from "../../interfaces/contratos-ods/Sistema"
import { IndicadorSECS } from '../../interfaces/secs/IndicadorSECS'
import { HallazgoODS } from '../../interfaces/secs/HallazgoODS'
import { NoConformidadODS } from '../../interfaces/secs/NoConformidadODS'
import { DocumentoODS } from '../../interfaces/secs/DocumentoODS'

// Services
import subODSService from "../../services/contratos-ods/subODSService";
import usuarioService from "../../services/seguridad/usuarioService";
import odsService from "../../services/contratos-ods/odsService";
import plantaService from "../../services/contratos-ods/plantaService"
import sistemaService from "../../services/contratos-ods/sistemaService"
import indicadorSECSService from '../../services/secs/indicadorSECSService'
import hallazgoODSService from '../../services/secs/hallazgoODSService'
import noConformidadODSService from '../../services/secs/noConformidadODSService'
import documentoODSService from '../../services/secs/documentoODSService'
import spiService from "../../services/secs/spiService";

// Components
import { TalleresWidget } from "../talleres-hallazgos/TalleresWidget";
import { HitosPagoWidget } from "./HitosPagoWidget";
import { ModalDialog } from "../components/ModalDialog";

// Helpers
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { KTIcon } from "../../../_metronic/helpers";
import { useAuth } from "../../modules/auth/AuthContext";
import GanttChart from "../components/GanttChart";
import { DocumentosODSWidget } from "../secs/DocumentosODSWidget";
import { NoConformidadesODSWidget } from "../secs/NoConformidadesODSWidget";
import { HallazgosODSWidget } from "../secs/HallazgosODSWidget";
import { SPIWidget } from "../secs/SPIWidget";

// Charts
import AreaChart from '../components/AreaChart'
import RadialBarChart from '../components/RadialBarChart'

export function SubODSDetails({ propsODSId }: { propsODSId: number }) {

  const location = useLocation();
  const selectedODSId = location.state?.propsODSId || propsODSId;

  const { role } = useAuth();
  const currentRole = role || '';
  const esOriginador = currentRole === 'Administrador' || currentRole === 'Funcionario Contratista';
  const esAprobador = currentRole === 'Administrador' || currentRole === 'Funcionario Cenit';

  const defaultODS: ODS = {
    id: 0,
    nombre: '',
    numeroSeguimientoCenit: '',
    numeroSeguimientoContratista: '',
    contratoId: 0,
    descripcion: '',
    valorHH: 0,
    valorViaje: 0,
    valorEstudio: 0,
    valorSumaGlobalFija: 0,
    valorInicialHH: 0,
    valorInicialViaje: 0,
    valorInicialEstudio: 0,
    valorInicialSumaGlobalFija: 0,
    valorGastoReembolsable: 0,
    porcentajeGastoReembolsable: 0,
    valorDisponible: 0,
    valorHabilitado: 0,
    valorPagado: 0,
    valorFaltaPorPagar: 0,
    fechaInicio: '',
    fechaFinalOriginal: '',
    fechaFin: null,
    fechaRealCierre: null,
    porcentajeRequerimientosCumplidos: null,
    porcentajeAccionesCumplidas: null,
    horasHombre: null,
    conexoObra: false,
    estaAprobada: false,
    estaCancelada: false,
    estaSuspendida: false,
    estaRechazada: false,
    comentarioAprobacion: null,
    estado: 0,
    avance: 0,
    odsId: null,
    contratista: null,
    liderServicioId: null,
    supervisorTecnicoId: null,
    coordinadorODSId: 0,
    SyCcontratistaId: null,
    plantaSistema: false,
    listaPlanta: null,
    listaSistema: null,
    especialidad: null,
    tipoODS: 2,
    recurso: null,
    areaSupervisionTecnica: null,
    complejidad: null,
    paqueteModular: null,
  }
  
  const [editedODS, setEditedODS] = useState<ODS>(defaultODS)
  const [deleteODSId, setDeleteODSId] = useState<number>(defaultODS.id)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [superODS, setSuperODS] = useState<ODS[]>([])
  const [plantas, setPlantas] = useState<Planta[]>([])
  const [sistemas, setSistemas] = useState<Sistema[]>([])
  const [indicadoresSECS, setIndicadoresSECS] = useState<IndicadorSECS[]>([])
  const [hallazgosODS, setHallazgosODS] = useState<HallazgoODS[]>([])
  const [noConformidadesODS, setNoConformidadesODS] = useState<NoConformidadODS[]>([])
  const [documentosODS, setDocumentosODS] = useState<DocumentoODS[]>([])
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('total')
  const [spis, setSPIs] = useState<any[]>([])
  const [modalType, setModalType] = useState<'delete' | 'edit' | 'approve' | 'disapprove' | 'cancel' | 'uncancel' | 'suspend' | 'unsuspend' | 'reject' | 'unreject' | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const closeModal = () => setModalType(null)

  const formatCurrency = (number: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const handleChangeCurrency = (fieldName: keyof ODS, rawInput: string) => {
    if (!isEditing) return;
    const numericValue = parseInt(rawInput.replace(/[^0-9]/g, ''), 10);
    setEditedODS((prev) => ({
      ...prev,
      [fieldName]: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  // Funciones helper para obtener nombres y estados
  const getUsuarioName = (id: number | null) => {
    if (!id) return 'No asignado';
    const usuario = usuarios.find(u => u.id === id);
    return usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'No asignado';
  };

  const getSuperODSName = (id: number | null) => {
    if (!id) return 'No asignado';
    const ods = superODS.find(o => o.id === id);
    return ods ? ods.nombre : 'No asignado';
  };

  const getTipoServicioText = (tipo: number) => {
    switch (tipo) {
      case 2: return 'STI';
      case 3: return 'MOC';
      case 4: return 'TQ';
      case 5: return 'STD';
      case 6: return 'RSPA';
      case 7: return 'ING';
      default: return 'No definido';
    }
  };

  const getEspecialidadText = (especialidad: number | null) => {
    switch (especialidad) {
      case 0: return 'General';
      case 1: return 'Automatización y Control';
      case 2: return 'Eléctrica';
      case 3: return 'Civil';
      case 4: return 'Mecánica Rotativa';
      case 5: return 'Límites Operativos';
      case 6: return 'Líneas y Tanques';
      case 7: return 'Contra Incendio';
      case 8: return 'Procesos';
      case 9: return 'Instrumentación y Medición';
      default: return 'No definida';
    }
  };

  const getRecursoText = (recurso: number | null) => {
    switch (recurso) {
      case 0: return 'ABANDONO';
      case 1: return 'CAPEX - Mantenimiento';
      case 2: return 'OPEX - Comercial';
      case 3: return 'OPEX - Ingeniería';
      case 4: return 'OPEX - Operaciones';
      case 5: return 'OPEX - Integridad';
      case 6: return 'OPEX - Bajas Emisiones';
      case 7: return 'CAPEX - Proyectos';
      case 8: return 'CAPEX - Planeación de Pry';
      default: return 'No asignado';
    }
  };

  const getEstadoText = (estado: number) => {
    switch (estado) {
      case 0: return 'Pendiente';
      case 1: return 'En Proceso';
      case 2: return 'Completada';
      case 3: return 'Cancelada';
      case 4: return 'Suspendida';
      case 5: return 'Rechazada';
      default: return 'Desconocido';
    }
  };

  const getEstadoBadgeClass = (estado: number) => {
    switch (estado) {
      case 0: return 'badge-warning';
      case 1: return 'badge-primary';
      case 2: return 'badge-success';
      case 3: return 'badge-danger';
      case 4: return 'badge-secondary';
      case 5: return 'badge-danger';
      default: return 'badge-light';
    }
  };

  const calcularPlazo = () => {
    if (editedODS.fechaFin && editedODS.fechaInicio) {
      const inicio = new Date(editedODS.fechaInicio);
      const fin = new Date(editedODS.fechaFin);
      const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 3600 * 24)) + 1;
      return `${dias} días`;
    }
    return '0 días';
  };

  const fetchUsuarios = () => {
    usuarioService.getAll()
      .then((response) => {
        setUsuarios(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los usuarios", error)
      })
  }

  const fetchSuperODS = () => {
    odsService.getAll()
      .then((response) => {
        setSuperODS(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las ordenes de servicio", error)
      })
  }

  const fetchPlantas = () => {
    plantaService.getAll()
      .then((response) => {
        setPlantas(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las plantas", error)
      })
  }

  const fetchSistemas = () => {
    sistemaService.getAll()
      .then((response) => {
        setSistemas(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los sistemas", error)
      })
  }

  const fetchODS = (id: number) => {
    subODSService.get(id)
      .then((response) => {
        setEditedODS(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la orden de servicio", error)
      })
  }

  const fetchHallazgosODS = () => {
    hallazgoODSService.getAll()
      .then((response) => {
        setHallazgosODS(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los hallazgos ODS", error)
      })
  }

  const fetchNoConformidadesODS = () => {
    noConformidadODSService.getAll()
      .then((response) => {
        setNoConformidadesODS(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las no conformidades ODS", error)
      })
  }

  const fetchDocumentosODS = () => {
    documentoODSService.getAll()
      .then((response) => {
        setDocumentosODS(response.data)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los documentos ODS", error)
      })
  }

  // Obtener los SECS asociados a la ODS seleccionada
  const fetchSECSByODSId = (odsId: number) => {
    indicadorSECSService.getSECS(odsId)
      .then((response) => {
        
        let secsData: IndicadorSECS[] = [];
        
        if (response.data) {
          // Si la respuesta es un array
          if (Array.isArray(response.data)) {
            secsData = response.data;
          } 
          // Si la respuesta es un objeto que contiene un array
          else if (typeof response.data === 'object') {
            // Buscar si hay una propiedad que contenga el array de datos
            if (response.data.data && Array.isArray(response.data.data)) {
              secsData = response.data.data;
            } else if (response.data.indicadores && Array.isArray(response.data.indicadores)) {
              secsData = response.data.indicadores;
            } else if (response.data.items && Array.isArray(response.data.items)) {
              secsData = response.data.items;
            } else {
              // Si es un objeto con las propiedades del IndicadorSECS, convertirlo a array
              if (response.data.id !== undefined) {
                secsData = [response.data];
              } else {
                console.warn("Estructura de datos no reconocida:", response.data);
                secsData = [];
              }
            }
          }
        }
        setIndicadoresSECS(secsData);
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los indicadores SECS", error);
        console.error("Detalles del error:", error.response?.data || error.message);
        setIndicadoresSECS([]);
      });
  }

  // Obtener los SPI asociados a la ODS seleccionada
  const fetchSPIsByODSId = (odsId: number) => {
    spiService.getAll()
      .then((response) => {
        if (Array.isArray(response.data)) {
          setSPIs(response.data.filter((spi: any) => spi.odsId === odsId));
        } else {
          setSPIs([]);
        }
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los SPIs", error);
        setSPIs([]);
      });
  }

  useEffect(() => {
    fetchUsuarios()
    fetchSuperODS()
    fetchPlantas()
    fetchSistemas()
    fetchODS(selectedODSId)
    fetchSECSByODSId(selectedODSId)
    fetchSPIsByODSId(selectedODSId)
    fetchHallazgosODS()
    fetchNoConformidadesODS()
    fetchDocumentosODS()
  }, [])

  useEffect(() => {
    fetchSECSByODSId(selectedODSId);
    fetchSPIsByODSId(selectedODSId);
  }, [selectedODSId]);

  const updateODS = (data: ODS) => {
    const valorSumaGlobalFija = data.valorHH + data.valorViaje + data.valorEstudio;
    const valorDisponible = data.valorDisponible !== null ? data.valorDisponible : valorSumaGlobalFija;
    const dataToSend = {
      ...data,
      valorSumaGlobalFija,
      valorDisponible
    };
    
    subODSService.update(dataToSend)
      .then(() => {
        fetchODS(selectedODSId)
        setIsEditing(false)
        closeModal()
        alert("Servicio actualizado exitosamente")
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar el servicio", error)
        alert(`Error al actualizar servicio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const deleteODS = () => {
    subODSService.remove(deleteODSId)
      .then(() => {
        setDeleteODSId(defaultODS.id)
        alert("Servicio eliminado exitosamente")
        navigate(-1)
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar el servicio", error)
        alert(`Error al eliminar servicio: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const openDeleteModal = (id: number) => {
    setDeleteODSId(id)
    setModalType('delete')
  }

  // Opciones para el dropdown de documentos
  const documentOptions = [
    { value: 'total', label: 'Total General' },
    { value: 'informeSemanal', label: 'Informe Semanal' },
    { value: 'informeMensual', label: 'Informe Mensual' },
    { value: 'informeEstimado', label: 'Informe Estimado' },
    { value: 'informeHSEEstadistico', label: 'Informe HSE Estadístico' },
    { value: 'informeHSEGestion', label: 'Informe HSE Gestión' },
    { value: 'actaInicio', label: 'Acta de Inicio' },
    { value: 'actaOC', label: 'Acta de Orden de Cambio' },
    { value: 'actaSuspensionReinicio', label: 'Acta de Suspensión/Reinicio' },
    { value: 'actaTerminacion', label: 'Acta de Terminación' },
    { value: 'actaBalanceCierre', label: 'Acta de Balance y Cierre' }
  ]

  // Funciones para procesar datos de SECS y usarlos en los gráficos
  const getLatestSECSData = () => {
    if (!Array.isArray(indicadoresSECS) || indicadoresSECS.length === 0) return null;
    // Obtener el registro más reciente
    const sortedData = [...indicadoresSECS].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return sortedData[0];
  }

  const getTripleRestriccionData = () => {
    const latestSECS = getLatestSECSData();
    if (!latestSECS) return { data: [0, 0, 0, 0], labels: ['Sin datos', 'Sin datos', 'Sin datos', 'Sin datos'] };
    
    return {
      data: [
        latestSECS.indicadorCumplimientoPlazo || 0,
        latestSECS.indicadorRequerimientos || 0, 
        latestSECS.indicadorSPI || 0,
        latestSECS.indicadorHitos || 0
      ],
      labels: [
        'Plazo de ejecución y dossier',
        'Cumplimiento del alcance', 
        'Ejecución de Programa',
        'Cumplimiento de hitos'
      ]
    };
  }

  const getCalidadData = () => {
    const latestSECS = getLatestSECSData();
    if (!latestSECS) return { data: [0, 0, 0, 0, 0], labels: ['Sin datos', 'Sin datos', 'Sin datos', 'Sin datos', 'Sin datos'] };
    
    return {
      data: [
        latestSECS.indicadorComentarios || 0,
        latestSECS.indicadorGestionCalidad || 0,
        latestSECS.indicadorPlanCalidad || 0,
        latestSECS.indicadorNoConformidades || 0,
        latestSECS.indicadorHallazgos || 0
      ],
      labels: [
        'Cierre de comentarios y acciones NM',
        'Efectividad de gestión de calidad',
        'Cumplimiento del plan de calidad',
        'Cierre de no conformidades',
        'Cierre de hallazgos'
      ]
    };
  }

  const getEntregablesData = () => {
    const latestSECS = getLatestSECSData();
    if (!latestSECS) return { data: [0], labels: ['Sin datos'] };
    
    return {
      data: [latestSECS.indicadorDocumentos || 0],
      labels: ['Cumplimiento de entregables']
    };
  }

  const getPromedioSECSData = () => {
    if (!Array.isArray(indicadoresSECS) || indicadoresSECS.length === 0) return { data: [], categories: [] };
    
    const sortedSECS = [...indicadoresSECS].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    return {
      data: sortedSECS.map(item => item.totalPonderado || 0),
      categories: sortedSECS.map(item => new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }))
    };
  }

  // Función para obtener datos del SPI (Índice de Ejecución del Programa) usando el arreglo de SPI
  const getSPITimeSeriesData = () => {
    if (!Array.isArray(spis) || spis.length === 0) return { series: [], categories: [] };
    
    // Ordenar por fecha
    const sortedSPIs = [...spis].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    // Calcular el promedio de todos los valores SPI
    const validSPIValues = sortedSPIs.map(item => item.spi || 0).filter(value => value > 0);
    const promedioSPI = validSPIValues.length > 0 
      ? validSPIValues.reduce((sum, value) => sum + value, 0) / validSPIValues.length 
      : 0;
    
    // Crear las categorías originales
    const categories = sortedSPIs.map(item => new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));
    
    // Agregar una categoría adicional para el promedio
    const promedioLabel = 'Promedio';
    const extendedCategories = [...categories, promedioLabel];
    
    // Crear los datos originales
    const originalData = sortedSPIs.map(item => item.spi || 0);
    
    // Crear una serie con los datos originales + null para el punto del promedio
    const spiData = [...originalData, null];
    
    // Crear una serie solo para el punto del promedio
    const promedioData = new Array(originalData.length).fill(null);
    promedioData.push(Math.round(promedioSPI * 100) / 100); // Redondear a 2 decimales
    
    return {
      series: [
        { 
          name: 'Índice de Ejecución del Programa (SPI)', 
          data: spiData,
          type: 'line'
        },
        {
          name: `Promedio General (${Math.round(promedioSPI * 100) / 100})`,
          data: promedioData,
          type: 'scatter',
          marker: {
            size: 8,
            fillColor: '#FF6B6B',
            strokeColor: '#FF6B6B',
            strokeWidth: 2
          },
          color: '#FF6B6B'
        }
      ],
      categories: extendedCategories
    };
  }

  // Función para obtener datos de hallazgos
  const getHallazgosTimeSeriesData = () => {
    if (!Array.isArray(hallazgosODS) || hallazgosODS.length === 0) return { series: [], categories: [] };
    
    // Filtrar hallazgos por la ODS seleccionada
    const hallazgosFiltrados = hallazgosODS.filter(hallazgo => hallazgo.odsId === selectedODSId);
    
    if (hallazgosFiltrados.length === 0) return { series: [], categories: [] };
    
    // Ordenar por fecha
    const sortedHallazgos = [...hallazgosFiltrados].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    const categories = sortedHallazgos.map(item => new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));
    
    return {
      series: [
        { name: 'Total de Hallazgos', data: sortedHallazgos.map(item => item.cantidadTotal) },
        { name: 'Hallazgos Cerrados', data: sortedHallazgos.map(item => item.cantidadCerradas) }
      ],
      categories
    };
  }

  // Función para obtener datos de no conformidades
  const getNoConformidadesTimeSeriesData = () => {
    if (!Array.isArray(noConformidadesODS) || noConformidadesODS.length === 0) return { series: [], categories: [] };
    
    // Filtrar no conformidades por la ODS seleccionada
    const noConformidadesFiltradas = noConformidadesODS.filter(noConformidad => noConformidad.odsId === selectedODSId);
    
    if (noConformidadesFiltradas.length === 0) return { series: [], categories: [] };
    
    // Ordenar por fecha
    const sortedNoConformidades = [...noConformidadesFiltradas].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    const categories = sortedNoConformidades.map(item => new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));
    
    return {
      series: [
        { name: 'Total de No Conformidades', data: sortedNoConformidades.map(item => item.cantidadTotal) },
        { name: 'No Conformidades Cerradas', data: sortedNoConformidades.map(item => item.cantidadCerradas) }
      ],
      categories
    };
  }

  // Función para obtener datos de documentos
  const getDocumentosTimeSeriesData = () => {
    if (!Array.isArray(documentosODS) || documentosODS.length === 0) return { series: [], categories: [] };
    
    // Filtrar documentos por la ODS seleccionada
    const documentosFiltrados = documentosODS.filter(documento => documento.odsId === selectedODSId);
    
    if (documentosFiltrados.length === 0) return { series: [], categories: [] };
    
    // Ordenar por fecha
    const sortedDocumentos = [...documentosFiltrados].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    const categories = sortedDocumentos.map(item => new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));
    
    // Función helper para obtener los datos según el tipo seleccionado
    const getDocumentData = (documento: DocumentoODS) => {
      switch (selectedDocumentType) {
        case 'total':
          return {
            planeado: documento.totalPlaneado,
            real: documento.totalReal
          };
        case 'informeSemanal':
          return {
            planeado: documento.informeSemanalPlaneado,
            real: documento.informeSemanalReal
          };
        case 'informeMensual':
          return {
            planeado: documento.informeMensualPlaneado,
            real: documento.informeMensualReal
          };
        case 'informeEstimado':
          return {
            planeado: documento.informeEstimadoPlaneado,
            real: documento.informeEstimadoReal
          };
        case 'informeHSEEstadistico':
          return {
            planeado: documento.informeHSEEstadísticoPlaneado,
            real: documento.informeHSEEstadísticoReal
          };
        case 'informeHSEGestion':
          return {
            planeado: documento.informeHSEGestionPlaneado,
            real: documento.informeHSEGestionReal
          };
        case 'actaInicio':
          return {
            planeado: documento.actaInicioPlaneado,
            real: documento.actaInicioReal
          };
        case 'actaOC':
          return {
            planeado: documento.actaOCPlaneado,
            real: documento.actaOCReal
          };
        case 'actaSuspensionReinicio':
          return {
            planeado: documento.actaSuspensionReinicioPaneado,
            real: documento.actaSuspensionReinicioRea
          };
        case 'actaTerminacion':
          return {
            planeado: documento.actaTerminacionPlaneado,
            real: documento.actaTerminacionReal
          };
        case 'actaBalanceCierre':
          return {
            planeado: documento.actaBalanceCierrePlaneado,
            real: documento.actaBalanceCierreReal
          };
        default:
          return {
            planeado: documento.totalPlaneado,
            real: documento.totalReal
          };
      }
    };

    // Obtener el nombre del documento seleccionado
    const selectedDocument = documentOptions.find(option => option.value === selectedDocumentType);
    const documentName = selectedDocument ? selectedDocument.label : 'Total General';
    
    return {
      series: [
        { name: `${documentName} - Planeado`, data: sortedDocumentos.map(item => getDocumentData(item).planeado) },
        { name: `${documentName} - Real`, data: sortedDocumentos.map(item => getDocumentData(item).real) }
      ],
      categories
    };
  }

  // Efecto para mostrar información adicional cuando los SECS se cargan
  useEffect(() => {
    if (Array.isArray(indicadoresSECS) && indicadoresSECS.length > 0) {
      const latestSECS = getLatestSECSData();
    } else if (indicadoresSECS && !Array.isArray(indicadoresSECS)) {
      console.warn("Los datos SECS no son un array:", indicadoresSECS);
    }
  }, [indicadoresSECS]);

  const navigate = useNavigate();

  const usuariosCenit = usuarios.filter(usuario => usuario.empresaId === 1)

  return (
    <>
      <div className="d-flex flex-column p-5 gap-5">
        {/* Header con botones de acción */}
        <div className="d-flex justify-content-between align-items-center">
          <button onClick={() => navigate(-1)} className="btn btn-sm btn-light-primary" style={{ width: "fit-content" }}>
            <KTIcon iconName="arrow-left" className="fs-1" />{" "}
            Volver
          </button>
          <div className="d-flex gap-3">
            {isEditing && (
              <button onClick={() => setModalType('edit')} className="btn btn-sm btn-light-success" style={{ width: "fit-content" }}>
                <KTIcon iconName="check" className="fs-1" />{" "}
                Guardar Cambios
              </button>
            )}
            {isEditing ? (
              <button onClick={() => {
                setIsEditing(false);
                fetchODS(selectedODSId);
              }} className="btn btn-sm btn-light-info" style={{ width: "fit-content" }}>
                <KTIcon iconName="x" className="fs-2" />{" "}
                Cancelar
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-sm btn-light-info"
                style={{ width: "fit-content" }}
                disabled={editedODS.estado !== 0 && editedODS.estado !== 5}
              >
                <KTIcon iconName="pencil" className="fs-2" />{" "}
                Editar
              </button>
            )}
            <button
              onClick={() => openDeleteModal(selectedODSId)}
              className="btn btn-sm btn-light-danger"
              style={{ width: "fit-content" }}
              disabled={editedODS.estado !== 0 && editedODS.estado !== 5}
            >
              <KTIcon iconName="trash" className="fs-2" />{" "}
              Eliminar
            </button>
          </div>
        </div>

        {/* Título y estado */}
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="fw-bolder my-5 ms-5">Detalles del Servicio</h1>
          <div className="d-flex gap-3 align-items-center">
            <span className={`badge fs-6 ${getEstadoBadgeClass(editedODS.estado)}`}>
              {getEstadoText(editedODS.estado)}
            </span>
          </div>
        </div>

        {/* Sección 1: Estado y Aprobación */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="check-square" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Estado y Aprobación</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Controles de aprobación - Visibles para aprobadores */}
              {esAprobador && (
                <>
                  <div className="col-lg-4">
                    <div className="form-check form-switch form-check-custom form-check-success form-check-solid h-100 d-flex align-items-center">
                      <div>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="servicioAprobadaSwitch"
                          checked={editedODS.estaAprobada}
                          onChange={(e) => isEditing && (e.target.checked ? setModalType('approve') : setModalType('disapprove'))}
                          disabled={!isEditing}
                        />
                        <label className="form-check-label fw-semibold fs-6 ms-3" htmlFor="servicioAprobadaSwitch">
                          Aprobada
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div className="form-check form-switch form-check-custom form-check-danger form-check-solid h-100 d-flex align-items-center">
                      <div>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="servicioRechazadaSwitch"
                          checked={editedODS.estaRechazada}
                          onChange={(e) => isEditing && (e.target.checked ? setModalType('reject') : setModalType('unreject'))}
                          disabled={!isEditing}
                        />
                        <label className="form-check-label fw-semibold fs-6 ms-3" htmlFor="servicioRechazadaSwitch">
                          Rechazada
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Controles para originadores */}
              {esOriginador && (
                <div className="col-lg-4">
                  <div className="form-check form-switch form-check-custom form-check-warning form-check-solid h-100 d-flex align-items-center">
                    <div>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="servicioCanceladaSwitch"
                        checked={editedODS.estaCancelada}
                        onChange={(e) => isEditing && (e.target.checked ? setModalType('cancel') : setModalType('uncancel'))}
                        disabled={!isEditing}
                      />
                      <label className="form-check-label fw-semibold fs-6 ms-3" htmlFor="servicioCanceladaSwitch">
                        Cancelada
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Comentario de aprobación */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6">Comentario de Aprobación</label>
                {isEditing && esAprobador ? (
                  <textarea
                    value={editedODS.comentarioAprobacion || ''}
                    onChange={(e) => setEditedODS(prev => ({ ...prev, comentarioAprobacion: e.target.value }))}
                    className="form-control"
                    rows={3}
                    placeholder="Comentario sobre la aprobación, rechazo o estado del servicio"
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedODS.comentarioAprobacion || 'Sin comentarios'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Sección 2: Información Básica */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="document" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Información Básica</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Código de Servicio - Editable por originador */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6 required">Código de Servicio</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    value={editedODS.nombre}
                    onChange={(e) => setEditedODS({ ...editedODS, nombre: e.target.value })}
                    className="form-control"
                    placeholder="Ingrese código de servicio"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold fs-4 text-primary">{editedODS.nombre || 'Sin asignar'}</span>
                  </div>
                )}
              </div>

              {/* Número Seguimiento Cenit - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Número Seguimiento Cenit</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    value={editedODS.numeroSeguimientoCenit || ''}
                    onChange={(e) => setEditedODS({ ...editedODS, numeroSeguimientoCenit: e.target.value })}
                    className="form-control"
                    placeholder="Ingrese número de seguimiento Cenit"
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedODS.numeroSeguimientoCenit || 'No asignado'}</span>
                  </div>
                )}
              </div>

              {/* Número Seguimiento Contratista - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Número Seguimiento Contratista</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    value={editedODS.numeroSeguimientoContratista || ''}
                    onChange={(e) => setEditedODS({ ...editedODS, numeroSeguimientoContratista: e.target.value })}
                    className="form-control"
                    placeholder="Ingrese número de seguimiento contratista"
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedODS.numeroSeguimientoContratista || 'No asignado'}</span>
                  </div>
                )}
              </div>

              {/* ODS Padre - Solo lectura */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6">ODS Padre</label>
                <div className="bg-light rounded p-3">
                  <span className="fw-semibold">{getSuperODSName(editedODS.odsId)}</span>
                </div>
              </div>

              {/* Tipo de Servicio - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Tipo de Servicio</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedODS.tipoODS ?? ''}
                    onChange={(e) => setEditedODS(prev => ({ ...prev, tipoODS: parseInt(e.target.value) }))}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione un tipo</option>
                    <option value={2}>STI</option>
                    <option value={3}>MOC</option>
                    <option value={4}>TQ</option>
                    <option value={5}>STD</option>
                    <option value={6}>RSPA</option>
                    <option value={7}>ING</option>
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getTipoServicioText(editedODS.tipoODS)}</span>
                  </div>
                )}
              </div>

              {/* Especialidad - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Especialidad</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedODS.especialidad ?? ''}
                    onChange={(e) => setEditedODS(prev => ({ ...prev, especialidad: e.target.value ? parseInt(e.target.value) : null }))}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value={0}>General</option>
                    <option value={1}>Automatización y Control</option>
                    <option value={2}>Eléctrica</option>
                    <option value={3}>Civil</option>
                    <option value={4}>Mecánica Rotativa</option>
                    <option value={5}>Límites Operativos</option>
                    <option value={6}>Líneas y Tanques</option>
                    <option value={7}>Contra Incendio</option>
                    <option value={8}>Procesos</option>
                    <option value={9}>Instrumentación y Medición</option>
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getEspecialidadText(editedODS.especialidad)}</span>
                  </div>
                )}
              </div>

              {/* Recurso - Editable por originador */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6 required">Recurso</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedODS.recurso ?? ''}
                    onChange={(e) => setEditedODS({ ...editedODS, recurso: e.target.value ? parseInt(e.target.value) : null })}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione un recurso</option>
                    <option value={0}>ABANDONO</option>
                    <option value={1}>CAPEX - Mantenimiento</option>
                    <option value={2}>OPEX - Comercial</option>
                    <option value={3}>OPEX - Ingeniería</option>
                    <option value={4}>OPEX - Operaciones</option>
                    <option value={5}>OPEX - Integridad</option>
                    <option value={6}>OPEX - Bajas Emisiones</option>
                    <option value={7}>CAPEX - Proyectos</option>
                    <option value={8}>CAPEX - Planeación de Pry</option>
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getRecursoText(editedODS.recurso)}</span>
                  </div>
                )}
              </div>

              {/* Conexo a Obra */}
              <div className="col-lg-6">
                <label className="form-label fw-semibold fs-6">Conexo a Obra</label>
                {isEditing && esOriginador ? (
                  <select
                    value={editedODS.conexoObra === true ? 'true' : 'false'}
                    onChange={(e) => setEditedODS({ ...editedODS, conexoObra: e.target.value === 'true' })}
                    className="form-select"
                  >
                    <option value="false">No</option>
                    <option value="true">Sí</option>
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{editedODS.conexoObra ? 'Sí' : 'No'}</span>
                  </div>
                )}
              </div>

              {/* Objeto - Editable por originador */}
              <div className="col-12">
                <label className="form-label fw-semibold fs-6 required">Objeto</label>
                {isEditing && esOriginador ? (
                  <textarea
                    value={editedODS.descripcion}
                    onChange={(e) => setEditedODS({ ...editedODS, descripcion: e.target.value })}
                    className="form-control"
                    rows={3}
                    placeholder="Describa el objeto del servicio"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-4">
                    <span>{editedODS.descripcion || 'No definido'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Asignaciones */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="people" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Asignaciones</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Líder de Servicio - Editable por ambos roles */}
              <div className="col-lg-12">
                <label className="form-label fw-semibold fs-6 required">Líder de Servicio</label>
                {isEditing ? (
                  <select
                    value={editedODS.liderServicioId ?? ''}
                    onChange={(e) => setEditedODS(prev => ({ ...prev, liderServicioId: e.target.value ? parseInt(e.target.value) : null }))}
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione un líder</option>
                    {usuariosCenit.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombres} {usuario.apellidos}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-semibold">{getUsuarioName(editedODS.liderServicioId)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección 4: Estaciones y Sistemas */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="setting-3" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Estaciones y Sistemas</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              <div className="col-12">
                <label className="form-label fw-semibold fs-6">Estaciones y Sistemas</label>
                <div className="form-text text-muted mb-2">
                  Puede seleccionar estaciones y/o sistemas según las necesidades del servicio.
                </div>
                
                {/* Selector de Estaciones */}
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-7 text-muted mb-2">Estaciones</label>
                  {isEditing && esOriginador ? (
                    <select
                      value={''}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        if (!selectedName) return;

                        const currentListString = editedODS.listaPlanta;
                        const currentListArray = currentListString ? currentListString.split(',').map(name => name.trim()) : [];

                        if (!currentListArray.includes(selectedName)) {
                          const newListArray = [...currentListArray, selectedName];
                          const concatenatedNames = newListArray.join(', ');
                          setEditedODS(prev => ({ ...prev, listaPlanta: concatenatedNames || null }));
                        }
                        e.target.value = '';
                      }}
                      className="form-select"
                    >
                      <option value="">Seleccionar estación para añadir...</option>
                      {plantas.map((planta) => (
                        <option key={planta.id} value={planta.nombre}>
                          {planta.nombre}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  
                  {(() => {
                    const currentSelectedList = editedODS.listaPlanta;
                    const selectedNamesArray = currentSelectedList ? currentSelectedList.split(',').map(name => name.trim()).filter(name => name) : [];

                    if (selectedNamesArray.length > 0) {
                      return (
                        <div className="mt-2">
                          <span className="fw-semibold fs-7 text-muted me-2">
                            Estaciones seleccionadas:
                          </span>
                          <div className="mt-1">
                            {selectedNamesArray.map((name, index) => (
                              <span key={index} className="badge badge-light-primary mb-1 me-1 p-2">
                                {name}
                                {isEditing && esOriginador && (
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-icon btn-active-color-danger ms-2"
                                    style={{ height: '20px', width: '20px' }}
                                    onClick={() => {
                                      const newListArray = selectedNamesArray.filter(n => n !== name);
                                      const concatenatedNames = newListArray.join(', ');
                                      setEditedODS(prev => ({ ...prev, listaPlanta: concatenatedNames || null }));
                                    }}
                                  >
                                    <KTIcon iconName='cross' className='fs-7' />
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Selector de Sistemas */}
                <div className="mb-3">
                  <label className="form-label fw-semibold fs-7 text-muted mb-2">Sistemas</label>
                  {isEditing && esOriginador ? (
                    <select
                      value={''}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        if (!selectedName) return;

                        const currentListString = editedODS.listaSistema;
                        const currentListArray = currentListString ? currentListString.split(',').map(name => name.trim()) : [];

                        if (!currentListArray.includes(selectedName)) {
                          const newListArray = [...currentListArray, selectedName];
                          const concatenatedNames = newListArray.join(', ');
                          setEditedODS(prev => ({ ...prev, listaSistema: concatenatedNames || null }));
                        }
                        e.target.value = '';
                      }}
                      className="form-select"
                    >
                      <option value="">Seleccionar sistema para añadir...</option>
                      {sistemas.map((sistema) => (
                        <option key={sistema.id} value={sistema.nombre}>
                          {sistema.nombre}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  
                  {(() => {
                    const currentSelectedList = editedODS.listaSistema;
                    const selectedNamesArray = currentSelectedList ? currentSelectedList.split(',').map(name => name.trim()).filter(name => name) : [];

                    if (selectedNamesArray.length > 0) {
                      return (
                        <div className="mt-2">
                          <span className="fw-semibold fs-7 text-muted me-2">
                            Sistemas seleccionados:
                          </span>
                          <div className="mt-1">
                            {selectedNamesArray.map((name, index) => (
                              <span key={index} className="badge badge-light-info mb-1 me-1 p-2">
                                {name}
                                {isEditing && esOriginador && (
                                  <button
                                    type="button"
                                    className="btn btn-xs btn-icon btn-active-color-danger ms-2"
                                    style={{ height: '20px', width: '20px' }}
                                    onClick={() => {
                                      const newListArray = selectedNamesArray.filter(n => n !== name);
                                      const concatenatedNames = newListArray.join(', ');
                                      setEditedODS(prev => ({ ...prev, listaSistema: concatenatedNames || null }));
                                    }}
                                  >
                                    <KTIcon iconName='cross' className='fs-7' />
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 5: Fechas y Plazos */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="calendar" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Fechas y Plazos</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="row g-6">
              {/* Fecha de Asignación - Editable por originador */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6 required">Fecha de Asignación</label>
                {isEditing && esOriginador ? (
                  <input
                    type="date"
                    value={editedODS.fechaInicio ? editedODS.fechaInicio.split('T')[0] : ''}
                    onChange={(e) => setEditedODS({ ...editedODS, fechaInicio: e.target.value })}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedODS.fechaInicio ? new Date(editedODS.fechaInicio).toLocaleDateString('es-CO') : 'No definida'}</span>
                  </div>
                )}
              </div>

              {/* Fecha de Finalización - Editable por originador */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6 required">Fecha de Finalización</label>
                {isEditing && esOriginador ? (
                  <input
                    type="date"
                    value={editedODS.fechaFin ? editedODS.fechaFin.split('T')[0] : ''}
                    onChange={(e) => setEditedODS({ ...editedODS, fechaFin: e.target.value })}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span>{editedODS.fechaFin ? new Date(editedODS.fechaFin).toLocaleDateString('es-CO') : 'No definida'}</span>
                  </div>
                )}
              </div>

              {/* Plazo en días - Solo lectura (calculado) */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6">Plazo de Ejecución</label>
                <div className="bg-primary bg-opacity-10 rounded p-3 border border-primary border-opacity-25">
                  <span className="fw-bold text-primary fs-5">{calcularPlazo()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 6: Valores Económicos */}
        <div className="card mb-8">
          <div className="card-header border-0 py-6">
            <div className="card-title">
              <div className="d-flex align-items-center position-relative my-1">
                <KTIcon iconName="dollar" className="fs-1 position-absolute ms-6" />
                <h3 className="fw-bold ms-15">Valores Económicos</h3>
              </div>
            </div>
          </div>
          <div className="card-body pt-0">
            {/* Valores principales editables */}
            <div className="row g-6 mb-8">
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6 required">Valor HH</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Valor Hora Hombre"
                    value={formatCurrency(editedODS.valorHH)}
                    onChange={(e) => handleChangeCurrency('valorHH', e.target.value)}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold fs-5 text-success">
                      {formatCurrency(editedODS.valorHH)}
                    </span>
                  </div>
                )}
              </div>

              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6 required">Valor Viajes</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Valor Viajes"
                    value={formatCurrency(editedODS.valorViaje)}
                    onChange={(e) => handleChangeCurrency('valorViaje', e.target.value)}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold fs-5 text-info">
                      {formatCurrency(editedODS.valorViaje)}
                    </span>
                  </div>
                )}
              </div>

              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6 required">Valor Estudios</label>
                {isEditing && esOriginador ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Valor Estudios"
                    value={formatCurrency(editedODS.valorEstudio)}
                    onChange={(e) => handleChangeCurrency('valorEstudio', e.target.value)}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold fs-5 text-warning">
                      {formatCurrency(editedODS.valorEstudio)}
                    </span>
                  </div>
                )}
              </div>

              {/* Porcentaje Gasto Reembolsable - Editable por originador */}
              <div className="col-lg-4">
                <label className="form-label fw-semibold fs-6 required">Porcentaje Gasto Reembolsable (%)</label>
                {isEditing && esOriginador ? (
                  <input
                    type="number"
                    placeholder="Porcentaje Gasto Reembolsable"
                    value={editedODS.porcentajeGastoReembolsable ?? ''}
                    onChange={(e) => setEditedODS(prev => ({ ...prev, porcentajeGastoReembolsable: parseInt(e.target.value) || 0 }))}
                    className="form-control"
                    required
                  />
                ) : (
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold fs-5">{editedODS.porcentajeGastoReembolsable ?? 0}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Valores iniciales (solo lectura) */}
            <div className="mb-6">
              <h4 className="fw-bold text-muted mb-4">Valores Iniciales</h4>
              <div className="row g-6">
                <div className="col-lg-3">
                  <label className="form-label fw-semibold fs-6">Valor Inicial HH</label>
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold text-success">
                      {formatCurrency(editedODS.valorInicialHH)}
                    </span>
                  </div>
                </div>

                <div className="col-lg-3">
                  <label className="form-label fw-semibold fs-6">Valor Inicial Viajes</label>
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold text-info">
                      {formatCurrency(editedODS.valorInicialViaje)}
                    </span>
                  </div>
                </div>

                <div className="col-lg-3">
                  <label className="form-label fw-semibold fs-6">Valor Inicial Estudios</label>
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold text-warning">
                      {formatCurrency(editedODS.valorInicialEstudio)}
                    </span>
                  </div>
                </div>

                <div className="col-lg-3">
                  <label className="form-label fw-semibold fs-6">Valor Inicial Suma Global Fija</label>
                  <div className="bg-light rounded p-3">
                    <span className="fw-bold text-primary">
                      {formatCurrency(editedODS.valorInicialSumaGlobalFija ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Valores calculados y de seguimiento */}
            <div className="row g-6 mb-6">
              <div className="col-lg-3">
                <div className="card card-flush bg-success bg-opacity-10 border border-success border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="dollar" className="fs-1 text-success mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Suma Global Fija</div>
                    <div className="fw-bolder fs-4 text-success">
                      {formatCurrency(editedODS.valorHH + editedODS.valorViaje + editedODS.valorEstudio)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="card card-flush bg-info bg-opacity-10 border border-info border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="wallet" className="fs-1 text-info mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Disponible</div>
                    <div className="fw-bolder fs-4 text-info">
                      {editedODS.valorDisponible != null ? formatCurrency(editedODS.valorDisponible) : formatCurrency(0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="card card-flush bg-warning bg-opacity-10 border border-warning border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="chart-pie-simple" className="fs-1 text-warning mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Pagado</div>
                    <div className="fw-bolder fs-4 text-warning">
                      {editedODS.valorPagado != null ? formatCurrency(editedODS.valorPagado) : formatCurrency(0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className="card card-flush bg-primary bg-opacity-10 border border-primary border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="bank" className="fs-1 text-primary mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Falta Por Pagar</div>
                    <div className="fw-bolder fs-4 text-primary">
                      {editedODS.valorFaltaPorPagar != null ? formatCurrency(editedODS.valorFaltaPorPagar) : formatCurrency(0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Valores adicionales */}
            <div className="row g-6">
              <div className="col-lg-4">
                <div className="card card-flush bg-secondary bg-opacity-10 border border-secondary border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="percent" className="fs-1 text-secondary mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Gasto Reembolsable</div>
                    <div className="fw-bolder fs-4 text-secondary">
                      {formatCurrency(editedODS.valorGastoReembolsable ?? 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card card-flush bg-dark bg-opacity-10 border border-dark border-opacity-25">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="check-circle" className="fs-1 text-dark mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Habilitado</div>
                    <div className="fw-bolder fs-4 text-dark">
                      {formatCurrency(editedODS.valorHabilitado ?? 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card card-flush bg-light border border-light">
                  <div className="card-body text-center py-6">
                    <KTIcon iconName="calculator" className="fs-1 text-gray-600 mb-3" />
                    <div className="fw-bold fs-6 text-gray-800 mb-2">Valor Inicial Calculado</div>
                    <div className="fw-bolder fs-4 text-gray-600">
                      {formatCurrency(editedODS.valorInicialHH + editedODS.valorInicialViaje + editedODS.valorInicialEstudio)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Avance de Hitos de Pago */}
            <div className="row g-6 mt-6">
              <div className="col-12">
                <label className="form-label fw-semibold fs-6">Avance Hitos de Pago</label>
                <div className="progress" style={{ height: "20px" }}>
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: `${editedODS.avance}%` }}
                    aria-valuenow={editedODS.avance}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >{Math.round(editedODS.avance)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de estado de carga de SECS */}
      {(!Array.isArray(indicadoresSECS) || indicadoresSECS.length === 0) && (
        <div className='row mb-5 p-5'>
          <div className='col-12'>
            <div className='alert alert-info d-flex align-items-center'>
              <KTIcon iconName="information-2" className="fs-2 me-3" />
              <div>
                <strong>Cargando datos SECS...</strong> Los gráficos se actualizarán automáticamente cuando se obtengan los datos de los indicadores SECS para la Sub-ODS {selectedODSId}.
              </div>
            </div>
          </div>
        </div>
      )}

      {Array.isArray(indicadoresSECS) && indicadoresSECS.length > 0 && (
        <div className='row mb-5 p-5'>
          <div className='col-12'>
            <div className='alert alert-success d-flex align-items-center'>
              <KTIcon iconName="check-circle" className="fs-2 me-3" />
              <div>
                <strong>Datos SECS cargados:</strong> Se encontraron {indicadoresSECS.length} registros de indicadores SECS para la Sub-ODS {selectedODSId}. 
                {getLatestSECSData() && (
                  <span> Última calificación: <strong>{getLatestSECSData()?.totalPonderado || 0}%</strong> ({new Date(getLatestSECSData()?.fecha || '').toLocaleDateString('es-ES')})</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='row g-5 mb-10 p-5'>
        <div className='col'>
          <RadialBarChart 
            title="SECS asociados al cumplimiento en la ejecución de proyectos"
            data={getTripleRestriccionData().data}
            labels={getTripleRestriccionData().labels}
            totalLabel="Promedio"
          />
        </div>
        <div className='col'>
          <RadialBarChart 
            title="SECS asociados a las obligaciones del contratista"
            data={getCalidadData().data}
            labels={getCalidadData().labels}
            totalLabel="Promedio"
          />
        </div>
        <div className='col'>
          <RadialBarChart 
            title="SECS asociado a la entrega de información contractual"
            data={getEntregablesData().data}
            labels={getEntregablesData().labels}
            totalLabel="Promedio"
          />
        </div>
      </div>

      <div className='row g-5 g-xl-10 mb-10 p-5'>
        <div className='col-xl-12'>
          <AreaChart 
            title="Avance semanal del puntaje total ponderado de los indicadores SECS"
            series={[{ name: 'Puntaje total ponderado', data: getPromedioSECSData().data }]}
            categories={getPromedioSECSData().categories}
          />
        </div>
      </div>

      {/* Widgets adicionales - Solo se muestran si el servicio no está en estado pendiente o rechazado */}
      {(editedODS.estado !== 0 && editedODS.estado !== 5) && (
        <>
          <HitosPagoWidget selectedODSId={selectedODSId} onUpdate={() => fetchODS(selectedODSId)} />
          <TalleresWidget selectedODSId={selectedODSId} onUpdate={() => fetchODS(selectedODSId)} />
          {editedODS.tipoODS == 7 ? <GanttChart selectedODSId={selectedODSId} onUpdate={() => fetchODS(selectedODSId)} /> : null}
          <SPIWidget selectedODSId={selectedODSId} onUpdate={() => fetchODS(selectedODSId)} />
          <div className='row g-5 g-xl-10 mb-10 p-5'>
            <div className='col-xl-12'>
              <AreaChart 
                title="Avance semanal del Índice de Ejecución del Programa (Ruta Crítica)"
                series={getSPITimeSeriesData().series}
                categories={getSPITimeSeriesData().categories}
              />
            </div>
          </div>
          <HallazgosODSWidget selectedODSId={selectedODSId} onUpdate={() => fetchODS(selectedODSId)} />
          <div className='row g-5 g-xl-10 mb-10 p-5'>
            <div className='col-xl-12'>
              <AreaChart 
                title="Evolución semanal de hallazgos - Total vs Cerrados"
                series={getHallazgosTimeSeriesData().series}
                categories={getHallazgosTimeSeriesData().categories}
              />
            </div>
          </div>
          <NoConformidadesODSWidget selectedODSId={selectedODSId} onUpdate={() => fetchODS(selectedODSId)} />
          <div className='row g-5 g-xl-10 mb-10 p-5'>
            <div className='col-xl-12'>
              <AreaChart 
                title="Evolución semanal de no conformidades - Total vs Cerradas"
                series={getNoConformidadesTimeSeriesData().series}
                categories={getNoConformidadesTimeSeriesData().categories}
              />
            </div>
          </div>
          <DocumentosODSWidget selectedODSId={selectedODSId} onUpdate={() => fetchODS(selectedODSId)} />
          <div className='row g-5 g-xl-10 mb-10 p-5'>
            <div className='col-xl-12'>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <h3 className="fw-bold">Evolución semanal de documentos - Planeado vs Real</h3>
                  </div>
                  <div className="card-toolbar">
                    <select
                      className="form-select form-select-sm w-200px"
                      value={selectedDocumentType}
                      onChange={(e) => setSelectedDocumentType(e.target.value)}
                    >
                      {documentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="card-body">
                  <AreaChart 
                    title=""
                    series={getDocumentosTimeSeriesData().series}
                    categories={getDocumentosTimeSeriesData().categories}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modales de confirmación */}

      {modalType === 'edit' && (
        <ModalDialog
          title="Editar Servicio"
          content="¿Estás seguro de que deseas editar este servicio?"
          textBtn="Editar"
          onConfirm={() => updateODS(editedODS)}
          closeModal={closeModal}
        />
      )}

      {modalType === 'approve' && (
        <ModalDialog
          title="Aprobar Servicio"
          content={`¿Estás seguro de que deseas aprobar el servicio "${editedODS.nombre}"?`}
          textBtn="Aprobar"
          onConfirm={() => { setEditedODS({ ...editedODS, estaAprobada: true, estaRechazada: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'disapprove' && (
        <ModalDialog
          title="Desaprobar Servicio"
          content={`¿Estás seguro de que deseas desaprobar el servicio "${editedODS.nombre}"?`}
          textBtn="Desaprobar"
          onConfirm={() => { setEditedODS({ ...editedODS, estaAprobada: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'cancel' && (
        <ModalDialog
          title="Cancelar Servicio"
          content={`¿Estás seguro de que deseas cancelar el servicio "${editedODS.nombre}"?`}
          textBtn="Cancelar"
          onConfirm={() => { setEditedODS({ ...editedODS, estaCancelada: true }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'uncancel' && (
        <ModalDialog
          title="Descancelar Servicio"
          content={`¿Estás seguro de que deseas descancelar el servicio "${editedODS.nombre}"?`}
          textBtn="Descancelar"
          onConfirm={() => { setEditedODS({ ...editedODS, estaCancelada: false }); closeModal() }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'reject' && (
        <ModalDialog
          title="Rechazar Servicio"
          content={
            <div>
              <p>¿Estás seguro de que deseas rechazar el servicio "{editedODS.nombre}"?</p>
              <div className="form-group mt-3">
                <label className="form-label">Comentario de Rechazo:</label>
                <textarea
                  placeholder="Ingrese el motivo del rechazo"
                  value={editedODS.comentarioAprobacion || ''}
                  onChange={(e) => setEditedODS(prev => ({ ...prev, comentarioAprobacion: e.target.value }))}
                  className="form-control"
                  rows={3}
                  required
                />
              </div>
            </div>
          }
          textBtn="Rechazar"
          confirmButtonClass="btn-warning"
          onConfirm={() => {
            if (!editedODS.comentarioAprobacion?.trim()) {
              alert("El comentario de rechazo es obligatorio");
              return;
            }
            setEditedODS({ ...editedODS, estaRechazada: true, estaAprobada: false });
            closeModal();
          }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'unreject' && (
        <ModalDialog
          title="Desrechazar Servicio"
          content={`¿Estás seguro de que deseas quitar el rechazo del servicio "${editedODS.nombre}"?`}
          textBtn="Desrechazar"
          onConfirm={() => {
            setEditedODS({ ...editedODS, estaRechazada: false, comentarioAprobacion: null });
            closeModal();
          }}
          closeModal={closeModal}
        />
      )}

      {modalType === 'delete' && (
        <ModalDialog
          title="Eliminar Servicio"
          content={`¿Está seguro que desea eliminar el Servicio ${editedODS.nombre}? Tenga en cuenta que esta acción eliminará todos los Talleres asociados a este servicio.`}
          textBtn="Eliminar"
          confirmButtonClass="btn-danger"
          onConfirm={deleteODS}
          closeModal={closeModal}
        />
      )}
    </>
  )
}
