import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Platform, Image, Alert } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { authService } from './services/api';

WebBrowser.maybeCompleteAuthSession();

// Load Screen Viewports
import HomeScreen from './screens/HomeScreen';
import CustomizerScreen from './screens/CustomizerScreen';
import RosterScreen from './screens/RosterScreen';
import TrackingScreen from './screens/TrackingScreen';
import AdminScreen from './screens/AdminScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [activeOrderId, setActiveOrderId] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Configure OAuth request parameters
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  // Load session from local storage on mount (Web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedUser = localStorage.getItem('futura_user_session');
      if (savedUser) {
        try {
          setUserInfo(JSON.parse(savedUser));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Parse callback token from URL hash on Web startup
  useEffect(() => {
    if (Platform.OS === 'web' && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        handleLogin(accessToken);
        // Clean hash from URL so it doesn't re-trigger on reload
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Watch authentication response hook
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleLogin(authentication.accessToken);
    }
  }, [response]);

  const handleLogin = async (accessToken) => {
    try {
      const data = await authService.loginWithGoogle(accessToken);
      setUserInfo(data.user);
      if (Platform.OS === 'web') {
        localStorage.setItem('futura_user_session', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      const mockUser = {
        name: 'Guest Player',
        email: 'guest@futura.com',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
      };
      setUserInfo(mockUser);
      if (Platform.OS === 'web') {
        localStorage.setItem('futura_user_session', JSON.stringify(mockUser));
      }
    }
  };

  const handleLogout = () => {
    const executeLogout = () => {
      setUserInfo(null);
      if (Platform.OS === 'web') {
        localStorage.removeItem('futura_user_session');
      }
    };

    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm("Are you sure you want to log out?");
      if (confirmLogout) {
        executeLogout();
      }
    } else {
      Alert.alert(
        "Confirm Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", style: "destructive", onPress: executeLogout }
        ]
      );
    }
  };
  
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

        {/* Right side widgets */}
        <View style={styles.headerRight}>
          {Platform.OS === 'web' && (
            <View style={styles.serverBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.serverText}>Global Active</Text>
            </View>
          )}

          {userInfo ? (
            <View style={styles.userBadge}>
              {userInfo.picture ? (
                <Image source={{ uri: userInfo.picture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {userInfo.name ? userInfo.name.substring(0, 1).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              disabled={!request} 
              onPress={() => promptAsync()} 
              style={styles.loginBtn}
            >
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34d399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  logoutBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  logoutText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  loginBtn: {
    backgroundColor: '#34d399',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
