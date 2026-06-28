import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

const trackingStages = [
  { id: '1', label: 'Order Logged', desc: 'Order details processed', icon: '📝' },
  { id: '2', label: 'Printing Phase', desc: 'Sublimation grading layout active', icon: '🖨️' },
  { id: '3', label: 'Dispatched', desc: 'Courier logistics partner picked up', icon: '🚚' },
  { id: '4', label: 'Delivered', desc: 'Successfully dropped off', icon: '🏠' }
];

export default function TrackingScreen({ activeOrderId }) {
  // Mock tracking details
  const orderId = activeOrderId || '#FUTURA-MOCK-PENDING';
  const currentStep = activeOrderId ? 2 : 1; // Logged or Printing

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.title}>GLOBAL LOGISTICS TRACKING</Text>
            <Text style={styles.orderIdLabel}>Order Ref: <Text style={styles.orderIdVal}>{orderId}</Text></Text>
          </View>
          <View style={styles.etaWidget}>
            <Text style={styles.etaLabel}>ESTIMATED DELIVERY</Text>
            <Text style={styles.etaVal}>{activeOrderId ? 'In 5-7 Days' : 'Pending Checkout'}</Text>
          </View>
        </View>

        {/* Milestone Steps */}
        <View style={styles.stepsContainer}>
          {trackingStages.map((stage, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            
            return (
              <View key={stage.id} style={styles.stepRow}>
                {/* Visual Line connector */}
                {idx !== 0 && (
                  <View style={[styles.connectorLine, isCompleted && styles.connectorLineCompleted]} />
                )}

                {/* Step Circle Icon */}
                <View style={[
                  styles.circleIcon, 
                  isCompleted && styles.circleIconCompleted,
                  isActive && styles.circleIconActive
                ]}>
                  <Text style={styles.stageIconText}>{stage.icon}</Text>
                </View>

                {/* Step Info */}
                <View style={styles.stepInfo}>
                  <Text style={[
                    styles.stageTitle,
                    (isCompleted || isActive) && styles.stageTitleHighlighted
                  ]}>
                    {stage.label}
                  </Text>
                  <Text style={styles.stageDesc}>{stage.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>
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
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  orderIdLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  orderIdVal: {
    color: '#34d399',
    fontWeight: 'bold',
  },
  etaWidget: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: '800',
  },
  etaVal: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  stepsContainer: {
    flexDirection: 'column',
    paddingLeft: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    left: 17,
    top: -30,
    width: 2,
    height: 30,
    backgroundColor: '#334155',
    zIndex: -1,
  },
  connectorLineCompleted: {
    backgroundColor: '#34d399',
  },
  circleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#090d16',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIconCompleted: {
    borderColor: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  circleIconActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  stageIconText: {
    fontSize: 16,
  },
  stepInfo: {
    marginLeft: 16,
  },
  stageTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748b',
  },
  stageTitleHighlighted: {
    color: '#ffffff',
  },
  stageDesc: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
});
