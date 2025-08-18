import {useEffect, useRef, FC} from 'react'
import ApexCharts, {ApexOptions} from 'apexcharts'
import {getCSSVariableValue} from '../../../_metronic/assets/ts/_utils'
import {useThemeMode} from '../../../_metronic/partials/layout/theme-mode/ThemeModeProvider'

type Props = {
  title?: string
  series: {
    name: string
    data: number[]
  }[]
  timeCategories: string[] // Ej: ['00:00', '01:00', '02:00', etc.]
  height?: number
  colors?: string[]
  className?: string
}

const AreaChartHorizontal: FC<Props> = ({
  title = 'Area Chart',
  series,
  timeCategories,
  height = 350,
  colors,
  className = ''
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const {mode} = useThemeMode()

  useEffect(() => {
    const chart = refreshChart()

    return () => {
      if (chart) {
        chart.destroy()
      }
    }
  }, [chartRef, mode, series, timeCategories])

  const refreshChart = () => {
    if (!chartRef.current) {
      return
    }

    const chart = new ApexCharts(chartRef.current, getChartOptions())
    if (chart) {
      chart.render()
    }

    return chart
  }

  const getChartOptions = (): ApexOptions => {
    const labelColor = getCSSVariableValue('--bs-gray-500')
    const borderColor = getCSSVariableValue('--bs-gray-200')
    const defaultColors = [
      getCSSVariableValue('--bs-primary'),
      getCSSVariableValue('--bs-info'),
      getCSSVariableValue('--bs-success'),
    ]

    return {
      series: series,
      chart: {
        fontFamily: 'inherit',
        type: 'area',
        height: height,
        stacked: false,
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.6,
          opacityTo: 0.1,
        },
      },
      xaxis: {
        categories: timeCategories,
        type: 'category',
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
      },
      yaxis: {
        labels: {
          style: {
            colors: labelColor,
            fontSize: '12px',
          },
        },
      },
      colors: colors || defaultColors,
      grid: {
        borderColor: borderColor,
        strokeDashArray: 4,
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        labels: {
          colors: labelColor,
        },
      },
      tooltip: {
        style: {
          fontSize: '12px',
        },
        x: {
          format: 'HH:mm',
        },
      },
      dataLabels: {
        enabled: false,
      },
    }
  }

  return (
    <div className={`card ${className}`}>
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bold fs-3 mb-1'>{title}</span>
        </h3>
      </div>
      <div className='card-body'>
        <div ref={chartRef} style={{height: `${height}px`}} />
      </div>
    </div>
  )
}

export default AreaChartHorizontal