import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [totalEarningsWeek, setTotalEarningsWeek] = useState(0);
  const [totalEarningsMonth, setTotalEarningsMonth] = useState(0);
  const [totalEarningsYear, setTotalEarningsYear] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [onTheWayOrders, setOnTheWayOrders] = useState(0);
  const [deliveredOrders, setDeliveredOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [earningsChartData, setEarningsChartData] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    const { data: orders, error } = await supabase.from('orders').select('*');

    if (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
      return;
    }

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    let weekEarnings = 0;
    let monthEarnings = 0;
    let yearEarnings = 0;
    let pending = 0;
    let onTheWay = 0;
    let delivered = 0;
    const dailyEarnings = {};

    orders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const orderTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      if (orderDate >= oneWeekAgo) {
        weekEarnings += orderTotal;
      }
      if (orderDate >= oneMonthAgo) {
        monthEarnings += orderTotal;
      }
      if (orderDate >= oneYearAgo) {
        yearEarnings += orderTotal;
      }

      // Aggregate daily earnings for chart
      const dateKey = orderDate.toISOString().split('T')[0];
      dailyEarnings[dateKey] = (dailyEarnings[dateKey] || 0) + orderTotal;

      switch (order.status.toLowerCase()) {
        case 'pending':
          pending++;
          break;
        case 'on the way':
          onTheWay++;
          break;
        case 'delivered':
          delivered++;
          break;
        default:
          break;
      }
    });

    setTotalEarningsWeek(weekEarnings);
    setTotalEarningsMonth(monthEarnings);
    setTotalEarningsYear(yearEarnings);
    setPendingOrders(pending);
    setOnTheWayOrders(onTheWay);
    setDeliveredOrders(delivered);

    // Prepare chart data (last 7 days for simplicity)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      chartData.push({ date: dateKey, earnings: dailyEarnings[dateKey] || 0 });
    }
    setEarningsChartData(chartData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid transparent',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '32px' }}>Analytics Dashboard</h1>

      {/* Earnings Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Total Earnings (Week)</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${totalEarningsWeek.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Total Earnings (Month)</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${totalEarningsMonth.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Total Earnings (Year)</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>${totalEarningsYear.toFixed(2)}</p>
        </div>
      </div>

      {/* Order Status Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Pending Orders</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{pendingOrders}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Orders On The Way</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{onTheWayOrders}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Delivered Orders</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{deliveredOrders}</p>
        </div>
      </div>

      {/* Earnings Chart Placeholder */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Earnings Chart</h2>
        <div style={{ height: '300px' }}>
          <Line
            data={{
              labels: earningsChartData.map(data => data.date),
              datasets: [
                {
                  label: 'Earnings',
                  data: earningsChartData.map(data => data.earnings),
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Daily Earnings Over Last 7 Days',
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Date',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Earnings ($)',
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Analytics;