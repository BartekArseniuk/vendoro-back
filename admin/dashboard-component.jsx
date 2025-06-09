import { useEffect, useState } from 'react'
import { ApiClient } from 'adminjs'

const styles = {
    container: {
        padding: '30px',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
    },
    cardsWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
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
        cursor: 'default',
    },
    cardHeader: {
        margin: 0,
    },
    cardNumber: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: 0,
    },
}

const Dashboard = () => {
    const [data, setData] = useState({
        usersCount: 0,
        productsCount: 0,
        ordersCount: 0,
    })

    useEffect(() => {
        const fetch = async () => {
            const api = new ApiClient()
            const res = await api.getDashboard()
            setData(res.data)
        }
        fetch()
    }, [])

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Vendoro – Dashboard</h1>
            <div style={styles.cardsWrapper}>
                <div style={styles.card}>
                    <h2 style={styles.cardHeader}>Users</h2>
                    <p style={styles.cardNumber}>{data.usersCount}</p>
                </div>
                <div style={styles.card}>
                    <h2 style={styles.cardHeader}>Products</h2>
                    <p style={styles.cardNumber}>{data.productsCount}</p>
                </div>
                <div style={styles.card}>
                    <h2 style={styles.cardHeader}>Orders</h2>
                    <p style={styles.cardNumber}>{data.ordersCount}</p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard