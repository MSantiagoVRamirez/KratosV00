import React, {useEffect, useRef} from 'react'
import ApexCharts, {ApexOptions} from 'apexcharts'
import {getCSSVariableValue} from '../../../_metronic/assets/ts/_utils'
import {useThemeMode} from '../../../_metronic/partials/layout/theme-mode/ThemeModeProvider'

interface AvancePDT {
  id: number;
  semana: string;
  avanceProgramado: number;
  avanceEjecutado: number;
  avanceProgramadoAcumulado?: number;
  avanceEjecutadoAcumulado?: number;
}

interface Props {
  avancesPDT: AvancePDT[]
}

export const SCurveChart: React.FC<Props> = ({ avancesPDT }) => {

  const series = [
    {
      name: 'Avance Programado Acumulado',
      data: avancesPDT.map(avance => avance.avanceProgramadoAcumulado)
    },
    {
      name: 'Avance Ejecutado Acumulado',
      data: avancesPDT.map(avance => avance.avanceEjecutadoAcumulado)
    }
  ]

  const chartRef = useRef<HTMLDivElement | null>(null)
  const {mode} = useThemeMode()
  const refreshMode = () => {
    if (!chartRef.current) {
      return
    }

    const chart = new ApexCharts(chartRef.current, getChartOptions(series, avancesPDT))
    if (chart) {
      chart.render()
    }

    return chart
  }

  useEffect(() => {
    const chart = refreshMode()

    return () => {
      if (chart) {
        chart.destroy()
      }
    }
  }, [chartRef, mode])

  return (
    <div className="card m-10">
      <div className='card-header'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>Curva S de Avance Físico</span>
          {/* <span className='text-muted fw-semibold fs-7'>More than 1000 new records</span> */}
        </h3>
      </div>
      <div className='card-body'>
        <div ref={chartRef} id='kt_charts_widget_3_chart' style={{height: '350px'}}></div>
      </div>
    </div>
  )
}

function getChartOptions(series: any, avancesPDT: AvancePDT[]): ApexOptions {
  const labelColor = getCSSVariableValue('--bs-gray-500')
  const borderColor = getCSSVariableValue('--bs-gray-200')
  const baseColor = getCSSVariableValue('--bs-info')
  const lightColor = getCSSVariableValue('--bs-info-light')
  const secondaryColor = getCSSVariableValue('--bs-success')
  const secondaryLightColor = getCSSVariableValue('--bs-success-light')

  return {
    series: series,
    chart: {
      fontFamily: 'inherit',
      type: 'area',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {},
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      labels: {
        colors: labelColor,
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: 'solid',
      opacity: 0.3,
      colors: [lightColor, secondaryLightColor],
    },
    stroke: {
      curve: 'smooth',
      show: true,
      width: 3,
      colors: [baseColor, secondaryColor],
    },
    xaxis: {
      categories: avancesPDT.map(avance => avance.semana),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
      crosshairs: {
        position: 'front',
        stroke: {
          color: baseColor,
          width: 1,
          dashArray: 3,
        },
      },
      tooltip: {
        enabled: true,
        formatter: undefined,
        offsetY: 0,
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: labelColor,
          fontSize: '12px',
        },
      },
    },
    states: {
      normal: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      hover: {
        filter: {
          type: 'none',
          value: 0,
        },
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'none',
          value: 0,
        },
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: function (val) {
          return val + '%'
        },
      },
    },
    colors: [lightColor, secondaryLightColor],
    grid: {
      borderColor: borderColor,
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    markers: {
      colors: [baseColor, secondaryColor],
      strokeColors: [baseColor, secondaryColor],
      strokeWidth: 3,
    },
  }
}
