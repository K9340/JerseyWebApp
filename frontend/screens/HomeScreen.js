import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';

const baseProducts = [
  { id: '1', name: 'Al-Nassr Striker V', category: 'chevron', fabric: 'Dry-Fit Pro', desc: 'Bold V-Neck chevron alignment panel.', primaryColor: '#f59e0b', secondaryColor: '#1e3a8a', pattern: 'stripes-v' },
  { id: '2', name: 'Real Madrid Gold', category: 'solid', fabric: 'Dry-Fit Gold', desc: 'Ultra clean canvas with gold trim accents.', primaryColor: '#f8fafc', secondaryColor: '#eab308', pattern: 'stripes-none' },
  { id: '3', name: 'Inter Milan Blocks', category: 'stripes', fabric: 'Polyester Mesh', desc: 'Athletic vertical stripes with bold trims.', primaryColor: '#1e293b', secondaryColor: '#3b82f6', pattern: 'stripes-h' }
];

export default function HomeScreen({ navigation, onSelectTemplate }) {
  const { width } = useWindowDimensions();
  const cardWidth = width > 900 ? '31%' : width > 600 ? '48%' : '100%';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Banner Section */}
      <View style={styles.heroCard}>
        <Text style={styles.heroBadge}>ELITE SPORTS APPAREL HUB</Text>
        <Text style={styles.heroTitle}>
          Design Custom Jerseys for{"\n"}
          <Text style={styles.highlightText}>Your Whole Squad Live!</Text>
        </Text>
        <Text style={styles.heroDesc}>
          Design professional sublimation jerseys with instant crest alignments. Generate physical vector grading files automatically.
        </Text>
        
        <TouchableOpacity 
          style={styles.heroBtn}
          onPress={() => onSelectTemplate(baseProducts[0])}
        >
          <Text style={styles.heroBtnText}>Start Visual Design Tool</Text>
        </TouchableOpacity>
      </View>

      {/* Catalog Title */}
      <View style={styles.titleSection}>
        <Text style={styles.sectionTitle}>Our Premium Base Templates</Text>
        <Text style={styles.sectionSubtitle}>Select a layout style to load it into the customizer.</Text>
      </View>

      {/* Product Cards Grid */}
      <View style={styles.gridContainer}>
        {baseProducts.map(product => (
          <View key={product.id} style={[styles.productCard, { width: cardWidth }]}>
            <View style={styles.mockupPlaceholder}>
              <Text style={styles.mockupIcon}>👕</Text>
            </View>
            <View style={styles.productDetails}>
              <View style={styles.detailsRow}>
                <Text style={styles.fabricLabel}>{product.fabric.toUpperCase()}</Text>
                <Text style={styles.priceLabel}>₹399 - ₹599</Text>
              </View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDesc}>{product.desc}</Text>
              
              <TouchableOpacity 
                style={styles.cardBtn}
                onPress={() => onSelectTemplate(product)}
              >
                <Text style={styles.cardBtnText}>Customize Template</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  heroCard: {
    backgroundColor: '#090d16',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBadge: {
    color: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    letterSpacing: 1,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 34,
    marginBottom: 12,
  },
  highlightText: {
    color: '#34d399',
  },
  heroDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 20,
  },
  heroBtn: {
    backgroundColor: '#34d399',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  titleSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
    overflow: 'hidden',
  },
  mockupPlaceholder: {
    height: 140,
    backgroundColor: '#090d16',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupIcon: {
    fontSize: 48,
  },
  productDetails: {
    padding: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fabricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34d399',
  },
  priceLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  productDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 15,
    marginBottom: 16,
  },
  cardBtn: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cardBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
