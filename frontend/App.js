import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

// Load Screen Viewports
import HomeScreen from './screens/HomeScreen';
import CustomizerScreen from './screens/CustomizerScreen';
import RosterScreen from './screens/RosterScreen';
import TrackingScreen from './screens/TrackingScreen';
import AdminScreen from './screens/AdminScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [activeOrderId, setActiveOrderId] = useState('');
  
  // Customizer Configuration State
  const [designState, setDesignState] = useState({
    primaryColor: '#10b981',
    primaryLabel: 'Emerald Green',
    secondaryColor: '#f59e0b',
    secondaryLabel: 'Amber Gold',
    pattern: 'stripes-v',
    fontFamily: 'Oswald',
    name: 'VIRAT',
    number: '18'
  });

  // Action hook when a catalog template is clicked
  const handleSelectTemplate = (template) => {
    setDesignState(prev => ({
      ...prev,
      primaryColor: template.primaryColor,
      primaryLabel: template.name,
      secondaryColor: template.secondaryColor,
      secondaryLabel: 'Accent Panel',
      pattern: template.pattern
    }));
    setCurrentTab('customizer');
  };

  const handleOrderSubmitted = (orderId) => {
    setActiveOrderId(orderId);
    setCurrentTab('tracking');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header Dashboard Nav Panel */}
      <View style={styles.header}>
        <View style={styles.logoGroup}>
          <View style={styles.logoIconBg}>
            <Text style={styles.logoIcon}>👕</Text>
          </View>
          <View>
            <Text style={styles.logoText}>FUTURA</Text>
            <Text style={styles.logoSubtext}>Apparel Global</Text>
          </View>
        </View>

        {/* Global active server badge */}
        {Platform.OS === 'web' && (
          <View style={styles.serverBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.serverText}>Global Server Active</Text>
          </View>
        )}
      </View>

      {/* Main Workspace Navigation Container */}
      <View style={styles.workspace}>
        {currentTab === 'home' && (
          <HomeScreen 
            onSelectTemplate={handleSelectTemplate} 
          />
        )}
        {currentTab === 'customizer' && (
          <CustomizerScreen 
            designState={designState}
            setDesignState={setDesignState}
            onNextRoster={() => setCurrentTab('bulk')}
          />
        )}
        {currentTab === 'bulk' && (
          <RosterScreen 
            designState={designState}
            onOrderSubmitted={handleOrderSubmitted}
          />
        )}
        {currentTab === 'tracking' && (
          <TrackingScreen 
            activeOrderId={activeOrderId} 
          />
        )}
        {currentTab === 'admin' && (
          <AdminScreen />
        )}
      </View>

      {/* Bottom Navigation Deck TabBar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'home' && styles.tabItemActive]}
          onPress={() => setCurrentTab('home')}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'customizer' && styles.tabItemActive]}
          onPress={() => setCurrentTab('customizer')}
        >
          <Text style={styles.tabIcon}>✨</Text>
          <Text style={[styles.tabLabel, currentTab === 'customizer' && styles.tabLabelActive]}>Customizer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'bulk' && styles.tabItemActive]}
          onPress={() => setCurrentTab('bulk')}
        >
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={[styles.tabLabel, currentTab === 'bulk' && styles.tabLabelActive]}>Roster</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'tracking' && styles.tabItemActive]}
          onPress={() => setCurrentTab('tracking')}
        >
          <Text style={styles.tabIcon}>🚚</Text>
          <Text style={[styles.tabLabel, currentTab === 'tracking' && styles.tabLabelActive]}>Track</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'admin' && styles.tabItemActive]}
          onPress={() => setCurrentTab('admin')}
        >
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={[styles.tabLabel, currentTab === 'admin' && styles.tabLabelActive]}>Admin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    height: 64,
    backgroundColor: '#090d16',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIconBg: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  logoIcon: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 0.5,
  },
  logoSubtext: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  serverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 99,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
    marginRight: 6,
  },
  serverText: {
    fontSize: 9,
    color: '#34d399',
    fontWeight: 'bold',
  },
  workspace: {
    flex: 1,
  },
  tabBar: {
    height: 64,
    backgroundColor: '#090d16',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#34d399',
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: 'bold',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#34d399',
  },
});
