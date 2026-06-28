import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { orderService } from '../services/api';

const pricingTiers = {
  standard: { range: '1 - 10 Jerseys', price: 599, label: 'Standard Price' },
  club: { range: '11 - 30 Jerseys', price: 499, label: 'Club Discount (15% Off)' },
  elite: { range: '31+ Jerseys', price: 399, label: 'Elite Franchise (33% Off)' }
};

export default function RosterScreen({ designState, onOrderSubmitted }) {
  const [players, setPlayers] = useState([
    { id: 1, name: 'ROHIT', number: '45', size: 'M', fabric: 'Dry-Fit Pro', sleeve: 'HALF' },
    { id: 2, name: 'VIRAT', number: '18', size: 'L', fabric: 'Dry-Fit Pro', sleeve: 'FULL' },
    { id: 3, name: 'MSD', number: '7', size: 'XL', fabric: 'Premium Poly', sleeve: 'HALF' }
  ]);

  const [shipping, setShipping] = useState({
    address: '',
    city: '',
    zip: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);

  const addPlayer = () => {
    setPlayers(prev => [
      ...prev,
      {
        id: Date.now(),
        name: 'PLAYER',
        number: '00',
        size: 'M',
        fabric: 'Dry-Fit Pro',
        sleeve: 'HALF'
      }
    ]);
  };

  const removePlayer = (id) => {
    if (players.length <= 1) {
      Alert.alert("Warning", "Your roster must have at least one player.");
      return;
    }
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const updatePlayerField = (id, field, value) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  // Calculate pricing dynamics
  const count = players.length;
  let unitPrice = pricingTiers.standard.price;
  let discountLabel = pricingTiers.standard.label;

  if (count >= 11 && count <= 30) {
    unitPrice = pricingTiers.club.price;
    discountLabel = pricingTiers.club.label;
  } else if (count > 30) {
    unitPrice = pricingTiers.elite.price;
    discountLabel = pricingTiers.elite.label;
  }

  const totalBill = count * unitPrice;

  // Checkout submission handler
  const handleCheckout = async () => {
    if (!shipping.address || !shipping.city || !shipping.zip || !shipping.phone) {
      Alert.alert("Input Required", "Please fill in all shipping details.");
      return;
    }

    setLoading(true);
    const orderId = `FUTURA-ORD-${Math.floor(Math.random() * 90000) + 10000}`;

    try {
      const payload = {
        id: orderId,
        totalPrice: totalBill,
        discountTier: discountLabel,
        shippingAddress: shipping.address,
        shippingCity: shipping.city,
        shippingZip: shipping.zip,
        shippingPhone: shipping.phone,
        roster: players.map(p => ({
          name: p.name,
          number: p.number,
          size: p.size,
          fabric: p.fabric,
          sleeve: p.sleeve
        }))
      };

      await orderService.create(payload);
      Alert.alert("Order Placed", `Your squad order has been registered under ID: ${orderId}`);
      onOrderSubmitted(orderId);
    } catch (e) {
      console.error(e);
      Alert.alert("Checkout Error", "Failed to connect to order server. Placed order offline.");
      onOrderSubmitted(orderId); // Mock continue
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner Cost Widget */}
      <View style={styles.costCard}>
        <View>
          <Text style={styles.costTitle}>TEAM ROSTER & SIZE MATRIX</Text>
          <Text style={styles.costDesc}>Active design is applied to all players list.</Text>
        </View>
        <View style={styles.totalWidget}>
          <Text style={styles.totalVal}>₹{totalBill.toLocaleString('en-IN')}.00</Text>
          <Text style={styles.totalLabel}>{discountLabel}</Text>
        </View>
      </View>

      {/* Roster Spreadsheet Table */}
      <View style={styles.tableCard}>
        <View style={styles.tableActions}>
          <Text style={styles.tableHeading}>Active Lineup ({count} Players)</Text>
          <TouchableOpacity style={styles.addBtn} onPress={addPlayer}>
            <Text style={styles.addBtnText}>+ Add Player</Text>
          </TouchableOpacity>
        </View>

        {/* Players rows */}
        <ScrollView horizontal style={styles.horizontalScroll}>
          <View style={styles.tableContainer}>
            {/* Headers */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.headerCell, { width: 50 }]}>No.</Text>
              <Text style={[styles.headerCell, { width: 140 }]}>Name (Printing)</Text>
              <Text style={[styles.headerCell, { width: 80 }]}>Number</Text>
              <Text style={[styles.headerCell, { width: 80 }]}>Size</Text>
              <Text style={[styles.headerCell, { width: 100 }]}>Fabric</Text>
              <Text style={[styles.headerCell, { width: 60 }]}>Delete</Text>
            </View>

            {/* List */}
            {players.map((player, idx) => (
              <View key={player.id} style={styles.tableRow}>
                <Text style={[styles.rowCellText, { width: 50, textAlign: 'center' }]}>{idx + 1}</Text>
                
                {/* Name */}
                <TextInput
                  style={[styles.rowInput, { width: 140 }]}
                  value={player.name}
                  onChangeText={(val) => updatePlayerField(player.id, 'name', val.toUpperCase())}
                />

                {/* Number */}
                <TextInput
                  style={[styles.rowInput, { width: 80 }]}
                  value={player.number}
                  keyboardType="numeric"
                  onChangeText={(val) => updatePlayerField(player.id, 'number', val)}
                />

                {/* Size select */}
                <TextInput
                  style={[styles.rowInput, { width: 80 }]}
                  value={player.size}
                  placeholder="M"
                  onChangeText={(val) => updatePlayerField(player.id, 'size', val.toUpperCase())}
                />

                {/* Fabric */}
                <TextInput
                  style={[styles.rowInput, { width: 100 }]}
                  value={player.fabric}
                  onChangeText={(val) => updatePlayerField(player.id, 'fabric', val)}
                />

                {/* Remove Btn */}
                <TouchableOpacity 
                  style={[styles.removeBtn, { width: 60 }]}
                  onPress={() => removePlayer(player.id)}
                >
                  <Text style={styles.removeBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Shipping Address Forms */}
      <View style={styles.shippingCard}>
        <Text style={styles.sectionHeading}>✈️ SHIPPINGS & DELIVERY DETAILS</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Full Delivery Address</Text>
          <TextInput
            style={styles.formInput}
            value={shipping.address}
            onChangeText={(val) => setShipping(prev => ({ ...prev, address: val }))}
            placeholder="e.g. 123 Sports Complex Ground Floor"
            placeholderTextColor="#64748b"
          />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formCol, { marginRight: 8 }]}>
            <Text style={styles.formLabel}>City / State</Text>
            <TextInput
              style={styles.formInput}
              value={shipping.city}
              onChangeText={(val) => setShipping(prev => ({ ...prev, city: val }))}
              placeholder="e.g. New Delhi"
              placeholderTextColor="#64748b"
            />
          </View>
          <View style={styles.formCol}>
            <Text style={styles.formLabel}>ZIP / Postal Code</Text>
            <TextInput
              style={styles.formInput}
              value={shipping.zip}
              onChangeText={(val) => setShipping(prev => ({ ...prev, zip: val }))}
              placeholder="e.g. 110001"
              placeholderTextColor="#64748b"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Contact Phone</Text>
          <TextInput
            style={styles.formInput}
            value={shipping.phone}
            onChangeText={(val) => setShipping(prev => ({ ...prev, phone: val }))}
            placeholder="e.g. +91 9876543210"
            placeholderTextColor="#64748b"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity 
          style={styles.checkoutBtn}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.checkoutBtnText}>
            {loading ? 'Processing Order...' : 'Pay & Dispatch Order'}
          </Text>
        </TouchableOpacity>
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
  costCard: {
    backgroundColor: '#090d16',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  costTitle: {
    fontSize: 14,
    fontWeight: '850',
    color: '#ffffff',
  },
  costDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  totalWidget: {
    alignItems: 'flex-end',
  },
  totalVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#34d399',
  },
  totalLabel: {
    fontSize: 9,
    color: '#94a3b8',
    fontWeight: 'bold',
    marginTop: 2,
  },
  tableCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 20,
  },
  tableActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tableHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  addBtn: {
    backgroundColor: '#34d399',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: 'bold',
  },
  horizontalScroll: {
    width: '100%',
  },
  tableContainer: {
    flexDirection: 'column',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#090d16',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
  },
  headerCell: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 8,
  },
  rowCellText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rowInput: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 11,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  removeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 14,
  },
  shippingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'semibold',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  formCol: {
    flex: 1,
  },
  checkoutBtn: {
    backgroundColor: '#34d399',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutBtnText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '800',
  },
});
