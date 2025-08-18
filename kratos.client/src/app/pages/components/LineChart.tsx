import {useEffect, useRef, FC} from 'react'
import ApexCharts, {ApexOptions} from 'apexcharts'
import {getCSSVariableValue} from '../../../_metronic/assets/ts/_utils'
import {useThemeMode} from '../../../_metronic/partials/layout/theme-mode/ThemeModeProvider'

type Props = {
  title?: string
  data: number[]
  categories: string[]
  seriesName?: string
  height?: number
  color?: string
  className?: string
}

const LineChart: FC<Props> = ({
  title = 'Line Chart',
  data,
  categories,
  seriesName = 'Series 1',
  height = 350,
  color,
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
  }, [chartRef, mode, data, categories])

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
    const baseColor = color || getCSSVariableValue('--bs-primary')

    return {
      series: [
        {
          name: seriesName,
          data: data,
        },
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'line',
        height: height,
        toolbar: {
          show: false,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 3,
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
      colors: [baseColor],
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
        size: 4,
        colors: [baseColor],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 6,
        },
      },
      tooltip: {
        style: {
          fontSize: '12px',
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

export default LineChart