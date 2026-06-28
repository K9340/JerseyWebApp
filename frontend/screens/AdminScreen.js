import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { orderService } from '../services/api';

export default function AdminScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders from Node backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.list();
      setOrders(data);
    } catch (e) {
      console.error(e);
      // Mock list if network offline
      setOrders([
        { id: 'FUTURA-ORD-77402', totalPrice: 1497, discountTier: 'Club Discount', status: 'Order Logged', shippingCity: 'New Delhi', createdAt: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, nextStatus) => {
    try {
      await orderService.updateStatus(id, nextStatus);
      Alert.alert("Success", `Updated order ${id} status to: ${nextStatus}`);
      fetchOrders();
    } catch (e) {
      console.error(e);
      // Local updates mock fallback
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
    }
  };

  // Math metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const itemsCount = orders.length * 5; // mock multiplier

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TOTAL REVENUE</Text>
          <Text style={styles.kpiValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ITEMS PRODUCED</Text>
          <Text style={styles.kpiValue}>{itemsCount}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ACTIVE ORDERS</Text>
          <Text style={styles.kpiValue}>{orders.length}</Text>
        </View>
      </View>

      {/* Orders List Queue */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeading}>Logistics Fulfillment Queue</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchOrders}>
            <Text style={styles.refreshText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#34d399" style={styles.loader} />
        ) : (
          <View style={styles.listContainer}>
            {orders.map(order => (
              <View key={order.id} style={styles.orderItem}>
                <View style={styles.orderMain}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderMeta}>
                    {order.shippingCity} | {order.discountTier} | ₹{order.totalPrice}
                  </Text>
                  <Text style={styles.statusBadge}>Status: <Text style={styles.statusText}>{order.status}</Text></Text>
                </View>
                
                {/* Actions to shift status */}
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => updateStatus(order.id, 'Printing Phase')}
                  >
                    <Text style={styles.actionBtnText}>Print</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => updateStatus(order.id, 'Dispatched')}
                  >
                    <Text style={styles.actionBtnText}>Ship</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => updateStatus(order.id, 'Delivered')}
                  >
                    <Text style={styles.actionBtnText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#34d399',
    marginTop: 6,
  },
  tableCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 12,
    marginBottom: 16,
  },
  tableHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  refreshBtn: {
    padding: 4,
  },
  refreshText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 20,
  },
  listContainer: {
    flexDirection: 'column',
  },
  orderItem: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orderMain: {
    marginBottom: 12,
  },
  orderId: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  orderMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  statusBadge: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 8,
  },
  statusText: {
    color: '#34d399',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
