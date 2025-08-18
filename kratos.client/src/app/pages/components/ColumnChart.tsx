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
  categories: string[]
  height?: number
  colors?: string[]
  className?: string
  horizontal?: boolean
}

const ColumnChart: FC<Props> = ({
  title = 'Column Chart',
  series,
  categories,
  height = 350,
  colors,
  className = '',
  horizontal = false
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
  }, [chartRef, mode, series, categories])

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
      getCSSVariableValue('--bs-warning'),
      getCSSVariableValue('--bs-info'),
      getCSSVariableValue('--bs-success'),
      getCSSVariableValue('--bs-danger'),
    ]

    return {
      series: series,
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: height,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: horizontal,
          columnWidth: '50%',
          borderRadius: 5,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: categories,
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
      fill: {
        opacity: 1,
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
        y: {
          formatter: function (val) {
            return val.toString()
          },
        },
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

export default ColumnChart