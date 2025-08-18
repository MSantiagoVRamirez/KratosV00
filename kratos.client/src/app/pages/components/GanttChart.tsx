import { useState, useMemo, useEffect, useCallback } from 'react';
import { TareaPDT } from '../../interfaces/contratos-ods/TareaPDT';
import { Taller } from '../../interfaces/talleres-hallazgos/Taller';
import { ODS } from '../../interfaces/contratos-ods/ODS';
import { HitoPago } from '../../interfaces/contratos-ods/HitoPago';
import tareaPDTService from '../../services/contratos-ods/tareaPDTService';
import tallerService from '../../services/talleres-hallazgos/tallerService';
import odsService from '../../services/contratos-ods/odsService';
import hitoPagoService from '../../services/contratos-ods/hitoPagoService';
import { ModalDialog } from './ModalDialog';
import { KTIcon } from '../../../_metronic/helpers';
import { useFormValidation } from '../../hooks/useFormValidation';

export default function GanttChart({ selectedODSId, onUpdate }: { selectedODSId: number, onUpdate?: () => void }) {

  const defaultTarea: TareaPDT = {
    id: 0,
    nombre: '',
    fechaInicio: '',
    duracion: 0,
    fechaFin: null,
    avanceActual: null,
    avanceReal: null,
    odsId: selectedODSId || 0,
    tallerId: null,
    hitoPagoId: null,
    tareaPadreId: null
  };
  const [tareas, setTareas] = useState<TareaPDT[]>([]);
  const [editedTarea, setEditedTarea] = useState<TareaPDT>(defaultTarea);
  const [deleteTareaId, setDeleteTareaId] = useState<number>(0);

  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [ordenesServicio, setOrdenesServicio] = useState<ODS[]>([]);
  const [hitosPago, setHitosPago] = useState<HitoPago[]>([]);

  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [showDependencies, setShowDependencies] = useState<boolean>(true);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    task: TareaPDT | null;
  }>({ show: false, x: 0, y: 0, task: null });

  const closeModal = () => setModalType(null)

  // Validación del formulario
  const isFormValid = useFormValidation({
    nombre: { value: editedTarea.nombre, required: true, type: 'string' },
    fechaInicio: { value: editedTarea.fechaInicio, required: true, type: 'date' },
    duracion: { value: editedTarea.duracion, required: false, type: 'number' },
    odsId: { value: editedTarea.odsId, required: true, type: 'select' },
    hitoPagoId: { value: editedTarea.hitoPagoId, required: false, type: 'select' }
  });

  // Constantes de layout
  const ROW_HEIGHT = 60;
  const TASK_BAR_HEIGHT = 30;
  const MILESTONE_SIZE = 24;
  const HEADER_HEIGHT = 40;

  const fetchTareas = () => {
    tareaPDTService.getAll()
      .then((response) => {
        // Debug: verificar qué está llegando en la respuesta
        console.log('Respuesta del servicio tareas:', response);
        console.log('response.data tipo:', typeof response.data);
        console.log('response.data es array:', Array.isArray(response.data));
        console.log('response.data contenido:', response.data);
        
        // Validar que response.data sea un array
        const tareasData = Array.isArray(response.data) ? response.data : [];
        setTareas(tareasData)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las tareas", error)
        setTareas([]); // Asegurar que siempre sea un array en caso de error
      })
  }

  const fetchTalleres = () => {
    tallerService.getAll()
      .then((response) => {
        // Debug: verificar qué está llegando en la respuesta
        console.log('Respuesta del servicio talleres:', response);
        console.log('response.data tipo:', typeof response.data);
        console.log('response.data es array:', Array.isArray(response.data));
        console.log('response.data contenido:', response.data);
        
        // Validar que response.data sea un array
        const talleresData = Array.isArray(response.data) ? response.data : [];
        setTalleres(talleresData)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los talleres", error)
        setTalleres([]); // Asegurar que siempre sea un array en caso de error
      })
  }

  const fetchOrdenesServicio = () => {
    odsService.getAll()
      .then((response) => {
        // Debug: verificar qué está llegando en la respuesta
        console.log('Respuesta del servicio órdenes de servicio:', response);
        console.log('response.data tipo:', typeof response.data);
        console.log('response.data es array:', Array.isArray(response.data));
        console.log('response.data contenido:', response.data);
        
        // Validar que response.data sea un array
        const ordenesData = Array.isArray(response.data) ? response.data : [];
        setOrdenesServicio(ordenesData)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener las órdenes de servicio", error)
        setOrdenesServicio([]); // Asegurar que siempre sea un array en caso de error
      })
  }

  const fetchHitosPago = () => {
    hitoPagoService.getAll()
      .then((response) => {
        // Debug: verificar qué está llegando en la respuesta
        console.log('Respuesta del servicio hitos de pago:', response);
        console.log('response.data tipo:', typeof response.data);
        console.log('response.data es array:', Array.isArray(response.data));
        console.log('response.data contenido:', response.data);
        
        // Validar que response.data sea un array
        const hitosData = Array.isArray(response.data) ? response.data : [];
        setHitosPago(hitosData)
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los hitos de pago", error)
        setHitosPago([]); // Asegurar que siempre sea un array en caso de error
      })
  }

  useEffect(() => {
    fetchTareas();
    fetchTalleres();
    fetchOrdenesServicio();
    fetchHitosPago();
  }, [selectedODSId]);

  const stringToDate = (dateString: string): Date => {
    if (!dateString) {
      return new Date(NaN);
    }
    const datePart = dateString.split('T')[0];
    return new Date(datePart + 'T00:00:00Z');
  };

  const dateToString = (date: Date): string => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  };

  const calcularFechaFin = (fechaInicio: string, duracion: number): string => {
    const inicio = stringToDate(fechaInicio);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + duracion - 1);
    return dateToString(fin);
  };

  // Función para aplanar las tareas jerárquicas
  const flattenTasks = useCallback((tareas: TareaPDT[]): TareaPDT[] => {
    // Validar que tareas sea un array
    if (!Array.isArray(tareas)) {
      console.warn('flattenTasks: tareas no es un array', tareas);
      return [];
    }
    
    const flattened: TareaPDT[] = [];
    const rootTasks = tareas.filter(t => !t.tareaPadreId);
    
    const addTaskWithChildren = (task: TareaPDT, level: number = 0) => {
      const taskWithLevel = { ...task, level };
      flattened.push(taskWithLevel);
      
      if (expandedTasks.has(task.id)) {
        const children = tareas.filter(t => t.tareaPadreId === task.id);
        children.forEach(child => addTaskWithChildren(child, level + 1));
      }
    };
    
    rootTasks.forEach(task => addTaskWithChildren(task));
    return flattened;
  }, [tareas, expandedTasks]);

  // Función para alternar expansión
  const toggleTaskExpansion = useCallback((taskId: number) => {
    setExpandedTasks(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(taskId)) {
        newExpanded.delete(taskId);
      } else {
        newExpanded.add(taskId);
      }
      return newExpanded;
    });
  }, []);

  // Obtener lista plana de tareas visibles
  const flatTasks = useMemo(() => {
    // Validar que tareas sea un array antes de pasarlo a flattenTasks
    const validTareas = Array.isArray(tareas) ? tareas : [];
    return flattenTasks(validTareas);
  }, [flattenTasks, tareas]);

  // Filtrar tareas por ODS seleccionada
  const filteredTasks = useMemo(() => {
    // Validar que flatTasks sea un array antes de filtrar
    if (!Array.isArray(flatTasks)) {
      console.warn('filteredTasks: flatTasks no es un array', flatTasks);
      return [];
    }
    return selectedODSId !== 0 ? flatTasks.filter(tarea => tarea.odsId === selectedODSId) : flatTasks;
  }, [flatTasks, selectedODSId]);

  // Calcular estadísticas
  const projectStats = useMemo(() => {
    // Validar que tareas sea un array antes de calcular estadísticas
    const validTareas = Array.isArray(tareas) ? tareas : [];
    
    const totalTasks = validTareas.length;
    const completedTasks = validTareas.filter(task => (task.avanceActual || 0) === 100).length;
    const inProgressTasks = validTareas.filter(task => (task.avanceActual || 0) > 0 && (task.avanceActual || 0) < 100).length;
    const notStartedTasks = validTareas.filter(task => (task.avanceActual || 0) === 0).length;
    const averageProgress = totalTasks > 0 ? 
      Math.round(validTareas.reduce((sum, task) => sum + (task.avanceActual || 0), 0) / totalTasks) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      averageProgress
    };
  }, [tareas]);

  // Calcular rango de fechas y configuración de timeline
  const dateRange = useMemo(() => {
    if (filteredTasks.length === 0) {
      const today = new Date();
      return {
        minDate: today.getTime(),
        maxDate: today.getTime() + (30 * 24 * 60 * 60 * 1000), // 30 días
        totalDays: 30
      };
    }

    const fechasInicio = filteredTasks.map(task => stringToDate(task.fechaInicio).getTime());
    const fechasFin = filteredTasks.map(task => {
      const fechaFin = task.fechaFin || calcularFechaFin(task.fechaInicio, task.duracion);
      return stringToDate(fechaFin).getTime();
    });

    let minDate = Math.min(...fechasInicio);
    let maxDate = Math.max(...fechasFin);

    // Ajustar fechas según el viewMode para mejor visualización
    const minDateObj = new Date(minDate);
    const maxDateObj = new Date(maxDate);

    switch (viewMode) {
      case 'weeks':
        // Ajustar al inicio de la semana (lunes)
        const startOfWeek = new Date(minDateObj);
        startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1));
        minDate = startOfWeek.getTime();
        
        // Ajustar al final de la semana (domingo)
        const endOfWeek = new Date(maxDateObj);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - (endOfWeek.getDay() === 0 ? 7 : endOfWeek.getDay())));
        maxDate = endOfWeek.getTime();
        break;
      
      case 'months':
        // Ajustar al inicio del mes
        const startOfMonth = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1);
        minDate = startOfMonth.getTime();
        
        // Ajustar al final del mes
        const endOfMonth = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth() + 1, 0);
        maxDate = endOfMonth.getTime();
        break;
      
      default: // days
        // Agregar un día de margen en cada extremo
        minDate -= 24 * 60 * 60 * 1000;
        maxDate += 24 * 60 * 60 * 1000;
        break;
    }

    const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

    return { minDate, maxDate, totalDays };
  }, [filteredTasks, viewMode]);

  const { minDate, maxDate, totalDays } = dateRange;
  
  // Calcular ancho de timeline según viewMode
  const timelineConfig = useMemo(() => {
    let unitWidth = 25; // ancho base por unidad
    let totalUnits = totalDays;

    switch (viewMode) {
      case 'days':
        unitWidth = totalDays <= 30 ? 40 : totalDays <= 90 ? 25 : 15;
        totalUnits = totalDays;
        break;
      case 'weeks':
        unitWidth = 80;
        totalUnits = Math.ceil(totalDays / 7);
        break;
      case 'months':
        unitWidth = 120;
        totalUnits = Math.ceil(totalDays / 30);
        break;
    }

    const timelineWidthPx = Math.max(1200, totalUnits * unitWidth);
    
    return { timelineWidthPx, unitWidth, totalUnits };
  }, [totalDays, viewMode]);

  const { timelineWidthPx, unitWidth } = timelineConfig;
  unitWidth;

  // Función para verificar si es milestone (duración menor a 1 día)
  const isMilestone = (task: TareaPDT) => task.duracion < 1;

  // Función para obtener posición de tarea
  const getTaskPosition = useCallback((task: TareaPDT) => {
    const fechaInicio = stringToDate(task.fechaInicio);
    const fechaFin = task.fechaFin ? stringToDate(task.fechaFin) : stringToDate(calcularFechaFin(task.fechaInicio, task.duracion));
    
    let leftPx = 0;
    let widthPx = 0;
    
    switch (viewMode) {
      case 'days': {
        const startOffset = Math.floor((fechaInicio.getTime() - minDate) / (1000 * 60 * 60 * 24));
        const endOffset = Math.floor((fechaFin.getTime() - minDate) / (1000 * 60 * 60 * 24));
        const duration = Math.max(1, endOffset - startOffset + 1);
        
        leftPx = (startOffset / totalDays) * timelineWidthPx;
        widthPx = isMilestone(task) ? 0 : (duration / totalDays) * timelineWidthPx;
        break;
      }
      
      case 'weeks': {
        const weekCount = Math.ceil(totalDays / 7);
        const weekWidthPx = timelineWidthPx / weekCount;
        
        // Calcular en qué semana empieza la tarea
        const startWeek = Math.floor((fechaInicio.getTime() - minDate) / (1000 * 60 * 60 * 24 * 7));
        const endWeek = Math.floor((fechaFin.getTime() - minDate) / (1000 * 60 * 60 * 24 * 7));
        const weekDuration = Math.max(1, endWeek - startWeek + 1);
        
        // Posición más precisa dentro de la semana
        const dayInWeek = Math.floor((fechaInicio.getTime() - minDate) / (1000 * 60 * 60 * 24)) % 7;
        const dayWidthInWeek = weekWidthPx / 7;
        
        leftPx = (startWeek * weekWidthPx) + (dayInWeek * dayWidthInWeek);
        
        if (isMilestone(task)) {
          widthPx = 0;
        } else {
          const taskDurationInDays = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          widthPx = Math.min(taskDurationInDays * dayWidthInWeek, weekDuration * weekWidthPx);
        }
        break;
      }
      
      case 'months': {
        // Calcular cantidad de meses en el rango
        const startDateObj = new Date(minDate);
        const endDateObj = new Date(maxDate);
        
        const startMonth = startDateObj.getMonth();
        const startYear = startDateObj.getFullYear();
        const endMonth = endDateObj.getMonth();
        const endYear = endDateObj.getFullYear();
        
        const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
        const monthWidthPx = timelineWidthPx / totalMonths;
        
        // Calcular en qué mes empieza la tarea
        const taskStartMonth = fechaInicio.getMonth();
        const taskStartYear = fechaInicio.getFullYear();
        // const taskEndMonth = fechaFin.getMonth();
        // const taskEndYear = fechaFin.getFullYear();
        
        const monthOffset = (taskStartYear - startYear) * 12 + (taskStartMonth - startMonth);
        // const monthDuration = Math.max(1, (taskEndYear - taskStartYear) * 12 + (taskEndMonth - taskStartMonth) + 1);
        
        // Posición más precisa dentro del mes
        const dayInMonth = fechaInicio.getDate() - 1; // 0-based
        const daysInStartMonth = new Date(taskStartYear, taskStartMonth + 1, 0).getDate();
        const dayWidthInMonth = monthWidthPx / daysInStartMonth;
        
        leftPx = (monthOffset * monthWidthPx) + (dayInMonth * dayWidthInMonth);
        
        if (isMilestone(task)) {
          widthPx = 0;
        } else {
          // const taskDurationInDays = Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          // Calcular ancho basado en la duración real en días
          let totalWidth = 0;
          let currentDate = new Date(fechaInicio);
          
          while (currentDate <= fechaFin) {
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const dayWidth = monthWidthPx / daysInCurrentMonth;
            
            const isLastMonth = currentDate.getMonth() === fechaFin.getMonth() && currentDate.getFullYear() === fechaFin.getFullYear();
            const daysToAdd = isLastMonth ? 
              fechaFin.getDate() - currentDate.getDate() + 1 : 
              daysInCurrentMonth - currentDate.getDate() + 1;
            
            totalWidth += daysToAdd * dayWidth;
            
            // Mover al primer día del siguiente mes
            currentDate = new Date(currentYear, currentMonth + 1, 1);
          }
          
          widthPx = totalWidth;
        }
        break;
      }
    }
    
    return {
      left: `${leftPx}px`,
      width: isMilestone(task) ? '0px' : `${Math.max(5, widthPx)}px`, // Mínimo 5px para visibilidad
      isMilestone: isMilestone(task)
    };
  }, [minDate, totalDays, timelineWidthPx, viewMode]);

  // Calcular posiciones de todas las tareas para las dependencias
  const taskPositions = useMemo(() => {
    const positions = new Map<number, { y: number; left: number; width: number; isMilestone: boolean; visible: boolean; rowIndex: number }>();
    
    // Primero calculamos las posiciones de las tareas visibles
    filteredTasks.forEach((task, index) => {
      const { left: leftStr, width: widthStr, isMilestone: isMilestone } = getTaskPosition(task);
      const left = parseFloat(leftStr.replace('px', ''));
      const width = parseFloat(widthStr.replace('px', ''));
      
      // Calcular la posición Y exacta donde está la barra de la tarea
      // Cada fila tiene ROW_HEIGHT de altura, y las barras están centradas verticalmente
      const rowCenterY = HEADER_HEIGHT + (index + 0.5) * ROW_HEIGHT;
      positions.set(task.id, {
        y: rowCenterY,
        left: left,
        width: width,
        isMilestone: isMilestone,
        visible: true,
        rowIndex: index,
      });
    });

    // Luego calculamos las posiciones de las tareas no visibles pero que tienen dependencias
    const validTareas = Array.isArray(tareas) ? tareas : [];
    validTareas.forEach((task) => {
      if (!positions.has(task.id)) {
        const { left: leftStr, width: widthStr, isMilestone: milestone } = getTaskPosition(task);
        const left = parseFloat(leftStr.replace('px', ''));
        const width = parseFloat(widthStr.replace('px', ''));
        positions.set(task.id, {
          y: -ROW_HEIGHT, // Posición arriba del área visible
          left: left,
          width: width,
          isMilestone: milestone,
          visible: false,
          rowIndex: -1,
        });
      }
    });

    return positions;
  }, [filteredTasks, tareas, getTaskPosition, ROW_HEIGHT]);

  const fetchTarea = (id: number) => {
    tareaPDTService.get(id)
      .then((response) => {
        setEditedTarea(response.data)
        setModalType('edit')
      })
      .catch((error) => {
        console.error("Hubo un error al obtener la tarea", error)
      })
  }

  const createTarea = (data: TareaPDT) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    tareaPDTService.create(dataToSend)
      .then(() => {
        setEditedTarea(defaultTarea)
        closeModal()
        fetchTareas()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al crear la tarea", error)
        alert(`Error al crear tarea: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const updateTarea = (data: TareaPDT) => {
    const dataToSend = { ...data, odsId: data.odsId || selectedODSId };
    tareaPDTService.update(dataToSend)
      .then(() => {
        setEditedTarea(defaultTarea)
        closeModal()
        fetchTareas()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al actualizar la tarea", error)
        alert(`Error al actualizar tarea: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const deleteTarea = () => {
    tareaPDTService.remove(deleteTareaId)
      .then(() => {
        setDeleteTareaId(0)
        closeModal()
        fetchTareas()
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        console.error("Hubo un error al eliminar la tarea", error)
        alert(`Error al eliminar tarea: ${error.response?.data || error.response?.data?.message || error.message}`);
      })
  }

  const openEditModal = (id: number) => {
    fetchTarea(id)
    setModalType('edit')
  }

  const openDeleteModal = (id: number) => {
    setDeleteTareaId(id)
    setModalType('delete')
  }

  // Efecto para actualizar fecha fin cuando cambia fecha inicio o duración
  useEffect(() => {
    if (modalType === 'create' || modalType === 'edit') {
      if (editedTarea.fechaInicio && editedTarea.duracion > 0) {
        const nuevaFechaFin = calcularFechaFin(editedTarea.fechaInicio, editedTarea.duracion);
        setEditedTarea(prev => ({ ...prev, fechaFin: nuevaFechaFin }));
      }
    }
  }, [editedTarea.fechaInicio, editedTarea.duracion, modalType]);

  // Generar encabezados de fecha
  const generateDateHeaders = () => {
    const headers = [];
    const startDate = new Date(minDate);
    
    switch (viewMode) {
      case 'days': {
        const dayWidthPx = timelineWidthPx / totalDays;
        
        for (let i = 0; i < totalDays; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + i);
          
          // Determinar si mostrar etiqueta
          let shouldShowLabel = false;
          let labelContent = '';
          
          if (totalDays <= 31) {
            // Para períodos cortos, mostrar todos los días
            shouldShowLabel = true;
            labelContent = currentDate.getDate().toString();
          } else if (totalDays <= 62) {
            // Para períodos medianos, mostrar cada 2 días
            shouldShowLabel = i % 2 === 0;
            labelContent = currentDate.getDate().toString();
          } else {
            // Para períodos largos, mostrar solo los lunes
            shouldShowLabel = currentDate.getDay() === 1;
            labelContent = currentDate.getDate().toString();
          }
          
          headers.push(
            <div
              key={`day-${i}`}
              className="text-xs text-gray-600 px-1 py-1 border-r border-gray-100 text-center fw-semibold bg-light"
              style={{ 
                width: `${dayWidthPx}px`,
                minWidth: `${Math.max(20, dayWidthPx)}px`,
                fontSize: totalDays > 90 ? '8px' : '10px',
                lineHeight: '1.2'
              }}
            >
              {shouldShowLabel && (
                <div>
                  <div className="fw-bold">{labelContent}</div>
                  {(currentDate.getDate() === 1 || i === 0) && (
                    <div style={{ fontSize: '7px', opacity: 0.7 }}>
                      {currentDate.toLocaleDateString('es-ES', { month: 'short' })}
                    </div>
                  )}
                  {currentDate.getDay() === 1 && totalDays > 31 && (
                    <div style={{ fontSize: '6px', opacity: 0.6, marginTop: '1px' }}>
                      S{Math.ceil((i + 1) / 7)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }
        break;
      }
      
      case 'weeks': {
        const weekCount = Math.ceil(totalDays / 7);
        const weekWidthPx = timelineWidthPx / weekCount;
        
        for (let i = 0; i < weekCount; i++) {
          const weekStartDate = new Date(startDate);
          weekStartDate.setDate(weekStartDate.getDate() + (i * 7));
          
          // Ajustar al lunes de esa semana
          const mondayOfWeek = new Date(weekStartDate);
          const dayOfWeek = mondayOfWeek.getDay();
          const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          mondayOfWeek.setDate(mondayOfWeek.getDate() + daysToMonday);
          
          const weekEndDate = new Date(mondayOfWeek);
          weekEndDate.setDate(weekEndDate.getDate() + 6);
          
          headers.push(
            <div
              key={`week-${i}`}
              className="text-xs text-gray-600 px-2 py-1 border-r border-gray-200 text-center fw-semibold bg-light"
              style={{ 
                width: `${weekWidthPx}px`,
                minWidth: `${weekWidthPx}px`,
                fontSize: '10px',
                lineHeight: '1.2'
              }}
            >
              <div>
                <div className="fw-bold text-primary">Semana {i + 1}</div>
                <div style={{ fontSize: '8px', opacity: 0.8 }}>
                  {mondayOfWeek.getDate()}/{mondayOfWeek.getMonth() + 1} - {weekEndDate.getDate()}/{weekEndDate.getMonth() + 1}
                </div>
                <div style={{ fontSize: '7px', opacity: 0.6 }}>
                  {mondayOfWeek.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })}
                </div>
              </div>
            </div>
          );
        }
        break;
      }
      
      case 'months': {
        const monthSet = new Set<string>();
        const months: Array<{date: Date, days: number}> = [];
        
        // Recopilar todos los meses únicos en el rango
        for (let i = 0; i < totalDays; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(currentDate.getDate() + i);
          const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
          
          if (!monthSet.has(monthKey)) {
            monthSet.add(monthKey);
            const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            const daysInMonth = monthEnd.getDate();
            months.push({ date: monthStart, days: daysInMonth });
          }
        }
        
        months.forEach((month, index) => {
          const monthWidthPx = timelineWidthPx / months.length;
          
          headers.push(
            <div
              key={`month-${index}`}
              className="text-xs text-gray-600 px-3 py-1 border-r border-gray-200 text-center fw-semibold bg-light"
              style={{ 
                width: `${monthWidthPx}px`,
                minWidth: `${monthWidthPx}px`,
                fontSize: '11px',
                lineHeight: '1.3'
              }}
            >
              <div>
                <div className="fw-bold text-primary">
                  {month.date.toLocaleDateString('es-ES', { month: 'long' })}
                </div>
                <div style={{ fontSize: '9px', opacity: 0.7 }}>
                  {month.date.getFullYear()}
                </div>
                <div style={{ fontSize: '7px', opacity: 0.6 }}>
                  {month.days} días
                </div>
              </div>
            </div>
          );
        });
        break;
      }
    }
    
    return headers;
  };

  return (
    <div className='m-10'>
      <style>{`
        .dependency-label {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 600;
          pointer-events: none;
          user-select: none;
        }
        
        .gantt-container svg path {
          transition: all 0.2s ease;
        }
        
        .gantt-container svg path:hover {
          stroke-width: 3 !important;
          opacity: 1 !important;
        }
        
        .gantt-container svg circle {
          transition: all 0.2s ease;
        }
        
        .task-bar {
          transition: all 0.2s ease;
        }
        
        .task-bar:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
        }
      `}</style>
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center w-100">
            <h3 className="card-title">Diagrama de Gantt - PDT</h3>
            <div className="d-flex gap-8">
                <div className="d-flex gap-8">
                  <div className="text-center">
                    <div className="fw-bold text-primary fs-4">{projectStats.totalTasks}</div>
                    <div className="text-muted fs-7">Total Tareas</div>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold text-success fs-4">{projectStats.completedTasks}</div>
                    <div className="text-muted fs-7">Completadas</div>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold text-warning fs-4">{projectStats.inProgressTasks}</div>
                    <div className="text-muted fs-7">En Progreso</div>
                  </div>
                  <div className="text-center">
                    <div className="fw-bold text-info fs-4">{projectStats.averageProgress}%</div>
                    <div className="text-muted fs-7">Progreso Promedio</div>
                  </div>
                </div>
              <button 
                className="btn btn-sm btn-light-primary" 
                onClick={() => {
                  setEditedTarea({
                    ...defaultTarea,
                    nombre: '',
                    fechaInicio: dateToString(new Date()),
                    duracion: 1,
                    avanceActual: 0,
                    avanceReal: 0,
                    odsId: selectedODSId,
                    hitoPagoId: null
                  });
                  setModalType('create');
                }}
              >
                <KTIcon iconName="plus" className="fs-3" /> Agregar Tarea
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-body border-bottom">
          <div className="d-flex flex-wrap gap-8 align-items-center">
            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0 fw-semibold">Vista:</label>
              <select 
                className="form-select form-select-sm" 
                style={{ width: 'auto' }}
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'days' | 'weeks' | 'months')}
              >
                <option value="days">Días</option>
                <option value="months">Meses</option>
                <option value="weeks">Semanas</option>
              </select>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button 
                className="btn btn-sm btn-light"
                onClick={() => {
                  const validTareas = Array.isArray(tareas) ? tareas : [];
                  const allParentIds = new Set(validTareas.filter(t => validTareas.some(child => child.tareaPadreId === t.id)).map(t => t.id));
                  setExpandedTasks(allParentIds);
                }}
              >
                <span className="me-1">⊞</span>
                Expandir todo
              </button>
              <button 
                className="btn btn-sm btn-light"
                onClick={() => setExpandedTasks(new Set())}
              >
                <span className="me-1">⊟</span>
                Colapsar todo
              </button>
              <button 
                className={`btn btn-sm ${showDependencies ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setShowDependencies(!showDependencies)}
              >
                <span className="me-1">↗</span>
                {showDependencies ? 'Ocultar' : 'Mostrar'} Dependencias
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="gantt-container position-relative" style={{ overflowX: 'auto', minHeight: '500px' }}>
            {/* Encabezado de fechas */}
            <div className="d-flex bg-light border-bottom" style={{ minWidth: `${timelineWidthPx + 250}px`, height: `${HEADER_HEIGHT}px` }}>
              <div className="fw-bold p-3 border-r border-gray-200 bg-light" style={{ width: '250px', minWidth: '250px' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Tareas PDT</span>
                  <small className="text-muted">
                    {totalDays} días
                  </small>
                </div>
              </div>
              <div className="d-flex flex-1" style={{ position: 'relative' }}>
                {generateDateHeaders()}
              </div>
            </div>

            {/* Filas de tareas */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-5" style={{ minWidth: `${timelineWidthPx + 250}px` }}>
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <KTIcon iconName="file-deleted" className="fs-2x text-muted mb-3" />
                  <span className="text-muted fs-4 mb-3">No hay tareas PDT para mostrar</span>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setEditedTarea({
                        ...defaultTarea,
                        nombre: '',
                        fechaInicio: dateToString(new Date()),
                        duracion: 1,
                        avanceActual: 0,
                        avanceReal: 0,
                        odsId: selectedODSId,
                        hitoPagoId: null
                      });
                      setModalType('create');
                    }}
                  >
                    <KTIcon iconName="plus" className="fs-3" /> Crear Primera Tarea
                  </button>
                </div>
              </div>
            ) : (
              filteredTasks.map((task, index) => {
                const validTareas = Array.isArray(tareas) ? tareas : [];
                const hasChildren = validTareas.some(t => t.tareaPadreId === task.id);
                const level = (task as any).level || 0;
                
                return (
                  <div
                    key={task.id}
                    className={`d-flex border-bottom ${selectedTask === task.id ? 'bg-primary bg-opacity-10' : index % 2 === 0 ? 'bg-light' : 'bg-gray'} `}
                    style={{ width: `${timelineWidthPx + 250}px`, height: `${ROW_HEIGHT}px` }}
                    onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                  >
                    {/* Nombre de la tarea */}
                    <div
                      className="p-3 d-flex align-items-center border-r border-gray-200"
                      style={{ width: '250px', minWidth: '250px' }}
                    >
                      <div className="w-100">
                        <div className="d-flex align-items-center justify-content-between mb-1 w-100">
                          <div style={{ width: `${level * 15}px` }}></div>
                          
                          {hasChildren ? (
                            <button
                              className="btn btn-sm btn-icon btn-light border-0 p-1"
                              style={{ width: '20px', height: '20px', minWidth: '20px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskExpansion(task.id);
                              }}
                            >
                              <span className="fs-8">
                                {expandedTasks.has(task.id) ? '▼' : '▶'}
                              </span>
                            </button>
                          ) : (
                            <div style={{ width: '20px' }}></div>
                          )}
                          
                          <div className="text-info">
                            {hasChildren ? '📁' : isMilestone(task) ? '📍' : '📋'}
                          </div>
                          
                          <div className={`flex-1 ${level > 0 ? 'text-muted' : 'fw-semibold text-gray-800'}`}>
                            {task.nombre}
                          </div>
                          
                          <div className="d-flex gap-1">
                            <button 
                              className="btn btn-sm btn-icon btn-light-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(task.id);
                              }}
                              title="Editar tarea"
                            >
                              <KTIcon iconName="pencil" className="fs-4" />
                            </button>
                            <button 
                              className="btn btn-sm btn-icon btn-light-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(task.id);
                              }}
                              title="Eliminar tarea"
                            >
                              <KTIcon iconName="trash" className="fs-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Barra de la tarea */}
                    <div className="flex-1 position-relative d-flex align-items-center">
                      {isMilestone(task) ? (
                        // Milestone
                        <div
                          className="position-relative task-bar milestone"
                          style={{
                            left: getTaskPosition(task).left,
                            width: `${MILESTONE_SIZE}px`,
                            height: `${MILESTONE_SIZE}px`,
                            backgroundColor: '#f59e0b',
                            transform: 'translateX(-12px) rotate(45deg)',
                            cursor: 'pointer',
                            opacity: 0.9,
                            zIndex: 2,
                            borderRadius: '4px',
                            border: '2px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                              show: true,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 10,
                              task: task
                            });
                          }}
                          onMouseLeave={() => {
                            setTooltip({ show: false, x: 0, y: 0, task: null });
                          }}
                        />
                      ) : (
                        // Barra normal
                        <div
                          className="position-relative task-bar"
                          style={{
                            ...getTaskPosition(task),
                            height: `${TASK_BAR_HEIGHT}px`,
                            backgroundColor: '#3b82f6',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            opacity: 0.9,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            zIndex: 2
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                              show: true,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 10,
                              task: task
                            });
                          }}
                          onMouseLeave={() => {
                            setTooltip({ show: false, x: 0, y: 0, task: null });
                          }}
                        >
                          {/* Barra de progreso */}
                          <div
                            style={{
                              width: `${task.avanceActual || 0}%`,
                              height: '100%',
                              backgroundColor: '#10b981',
                              borderRadius: '4px',
                              position: 'relative'
                            }}
                          />
                          
                          {/* Texto de progreso */}
                          <div
                            className="position-absolute top-50 start-50 translate-middle text-white fw-bold"
                            style={{
                              fontSize: '11px',
                              textShadow: '0 1px 3px rgba(0,0,0,0.7)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {task.avanceActual || 0}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Líneas de dependencia */}
            {showDependencies && (
              <svg
                className="position-absolute"
                style={{
                  left: '250px',
                  top: `${0}px`,
                  width: `${timelineWidthPx}px`,
                  height: `${filteredTasks.length * ROW_HEIGHT + HEADER_HEIGHT}px`,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
                </marker>
              </defs>
              {(() => {
                const dependencies: JSX.Element[] = [];
                
                // Crear dependencias solo para tareas visibles que tienen padres
                filteredTasks.forEach(task => {
                  if (!task.tareaPadreId) return;
                  
                  const parentPos = taskPositions.get(task.tareaPadreId);
                  const childPos = taskPositions.get(task.id);

                  if (!parentPos || !childPos || !childPos.visible) return;

                  // Calcular puntos de conexión exactos
                  let startX, startY, endX, endY;
                  
                  if (parentPos.isMilestone) {
                    startX = parentPos.left;
                    startY = parentPos.y + (MILESTONE_SIZE / 2);
                  } else {
                    startX = parentPos.left + (MILESTONE_SIZE / 2);
                    startY = parentPos.y + (TASK_BAR_HEIGHT / 2);
                  }
                  
                  if (childPos.isMilestone) {
                    endX = childPos.left - (MILESTONE_SIZE / 2);
                    endY = childPos.y;
                  } else {
                    endX = childPos.left;
                    endY = childPos.y;
                  }

                  // Crear el path siguiendo el patrón de L
                  let pathData = `M ${startX} ${startY} 
                                  L ${startX} ${endY}
                                  L ${endX} ${endY}`;

                  // Determinar si la dependencia está seleccionada
                  const strokeColor = "#6b7280";
                  const strokeWidth = "1.5";
                  const opacity = "0.8";

                  dependencies.push(
                    <g key={`dep-${task.tareaPadreId}-${task.id}`}>
                      <path
                        d={pathData}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill="none"
                        markerEnd={`url(#arrowhead)`}
                        opacity={opacity}
                        strokeDasharray={"none"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Punto de inicio (desde el borde inferior de la tarea padre) */}
                      <circle
                        cx={startX}
                        cy={startY}
                        r={"2"}
                        fill={strokeColor}
                        opacity={opacity}
                      />
                      {/* Punto de fin (hacia el borde izquierdo de la tarea hija) */}
                      <circle
                        cx={endX}
                        cy={endY}
                        r={"1.5"}
                        fill={strokeColor}
                        opacity={parseFloat(opacity) * 0.8}
                      />
                    </g>
                  );
                });

                return dependencies;
              })()}
            </svg>
            )}

            {/* Cuadrículas verticales para separar días */}
            {(() => {
              const gridLines = [];
              const startDate = new Date(minDate);
              
              switch (viewMode) {
                case 'days': {
                  const dayWidthPx = timelineWidthPx / totalDays;
                  
                  for (let i = 0; i <= totalDays; i++) {
                    const currentDate = new Date(startDate);
                    currentDate.setDate(currentDate.getDate() + i);
                    
                    // Determinar el estilo de la línea según el día
                    let strokeColor = '#e5e7eb'; // Color base (gris claro)
                    let strokeWidth = '1';
                    let opacity = '0.3';
                    
                    if (currentDate.getDay() === 1) {
                      // Lunes - línea más marcada
                      strokeColor = '#9ca3af';
                      strokeWidth = '1.5';
                      opacity = '0.6';
                    } else if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                      // Fines de semana - línea diferente
                      strokeColor = '#f59e0b';
                      opacity = '0.4';
                    }
                    
                    if (currentDate.getDate() === 1) {
                      // Primer día del mes - línea más gruesa
                      strokeColor = '#6366f1';
                      strokeWidth = '2';
                      opacity = '0.7';
                    }
                    
                    const xPosition = i * dayWidthPx;
                    
                    gridLines.push(
                      <line
                        key={`grid-day-${i}`}
                        x1={xPosition}
                        y1={0}
                        x2={xPosition}
                        y2={filteredTasks.length * ROW_HEIGHT + HEADER_HEIGHT}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        strokeDasharray={currentDate.getDay() === 0 || currentDate.getDay() === 6 ? '3,3' : 'none'}
                      />
                    );
                  }
                  break;
                }
                
                case 'weeks': {
                  const weekCount = Math.ceil(totalDays / 7);
                  const weekWidthPx = timelineWidthPx / weekCount;
                  const dayWidthInWeek = weekWidthPx / 7;
                  
                  // Líneas para cada día dentro de las semanas
                  for (let week = 0; week < weekCount; week++) {
                    for (let day = 0; day <= 7; day++) {
                      const dayIndex = (week * 7) + day;
                      if (dayIndex > totalDays) break;
                      
                      const currentDate = new Date(startDate);
                      currentDate.setDate(currentDate.getDate() + dayIndex);
                      
                      let strokeColor = '#e5e7eb';
                      let strokeWidth = '1';
                      let opacity = '0.2';
                      
                      if (day === 0) {
                        // Inicio de semana (lunes)
                        strokeColor = '#6366f1';
                        strokeWidth = '2';
                        opacity = '0.6';
                      } else if (day === 6 || day === 7) {
                        // Fin de semana
                        strokeColor = '#f59e0b';
                        opacity = '0.3';
                      }
                      
                      const xPosition = (week * weekWidthPx) + (day * dayWidthInWeek);
                      
                      gridLines.push(
                        <line
                          key={`grid-week-${week}-day-${day}`}
                          x1={xPosition}
                          y1={0}
                          x2={xPosition}
                          y2={filteredTasks.length * ROW_HEIGHT + HEADER_HEIGHT}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          opacity={opacity}
                          strokeDasharray={day === 6 || day === 7 ? '2,2' : 'none'}
                        />
                      );
                    }
                  }
                  break;
                }
                
                case 'months': {
                  // Calcular meses en el rango
                  const startDateObj = new Date(minDate);
                  const endDateObj = new Date(maxDate);
                  const startMonth = startDateObj.getMonth();
                  const startYear = startDateObj.getFullYear();
                  const endMonth = endDateObj.getMonth();
                  const endYear = endDateObj.getFullYear();
                  
                  const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
                  const monthWidthPx = timelineWidthPx / totalMonths;
                  
                  // Líneas para cada semana dentro de los meses
                  let currentDate = new Date(startDateObj);
                  let xOffset = 0;
                  
                  for (let month = 0; month < totalMonths; month++) {
                    // const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                    const daysInMonth = monthEnd.getDate();
                    const dayWidthInMonth = monthWidthPx / daysInMonth;
                    
                    // Línea de inicio del mes
                    gridLines.push(
                      <line
                        key={`grid-month-start-${month}`}
                        x1={xOffset}
                        y1={0}
                        x2={xOffset}
                        y2={filteredTasks.length * ROW_HEIGHT + HEADER_HEIGHT}
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        opacity="0.7"
                      />
                    );
                    
                    // Líneas para cada semana en el mes
                    for (let day = 7; day < daysInMonth; day += 7) {
                      const weekXPosition = xOffset + (day * dayWidthInMonth);
                      
                      gridLines.push(
                        <line
                          key={`grid-month-${month}-week-${Math.floor(day / 7)}`}
                          x1={weekXPosition}
                          y1={0}
                          x2={weekXPosition}
                          y2={filteredTasks.length * ROW_HEIGHT + HEADER_HEIGHT}
                          stroke="#9ca3af"
                          strokeWidth="1"
                          opacity="0.4"
                          strokeDasharray="2,3"
                        />
                      );
                    }
                    
                    xOffset += monthWidthPx;
                    currentDate.setMonth(currentDate.getMonth() + 1);
                  }
                  
                  // Línea final
                  gridLines.push(
                    <line
                      key="grid-month-end"
                      x1={timelineWidthPx}
                      y1={0}
                      x2={timelineWidthPx}
                      y2={filteredTasks.length * ROW_HEIGHT + HEADER_HEIGHT}
                      stroke="#6366f1"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                  );
                  break;
                }
              }
              
              return (
                <svg
                  className="position-absolute"
                  style={{
                    left: '250px',
                    top: '0px',
                    width: `${timelineWidthPx}px`,
                    height: `${filteredTasks.length * ROW_HEIGHT + HEADER_HEIGHT}px`,
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                >
                  {gridLines}
                </svg>
              );
            })()}

            {/* Línea de "Hoy" */}
            {(() => {
              const today = new Date();
              const todayTime = today.getTime();
              const isInRange = todayTime >= minDate && todayTime <= maxDate;
              
              if (isInRange) {
                let todayPositionPx = 0;
                
                switch (viewMode) {
                  case 'days': {
                    const todayOffset = Math.floor((todayTime - minDate) / (1000 * 60 * 60 * 24));
                    todayPositionPx = (todayOffset / totalDays) * timelineWidthPx;
                    break;
                  }
                  
                  case 'weeks': {
                    const weekCount = Math.ceil(totalDays / 7);
                    const weekWidthPx = timelineWidthPx / weekCount;
                    const todayWeek = Math.floor((todayTime - minDate) / (1000 * 60 * 60 * 24 * 7));
                    const dayInWeek = Math.floor((todayTime - minDate) / (1000 * 60 * 60 * 24)) % 7;
                    const dayWidthInWeek = weekWidthPx / 7;
                    todayPositionPx = (todayWeek * weekWidthPx) + (dayInWeek * dayWidthInWeek);
                    break;
                  }
                  
                  case 'months': {
                    const startDateObj = new Date(minDate);
                    const startMonth = startDateObj.getMonth();
                    const startYear = startDateObj.getFullYear();
                    const endDateObj = new Date(maxDate);
                    const endMonth = endDateObj.getMonth();
                    const endYear = endDateObj.getFullYear();
                    
                    const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
                    const monthWidthPx = timelineWidthPx / totalMonths;
                    
                    const todayMonth = today.getMonth();
                    const todayYear = today.getFullYear();
                    const monthOffset = (todayYear - startYear) * 12 + (todayMonth - startMonth);
                    
                    const dayInMonth = today.getDate() - 1; // 0-based
                    const daysInTodayMonth = new Date(todayYear, todayMonth + 1, 0).getDate();
                    const dayWidthInMonth = monthWidthPx / daysInTodayMonth;
                    
                    todayPositionPx = (monthOffset * monthWidthPx) + (dayInMonth * dayWidthInMonth);
                    break;
                  }
                }
                
                return (
                  <div
                    className="position-absolute bg-danger"
                    style={{
                      left: `${250 + todayPositionPx}px`,
                      top: '0',
                      width: '2px',
                      height: '100%',
                      zIndex: 15,
                      pointerEvents: 'none',
                      opacity: 0.8
                    }}
                  >
                    <div
                      className="position-absolute bg-danger text-white px-2 py-1 rounded shadow-sm"
                      style={{
                        top: '5px',
                        left: '5px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        zIndex: 16
                      }}
                    >
                      HOY
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Información de la tarea seleccionada */}
          {selectedTask && (
            <div className="mt-4 p-4 bg-light rounded w-100">
              {(() => {
                const validTareas = Array.isArray(tareas) ? tareas : [];
                const task = validTareas.find(t => t.id === selectedTask);
                if (!task) return null;

                const children = validTareas.filter(t => t.tareaPadreId === task.id);
                const parent = task.tareaPadreId ? validTareas.find(t => t.id === task.tareaPadreId) : null;

                return (
                  <div className='w-100'>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <h5 className="fw-bold text-primary mb-0">{task.nombre}</h5>
                    </div>
                    
                    {parent && (
                      <div className="mb-3">
                        <small className="text-muted">Tarea padre:</small>
                        <div className="mt-1">
                          <span 
                            className="badge badge-light-secondary cursor-pointer"
                            onClick={() => setSelectedTask(parent.id)}
                          >
                            📁 {parent.nombre}
                          </span>
                        </div>
                      </div>
                    )}

                    {children.length > 0 && (
                      <div className="mb-3">
                        <small className="text-muted">Sub-tareas ({children.length}):</small>
                        <div className="d-flex flex-wrap gap-2 mt-1">
                          {children.map((child) => (
                            <span 
                              key={child.id}
                              className="badge badge-light-info cursor-pointer"
                              onClick={() => setSelectedTask(child.id)}
                            >
                              {isMilestone(child) ? '📍' : '📋'} {child.nombre} ({child.avanceActual || 0}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center w-100 pe-4">
                      <div>
                        <small className="text-muted">ODS:</small>
                        <div className="fw-semibold">{Array.isArray(ordenesServicio) ? ordenesServicio.find(o => o.id === task.odsId)?.nombre || 'Sin ODS' : 'Sin ODS'}</div>
                      </div>
                      <div>
                        <small className="text-muted">Fecha de inicio:</small>
                        <div className="fw-semibold">{stringToDate(task.fechaInicio).toLocaleDateString('es-ES')}</div>
                      </div>
                      <div>
                        <small className="text-muted">Fecha de fin:</small>
                        <div className="fw-semibold">
                          {task.fechaFin ? 
                            stringToDate(task.fechaFin).toLocaleDateString('es-ES') : 
                            stringToDate(calcularFechaFin(task.fechaInicio, task.duracion)).toLocaleDateString('es-ES')
                          }
                        </div>
                      </div>
                      <div>
                        <small className="text-muted">Duración:</small>
                        <div className="fw-semibold">{task.duracion} día{task.duracion !== 1 ? 's' : ''}</div>
                      </div>
                                              <div>
                          <small className="text-muted">Taller:</small>
                          <div className="fw-semibold">{Array.isArray(talleres) ? talleres.find(t => t.id === task.tallerId)?.nombre || 'Sin taller' : 'Sin taller'}</div>
                        </div>
                      <div>
                        <small className="text-muted">Hito de Pago:</small>
                        <div className="fw-semibold">
                          {Array.isArray(hitosPago) ? 
                            (() => {
                              const hito = hitosPago.find(h => h.id === task.hitoPagoId);
                              return hito ? `${hito.numero} - ${hito.descripcion} (${hito.porcentaje}%)` : 'Sin hito de pago';
                            })() : 
                            'Sin hito de pago'
                          }
                        </div>
                      </div>
                      <div>
                        <small className="text-muted">Avance Actual:</small>
                        <div className="fw-semibold">{task.avanceActual || 0}%</div>
                      </div>
                      <div>
                        <small className="text-muted">Avance Real:</small>
                        <div className="fw-semibold">{task.avanceReal || 0}%</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Crear/Editar Tarea */}
      {(modalType === 'create' || modalType === 'edit') && (
        <ModalDialog
          title={modalType === 'create' ? "Agregar Tarea PDT" : "Editar Tarea PDT"}
          isFormValid={isFormValid}
          content={
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label required">Nombre de la Tarea</label>
                <input
                  type="text"
                  placeholder="Nombre de la tarea"
                  value={editedTarea.nombre}
                  onChange={(e) => setEditedTarea(prev => ({ ...prev, nombre: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label required">ODS</label>
                <select
                  value={editedTarea.odsId || ''}
                  onChange={(e) => setEditedTarea(prev => ({ ...prev, odsId: parseInt(e.target.value) }))}
                  className="form-select"
                  disabled={selectedODSId !== 0}
                  required
                >
                  {selectedODSId !== 0 ? (
                    <option value={selectedODSId}>
                      {Array.isArray(ordenesServicio) ? ordenesServicio.find(ods => ods.id === selectedODSId)?.nombre || 'Cargando...' : 'Cargando...'}
                    </option>
                  ) : (
                    <>
                      <option value="">Seleccione una ODS</option>
                      {Array.isArray(ordenesServicio) ? ordenesServicio.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((ods) => (
                        <option key={ods.id} value={ods.id}>
                          {ods.nombre}
                        </option>
                      )) : []}
                    </>
                  )}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Tarea Padre</label>
                <select
                  value={editedTarea.tareaPadreId || ''}
                  onChange={(e) => setEditedTarea(prev => ({ ...prev, tareaPadreId: e.target.value ? parseInt(e.target.value) : null }))}
                  className="form-select"
                >
                  <option value="">Sin tarea padre</option>
                  {Array.isArray(tareas) ? tareas.filter(t => t.id !== editedTarea.id && t.odsId === editedTarea.odsId).sort((a, b) => a.nombre.localeCompare(b.nombre)).map((tarea) => (
                    <option key={tarea.id} value={tarea.id}>
                      {tarea.nombre}
                    </option>
                  )) : []}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label required">Fecha de Inicio</label>
                <input
                  type="date"
                  value={editedTarea.fechaInicio ? editedTarea.fechaInicio.split('T')[0] : ''}
                  onChange={(e) => setEditedTarea(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label required">Duración (días)</label>
                <input
                  type="number"
                  value={editedTarea.duracion}
                  onChange={(e) => setEditedTarea(prev => ({ ...prev, duracion: parseInt(e.target.value) }))}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Fecha de Fin (Calculada)</label>
                <input
                  type="date"
                  value={editedTarea.fechaFin ? editedTarea.fechaFin.split('T')[0] : ''}
                  className="form-control"
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Taller</label>
                <select
                  value={editedTarea.tallerId || ''}
                  onChange={(e) => setEditedTarea(prev => ({ ...prev, tallerId: e.target.value ? parseInt(e.target.value) : null }))}
                  className='form-select'
                >
                  <option value="">Sin taller</option>
                  {Array.isArray(talleres) ? talleres.filter(t => t.odsId === editedTarea.odsId).sort((a, b) => a.nombre.localeCompare(b.nombre)).map((taller) => (
                    <option key={taller.id} value={taller.id}>
                      {taller.nombre}
                    </option>
                  )) : []}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Hito de Pago</label>
                <select
                  value={editedTarea.hitoPagoId || ''}
                  onChange={(e) => setEditedTarea(prev => ({ ...prev, hitoPagoId: e.target.value ? parseInt(e.target.value) : null }))}
                  className='form-select'
                >
                  <option value="">Sin hito de pago</option>
                  {Array.isArray(hitosPago) ? hitosPago.filter(h => h.odsId === editedTarea.odsId).sort((a, b) => a.numero.localeCompare(b.numero)).map((hito) => (
                    <option key={hito.id} value={hito.id}>
                      {hito.numero} - {hito.descripcion} ({hito.porcentaje}%)
                    </option>
                  )) : []}
                </select>
              </div>
              
              { modalType === 'edit' && (
                <div className="form-group">
                  <label className="form-label">Avance Actual (%)</label>
                  <input
                    type="range"
                    value={editedTarea.avanceActual ?? 0}
                    onChange={(e) => setEditedTarea(prev => ({ ...prev, avanceActual: parseInt(e.target.value) || 0 }))}
                    className="form-range"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <div className="mt-2 d-flex justify-content-between">
                    <span>{editedTarea.avanceActual ?? 0}%</span>
                  </div>
                </div>
              )}

              { modalType === 'edit' && (
                <div className="form-group">
                  <label className="form-label">Avance Real (%)</label>
                  <input
                    type="range"
                    value={editedTarea.avanceReal || 0}
                    onChange={(e) => setEditedTarea(prev => ({ ...prev, avanceReal: parseInt(e.target.value) || 0 }))}
                    className="form-range"
                    min="0"
                    max="100"
                    step="1"
                    />
                  <div className="mt-2 d-flex justify-content-between">
                    <span>{editedTarea.avanceReal ?? 0}%</span>
                  </div>
                </div>
              )}
            </div>
          }
          textBtn="Guardar"
          onConfirm={() => {
            if (modalType === 'create') {
              createTarea(editedTarea);
            } else {
              updateTarea(editedTarea);
            }
          }}
          closeModal={closeModal}
        />
      )}

      {/* Modal de Eliminar Tarea */}
      {modalType === 'delete' && (
        <ModalDialog
          title="Eliminar Tarea PDT"
          content={`¿Está seguro que desea eliminar la tarea "${Array.isArray(tareas) ? tareas.find(t => t.id === deleteTareaId)?.nombre : 'desconocida'}"? Esta acción eliminará también todas las sub-tareas asociadas.`}
          textBtn="Eliminar"
          confirmButtonClass="btn-danger"
          onConfirm={deleteTarea}
          closeModal={closeModal}
        />
      )}

      {/* Tooltip para fechas de tareas */}
      {tooltip.show && tooltip.task && (
        <div
          className="position-fixed bg-dark text-white px-3 py-2 rounded shadow-lg"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%)',
            zIndex: 1000,
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="d-flex flex-column gap-1">
            <div>
              <span className="text-success text-bold">Inicio:</span>{' '}
              <span className="fw-semibold">
                {stringToDate(tooltip.task.fechaInicio).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div>
              <span className="text-danger text-bold">Fin:</span>{' '}
              <span className="fw-semibold">
                {(() => {
                  const fechaFin = tooltip.task.fechaFin || calcularFechaFin(tooltip.task.fechaInicio, tooltip.task.duracion);
                  return stringToDate(fechaFin).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                })()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}