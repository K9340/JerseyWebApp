import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';

// Platform-specific WebView for native mobile
let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

// Designer HTML URL - serves from backend public folder
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const DESIGNER_URL = `${BACKEND_URL}/designer.html`;

export default function CustomizerScreen({ designState, setDesignState, onNextRoster }) {
  const { width, height } = useWindowDimensions();

  // Build query parameters to pre-load the designer with the selected template colours
  const queryParams = new URLSearchParams({
    primaryColor: designState?.primaryColor || '#10b981',
    secondaryColor: designState?.secondaryColor || '#f59e0b',
    pattern: designState?.pattern || 'stripes-v',
    font: designState?.fontFamily || 'Oswald',
    name: designState?.name || 'PLAYER',
    number: designState?.number || '10',
  }).toString();

  const designerUrl = `${DESIGNER_URL}?${queryParams}`;

  // ──────────────────────────────────────────────
  // WEB: Render as full-screen iframe
  // ──────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={styles.wrapper}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.titleGroup}>
            <Text style={styles.topIcon}>🎨</Text>
            <View>
              <Text style={styles.topTitle}>JERSEY DUAL DESIGNER PRO</Text>
              <Text style={styles.topSub}>Drag, position and customise elements live</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.proceedBtn} onPress={onNextRoster}>
            <Text style={styles.proceedText}>✅ Save &amp; Add Roster →</Text>
          </TouchableOpacity>
        </View>

        {/* Inline Designer iframe */}
        <iframe
          src={designerUrl}
          title="Jersey Dual Designer Pro"
          style={{
            flex: 1,
            width: '100%',
            height: height - 56,
            border: 'none',
            display: 'block',
          }}
          allow="clipboard-read; clipboard-write"
        />
      </View>
    );
  }

  // ──────────────────────────────────────────────
  // NATIVE (iOS / Android): Render as WebView
  // ──────────────────────────────────────────────
  return (
    <View style={styles.wrapper}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.titleGroup}>
          <Text style={styles.topIcon}>🎨</Text>
          <View>
            <Text style={styles.topTitle}>JERSEY DESIGNER PRO</Text>
            <Text style={styles.topSub}>Drag and position elements live</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.proceedBtn} onPress={onNextRoster}>
          <Text style={styles.proceedText}>Save & Roster →</Text>
        </TouchableOpacity>
      </View>

      {WebView ? (
        <WebView
          source={{ uri: designerUrl }}
          style={styles.nativeView}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          startInLoadingState
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Loading designer...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0f172a',
    flexDirection: 'column',
  },
  topBar: {
    height: 56,
    backgroundColor: '#090d16',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topIcon: {
    fontSize: 22,
  },
  topTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  topSub: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 1,
  },
  proceedBtn: {
    backgroundColor: '#34d399',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  proceedText: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: 'bold',
  },
  nativeView: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#64748b',
    fontSize: 14,
  },
});
