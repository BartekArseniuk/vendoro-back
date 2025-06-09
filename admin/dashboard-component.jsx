import { useEffect, useState } from 'react'
import { ApiClient } from 'adminjs'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Title, Filler, Legend } from 'chart.js'

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Title, Filler, Legend )

const styles = {
    container: { padding: '30px' },
    title: { fontSize: '24px', marginBottom: '20px' },
    cardsWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '40px',
    },
    card: {
        background: '#FE8D1C',
        color: 'white',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flex: '1',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    cardTitle: { margin: 0 },
    cardNumber: { fontSize: '32px', fontWeight: 'bold', margin: 0 },
    chartWrapper: {
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    chartHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    chartTitle: {
        fontWeight: 'bold',
        fontSize: '18px',
        color: '#242424',
    },
    select: {
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '14px',
    },
    twoColumns: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '40px',
    },
    cardTable: {
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    cardTableHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    cardTableTitle: {
        fontWeight: 'bold',
        fontSize: '18px',
        color: '#242424',
        margin: 0,
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableRow: {
        borderBottom: '1px solid #f2f2f2',
        '&:last-child': {
            borderBottom: 'none',
        }
    },
    tableCell: {
        padding: '12px 0',
        textAlign: 'left',
        '&:first-child': {
            paddingLeft: '0',
        },
        '&:last-child': {
            paddingRight: '0',
        }
    },
    productLink: {
        color: '#FE8D1C',
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'underline',
        }
    },
}

const dateRanges = {
    '7d': { label: 'Last 7 days', days: 7 },
    '1m': { label: 'Last 30 days', days: 30 },
    '3m': { label: 'Last 3 months', days: 90 },
    '1y': { label: 'Last year', days: 365 },
}

const Dashboard = () => {
    const [data, setData] = useState({
        usersCount: 0,
        productsCount: 0,
        ordersCount: 0,
        salesChartData: [],
        lastSoldProducts: [],
        salesByCategory: []
    })
    const [range, setRange] = useState('7d')
    const [loading, setLoading] = useState(false)

    const fetchData = async (days) => {
        setLoading(true)
        const api = new ApiClient()
        const res = await api.getDashboard({ params: { days } })
        setData(res.data)
        setLoading(false)
    }

    useEffect(() => {
        fetchData(dateRanges[range].days)
    }, [range])

    const chartData = {
        labels: data.salesChartData.map((item) => item.date),
        datasets: [
            {
                label: 'Sprzedaż',
                data: data.salesChartData.map((item) => item.count),
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
                    gradient.addColorStop(0, 'rgba(254, 141, 28, 0.3)')
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
                    return gradient
                },
                borderColor: '#FE8D1C',
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                displayColors: false,
                callbacks: {
                    label: (context) => `${context.parsed.y} orders`
                }
            },
            title: {
                color: '#242424',
                font: { size: 18, weight: 'bold' },
                padding: { bottom: 20 },
                align: 'start',
            },
        },
        scales: {
            x: {
                ticks: { color: '#242424', font: { size: 12 } },
                grid: {
                    color: '#f2f2f2',
                    drawBorder: false
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    color: '#242424',
                    font: { size: 12 },
                    callback: (value) => value % 1 === 0 ? value : null
                },
                grid: {
                    color: '#f2f2f2',
                    drawBorder: false
                },
            },
        },
        elements: {
            line: {
                borderWidth: 2
            }
        }
    }

    const categoryChartData = {
        labels: data.salesByCategory.map(item => item.name),
        datasets: [{
            label: 'Sales',
            data: data.salesByCategory.map(item => item.count),
            backgroundColor: '#FE8D1C',
            borderRadius: 4,
        }]
    }

    const categoryChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y} sales`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                },
                grid: {
                    color: '#f2f2f2',
                    drawBorder: false
                }
            }
        }
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Vendoro – Dashboard</h1>

            <div style={styles.cardsWrapper}>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Users</h2>
                    <p style={styles.cardNumber}>{data.usersCount}</p>
                </div>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Products</h2>
                    <p style={styles.cardNumber}>{data.productsCount}</p>
                </div>
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Orders</h2>
                    <p style={styles.cardNumber}>{data.ordersCount}</p>
                </div>
            </div>

            <div style={styles.twoColumns}>
                <div style={styles.cardTable}>
                    <div style={styles.cardTableHeader}>
                        <h2 style={styles.cardTableTitle}>Last Sold Products</h2>
                    </div>
                    <table style={styles.table}>
                        <tbody>
                            {data.lastSoldProducts.map((product) => (
                                <tr key={product.id} style={styles.tableRow}>
                                    <td style={styles.tableCell}>
                                        <a
                                            href={`/admin/resources/Product/records/${product.productId}/show`}
                                            style={styles.productLink}
                                        >
                                            {product.productName}
                                        </a>
                                    </td>
                                    <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                                        {product.price} PLN
                                    </td>
                                    <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                                        {product.date}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={styles.cardTable}>
                    <div style={styles.cardTableHeader}>
                        <h2 style={styles.cardTableTitle}>Sales By Category</h2>
                    </div>
                    <div style={{ height: '300px', position: 'relative' }}>
                        <Bar
                            data={categoryChartData}
                            options={categoryChartOptions}
                        />
                    </div>
                </div>
            </div>

            <div style={styles.chartWrapper}>
                <div style={styles.chartHeader}>
                    <div style={styles.chartTitle}>Sales Overview ({dateRanges[range].label})</div>
                    <select
                        style={styles.select}
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        disabled={loading}
                    >
                        {Object.entries(dateRanges).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>

                <div style={{ height: '300px', position: 'relative' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard