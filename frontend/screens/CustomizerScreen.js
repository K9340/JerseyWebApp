import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, useWindowDimensions } from 'react-native';
import JerseyCanvas from '../components/JerseyCanvas';

const colorPalette = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Royal Blue', value: '#3b82f6' },
  { name: 'Scarlet Red', value: '#ef4444' },
  { name: 'Amber Gold', value: '#f59e0b' },
  { name: 'Midnight', value: '#1e293b' },
  { name: 'Frost White', value: '#f8fafc' }
];

export default function CustomizerScreen({ designState, setDesignState, onNextRoster }) {
  const { width } = useWindowDimensions();
  const [viewSide, setViewSide] = useState('front');

  const updateColor = (type, hex, name) => {
    setDesignState(prev => ({
      ...prev,
      [type + 'Color']: hex,
      [type + 'Label']: name,
      // Keep state values aligned
      [viewSide]: {
        ...prev[viewSide],
        ...(prev[viewSide]?.chestNumber ? {
          chestNumber: {
            ...prev[viewSide].chestNumber,
            ...(type === 'primary' ? { outlineColor: hex } : { fgColor: hex })
          }
        } : {})
      }
    }));
  };

  const updateText = (field, text) => {
    setDesignState(prev => {
      const updated = { ...prev };
      if (field === 'name') updated.name = text;
      if (field === 'number') updated.number = text;
      return updated;
    });
  };

  const updatePattern = (pattern) => {
    setDesignState(prev => ({ ...prev, pattern }));
  };

  const updateFont = (font) => {
    setDesignState(prev => ({ ...prev, fontFamily: font }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Editor Main Layout Grid */}
      <View style={[styles.workspace, { flexDirection: width > 900 ? 'row' : 'column' }]}>
        {/* Left Side: Jersey Render Preview Canvas */}
        <View style={[styles.canvasPanel, { width: width > 900 ? '58%' : '100%' }]}>
          <View style={styles.canvasHeader}>
            <Text style={styles.canvasTitle}>INTERACTIVE WORKSPACE</Text>
            <View style={styles.viewTabs}>
              <TouchableOpacity
                style={[styles.viewTab, viewSide === 'front' && styles.viewTabActive]}
                onPress={() => setViewSide('front')}
              >
                <Text style={[styles.viewTabText, viewSide === 'front' && styles.viewTabTextActive]}>Front View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewTab, viewSide === 'back' && styles.viewTabActive]}
                onPress={() => setViewSide('back')}
              >
                <Text style={[styles.viewTabText, viewSide === 'back' && styles.viewTabTextActive]}>Back View</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.canvasFrame}>
            <JerseyCanvas 
              side={viewSide} 
              state={{
                dpi: 100,
                previewSize: 'M',
                activeSleeveType: 'HALF',
                ...designState,
                players: [{ name: designState.name, number: designState.number }]
              }}
            />
          </View>
        </View>

        {/* Right Side: Configuration Options */}
        <View style={[styles.controlPanel, { width: width > 900 ? '39%' : '100%' }]}>
          
          {/* Section 1: Colors selection */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>🎨 1. COLOR PALETTE & STYLES</Text>
            
            {/* Primary Colors */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>PRIMARY JERSEY BASE</Text>
                <Text style={styles.valueLabel}>{designState.primaryLabel || 'Emerald Green'}</Text>
              </View>
              <View style={styles.colorPalette}>
                {colorPalette.map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.colorSwatch, { backgroundColor: c.value }, designState.primaryColor === c.value && styles.colorSwatchActive]}
                    onPress={() => updateColor('primary', c.value, c.name)}
                  />
                ))}
              </View>
            </View>

            {/* Accent Colors */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>ACCENT STRIPE / PANEL</Text>
                <Text style={styles.valueLabel}>{designState.secondaryLabel || 'Amber Gold'}</Text>
              </View>
              <View style={styles.colorPalette}>
                {colorPalette.map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.colorSwatch, { backgroundColor: c.value }, designState.secondaryColor === c.value && styles.colorSwatchActive]}
                    onPress={() => updateColor('secondary', c.value, c.name)}
                  />
                ))}
              </View>
            </View>

            {/* Accent Stripe Pattern Select */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>JERSEY STRIPE PATTERN</Text>
              <View style={styles.patternGrid}>
                {['stripes-v', 'stripes-h', 'stripes-none'].map(pat => (
                  <TouchableOpacity
                    key={pat}
                    style={[styles.patternBtn, designState.pattern === pat && styles.patternBtnActive]}
                    onPress={() => updatePattern(pat)}
                  >
                    <Text style={[styles.patternBtnText, designState.pattern === pat && styles.patternBtnTextActive]}>
                      {pat === 'stripes-v' ? 'Chevron' : pat === 'stripes-h' ? 'Blocks' : 'Solid'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Section 2: Text Elements */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>🔤 2. TEXT & PLAYER TYPOGRAPHY</Text>
            
            <View style={styles.formRow}>
              <View style={[styles.inputField, { marginRight: 8 }]}>
                <Text style={styles.inputLabel}>PREVIEW PLAYER NAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={designState.name}
                  onChangeText={(val) => updateText('name', val)}
                  placeholder="e.g. VIRAT"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>PREVIEW PLAYER NUMBER</Text>
                <TextInput
                  style={styles.textInput}
                  value={designState.number}
                  onChangeText={(val) => updateText('number', val)}
                  placeholder="18"
                  maxLength={3}
                  placeholderTextColor="#64748b"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Font Family Config */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SPORT FONT STYLE</Text>
              <View style={styles.patternGrid}>
                {['Oswald', 'Graduate', 'Bungee', 'Allura'].map(font => (
                  <TouchableOpacity
                    key={font}
                    style={[styles.patternBtn, designState.fontFamily === font && styles.patternBtnActive]}
                    onPress={() => updateFont(font)}
                  >
                    <Text style={[styles.patternBtnText, designState.fontFamily === font && styles.patternBtnTextActive, { fontFamily: font === 'Graduate' ? 'serif' : 'sans-serif' }]}>
                      {font}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Submit Panel Action */}
          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={onNextRoster}
          >
            <Text style={styles.submitBtnText}>Finalize Base Design & Add Roster</Text>
          </TouchableOpacity>

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
  workspace: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  canvasPanel: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 20,
  },
  canvasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  canvasTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34d399',
    letterSpacing: 1,
  },
  viewTabs: {
    flexDirection: 'row',
    backgroundColor: '#090d16',
    borderRadius: 10,
    padding: 3,
  },
  viewTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewTabActive: {
    backgroundColor: '#34d399',
  },
  viewTabText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewTabTextActive: {
    color: '#0f172a',
  },
  canvasFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  controlPanel: {
    flexDirection: 'column',
  },
  sectionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 12,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  valueLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#ffffff',
  },
  patternGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  patternBtn: {
    flex: 1,
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  patternBtnActive: {
    borderColor: '#34d399',
    borderWidth: 2,
  },
  patternBtnText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
  },
  patternBtnTextActive: {
    color: '#ffffff',
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
  },
  textInput: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
  },
  submitBtn: {
    backgroundColor: '#34d399',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  submitBtnText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '800',
  },
});
