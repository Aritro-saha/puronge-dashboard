import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Analytics from './Analytics';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStatus, setEditingStatus] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchOrders = async () => {
    setLoading(true);
    console.log('Attempting to fetch orders...');
    const { data, error } = await supabase.from('orders').select('*');
    if (error) {
      console.error('Error fetching orders:', error);
      console.log('Supabase fetch error details:', error.message);
      console.log('Supabase fetch error code:', error.code);
      console.log('Supabase fetch error hint:', error.hint);
      console.log('Supabase fetch error details:', error.details);
    } else {
      setOrders(data);
      console.log('Orders fetched successfully:', data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Authentication status: TRUE. Attempting to fetch orders...');
      fetchOrders();
    } else {
      console.log('Authentication status: FALSE. Not fetching orders. Displaying PIN screen.');
      setLoading(false); // If not authenticated, stop loading and show PIN screen
    }
  }, [isAuthenticated]);

  const handlePinLogin = (e) => {
    e.preventDefault();
    if (pin === '1991') {
      setIsAuthenticated(true);
      setPinError('');
      console.log('Authentication successful!');
    } else {
      setPinError('Invalid PIN. Please try again.');
      console.log('Authentication failed: Invalid PIN');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin('');
    setPinError('');
    setOrders([]);
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleSaveStatus = async (orderId) => {
    const orderToUpdate = orders.find(order => order.id === orderId);
    if (orderToUpdate) {
      const { error } = await supabase
        .from('orders')
        .update({ status: orderToUpdate.status })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        // Optionally, revert the local state if the update fails
        // setOrders(prevOrders => prevOrders.map(order =>
        //   order.id === orderId ? { ...order, status: originalStatus } : order
        // ));
      }
    }
    setEditingStatus(null);
  };

  const filteredOrders = orders.filter(order => 
    Object.values(order).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'status') {
      const statusOrder = { 'pending': 0, 'on the way': 1, 'delivered': 2 };
      const statusA = statusOrder[a.status.toLowerCase()];
      const statusB = statusOrder[b.status.toLowerCase()];
      return sortOrder === 'asc' ? statusA - statusB : statusB - statusA;
    }
    return 0;
  });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return (
        <span style={{ fontSize: '12px', marginLeft: '4px' }}>↕</span>
      );
    }
    return sortOrder === 'asc' ? (
      <span style={{ fontSize: '12px', marginLeft: '4px' }}>↑</span>
    ) : (
      <span style={{ fontSize: '12px', marginLeft: '4px' }}>↓</span>
    );
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
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)'
      }}>
        <div style={{
          maxWidth: '400px',
          width: '100%',
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#2563eb',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg style={{ width: '32px', height: '32px', fill: 'white' }} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Secure Order Dashboard</h2>
            <p style={{ color: '#6b7280' }}>Enter PIN to access dashboard</p>
          </div>
          <form onSubmit={handlePinLogin} style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>PIN</label>
              <input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  ':focus': { borderColor: '#2563eb' }
                }}
              />
              {pinError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>{pinError}</p>}
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                ':hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Access Dashboard
            </button>
          </form>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              <svg style={{ width: '16px', height: '16px', fill: '#10b981', marginRight: '4px' }} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Your data is protected with enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: 'Roboto, sans-serif'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            minHeight: '64px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#2563eb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '20px', height: '20px', fill: 'white' }} viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>Secure Order Dashboard</h1>
              </div>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to="/" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '500', ':hover': { color: '#1d4ed8' } }}>Dashboard</Link>
              <Link to="/analytics" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '500', ':hover': { color: '#1d4ed8' } }}>Analytics</Link>
            </nav>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={handleRefresh}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  ':hover': { backgroundColor: '#1d4ed8' }
                }}
              >
                Refresh
              </button>
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  ':hover': { backgroundColor: '#b91c1c' }
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={
            <main style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '32px 24px'
            }}>
              {/* Search Bar */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      ':focus': { borderColor: '#2563eb' }
                    }}
                  />
                  <svg
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '12px',
                      width: '20px',
                      height: '20px',
                      fill: '#9ca3af'
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Orders Table */}
              <div style={{
                backgroundColor: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                      <tr>
                        <th
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            color: '#374151',
                            cursor: 'pointer',
                            backgroundColor: sortBy === 'customer' ? '#f3f4f6' : '#f9fafb',
                            transition: 'background-color 0.2s',
                            width: '20%'
                          }}
                          onClick={() => toggleSort('customer')}
                        >
                          Customer
                        </th>
                        <th style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          color: '#374151',
                          backgroundColor: '#f9fafb',
                          width: '25%'
                        }}>
                          Contact & Address
                        </th>
                        <th style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          color: '#374151',
                          backgroundColor: '#f9fafb',
                          width: '15%'
                        }}>
                          Product
                        </th>
                        <th style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          color: '#374151',
                          backgroundColor: '#f9fafb',
                          width: '15%'
                        }}>
                          Transaction
                        </th>
                        <th
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            color: '#374151',
                            cursor: 'pointer',
                            backgroundColor: sortBy === 'date' ? '#f3f4f6' : '#f9fafb',
                            transition: 'background-color 0.2s',
                            width: '10%'
                          }}
                          onClick={() => toggleSort('date')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Date</span>
                            {getSortIcon('date')}
                          </div>
                        </th>
                        <th
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            color: '#374151',
                            cursor: 'pointer',
                            backgroundColor: sortBy === 'status' ? '#f3f4f6' : '#f9fafb',
                            transition: 'background-color 0.2s',
                            width: '10%'
                          }}
                          onClick={() => toggleSort('status')}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Status</span>
                            {getSortIcon('status')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedOrders.map((order) => (
                        <tr key={order.id} style={{
                          ':hover': { backgroundColor: '#f9fafb' },
                          transition: 'background-color 0.2s'
                        }}>
                          <td style={{
                            padding: '16px',
                            verticalAlign: 'middle',
                            fontSize: '14px',
                            color: '#1f2937'
                          }}>
                            <div>
                              <div style={{ fontWeight: '500' }}>{order.customer_name}</div>
                              <div style={{ fontSize: '14px', color: '#6b7280' }}>{order.customer_phone}</div>
                            </div>
                          </td>
                          <td style={{
                            padding: '16px',
                            verticalAlign: 'middle',
                            fontSize: '14px',
                            color: '#1f2937'
                          }}>
                            <div>{order.customer_address}</div>
                          </td>
                          <td style={{
                            padding: '16px',
                            verticalAlign: 'middle',
                            fontSize: '14px',
                            color: '#1f2937'
                          }}>
                            <div style={{ fontWeight: '500' }}>{order.items[0]?.name}</div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              ${order.items[0]?.price} × {order.items[0]?.quantity}
                            </div>
                          </td>
                          <td style={{
                            padding: '16px',
                            verticalAlign: 'middle',
                            fontSize: '14px',
                            color: '#1f2937'
                          }}>
                            <div>{order.customer_upi_id}</div>
                          </td>
                          <td style={{
                            padding: '16px',
                            verticalAlign: 'middle',
                            fontSize: '14px',
                            color: '#1f2937',
                            whiteSpace: 'nowrap'
                          }}>
                            <div>{new Date(order.created_at).toLocaleDateString()}</div>
                          </td>
                          <td style={{
                            padding: '16px',
                            verticalAlign: 'middle',
                            fontSize: '14px',
                            color: '#1f2937',
                            whiteSpace: 'nowrap'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {editingStatus === order.id ? (
                                <select
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  style={{
                                    padding: '4px 8px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    ':focus': { borderColor: '#2563eb' }
                                  }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="On the way">On the way</option>
                                  <option value="Delivered">Delivered</option>
                                </select>
                              ) : (
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '16px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  backgroundColor:
                                    order.status.toLowerCase() === 'delivered' ? '#ecfdf5' :
                                    order.status.toLowerCase() === 'on the way' ? '#dbeafe' : '#fef3c7',
                                  color:
                                    order.status.toLowerCase() === 'delivered' ? '#059669' :
                                    order.status.toLowerCase() === 'on the way' ? '#2563eb' : '#f59e0b',
                                  border:
                                    order.status.toLowerCase() === 'delivered' ? '1px solid #10b981' :
                                    order.status.toLowerCase() === 'on the way' ? '1px solid #3b82f6' : '1px solid #f59e0b',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              )}
                              <button
                                onClick={() =>
                                  editingStatus === order.id
                                    ? handleSaveStatus(order.id)
                                    : setEditingStatus(order.id)
                                }
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: 'transparent',
                                  color: '#2563eb',
                                  border: 'none',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'color 0.2s',
                                  ':hover': { color: '#1d4ed8' }
                                }}
                              >
                                {editingStatus === order.id ? 'Save' : 'Edit'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {sortedOrders.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 24px',
                  marginTop: '24px'
                }}>
                  <svg
                    style={{
                      width: '48px',
                      height: '48px',
                      fill: 'none',
                      stroke: '#9ca3af',
                      margin: '0 auto 16px'
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>No orders found</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Try adjusting your search terms.</p>
                </div>
              )}

              {/* Security Notice */}
              <div style={{
                marginTop: '24px',
                backgroundColor: '#dbeafe',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <svg
                    style={{
                      width: '20px',
                      height: '20px',
                      fill: '#2563eb',
                      marginTop: '4px'
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#1d4ed8', marginBottom: '4px' }}>Secure Connection</h4>
                    <p style={{ fontSize: '14px', color: '#2563eb' }}>
                      Your data is protected with end-to-end encryption and secure authentication.
                      Only you can access your order information.
                    </p>
                  </div>
                </div>
              </div>
            </main>
          } />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>

  );
};
export default App;