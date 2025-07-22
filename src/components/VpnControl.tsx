import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import vpnService, {VpnConfig, VpnState} from '../services/VpnService';

const VpnControl: React.FC = () => {
  const [vpnConfig, setVpnConfig] = useState<VpnConfig>({
    server: '',
    identifier: '',
    psk: '',
  });

  const [vpnState, setVpnState] = useState<VpnState>({
    state: 'DISABLED',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Check VPN permission on mount
    checkVpnPermission();

    // Get initial VPN state
    getVpnState();

    // Subscribe to VPN state changes
    const unsubscribe = vpnService.addStateListener(state => {
      setVpnState(state);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkVpnPermission = async () => {
    try {
      const permission = await vpnService.checkPermission();
      setHasPermission(permission);
    } catch (error) {
      console.error('Failed to check VPN permission:', error);
    }
  };

  const getVpnState = async () => {
    try {
      const state = await vpnService.getState();
      setVpnState(state);
    } catch (error) {
      console.error('Failed to get VPN state:', error);
    }
  };

  const handleConnect = async () => {
    if (!vpnConfig.server || !vpnConfig.identifier || !vpnConfig.psk) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await vpnService.connect(vpnConfig);
      console.log('VPN connection result:', result);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Connection Failed', `${error}`);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      const result = await vpnService.disconnect();
      console.log('VPN disconnection result:', result);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Disconnection Failed', `${error}`);
    }
  };

  const handleForceDisconnect = async () => {
    setIsLoading(true);
    try {
      const result = await vpnService.forceDisconnect();
      console.log('VPN force disconnection result:', result);
      Alert.alert('Success', 'VPN force disconnected');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Force Disconnection Failed', `${error}`);
    }
  };

  const getStateColor = () => {
    switch (vpnState.state) {
      case 'CONNECTED':
        return '#4CAF50';
      case 'CONNECTING':
        return '#FF9800';
      case 'DISCONNECTING':
        return '#FF9800';
      case 'DISABLED':
      default:
        return '#F44336';
    }
  };

  const canConnect = vpnState.state === 'DISABLED' && !isLoading;
  const canDisconnect =
    (vpnState.state === 'CONNECTED' || vpnState.state === 'CONNECTING') &&
    !isLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>VPN Control</Text>

      {/* VPN Status */}
      <View style={styles.statusContainer}>
        <View
          style={[styles.statusIndicator, {backgroundColor: getStateColor()}]}
        />
        <Text style={styles.statusText}>
          Status: {vpnState.state}
          {vpnState.error && ` (${vpnState.error})`}
        </Text>
      </View>

      {/* Permission Status */}
      <Text style={styles.permissionText}>
        VPN Permission: {hasPermission ? '✓ Granted' : '✗ Not Granted'}
      </Text>

      {/* VPN Configuration */}
      <View style={styles.configContainer}>
        <Text style={styles.configTitle}>IKEv2/IPsec Configuration</Text>

        <TextInput
          style={styles.input}
          placeholder="IKEv2 Server (e.g., ikev2.example.com)"
          value={vpnConfig.server}
          onChangeText={text => setVpnConfig({...vpnConfig, server: text})}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="IPsec Identifier"
          value={vpnConfig.identifier}
          onChangeText={text => setVpnConfig({...vpnConfig, identifier: text})}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Pre-shared Key (PSK)"
          value={vpnConfig.psk}
          onChangeText={text => setVpnConfig({...vpnConfig, psk: text})}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Control Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.connectButton,
            !canConnect && styles.disabledButton,
          ]}
          onPress={handleConnect}
          disabled={!canConnect}>
          {isLoading && canConnect ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Connect</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.disconnectButton,
            !canDisconnect && styles.disabledButton,
          ]}
          onPress={handleDisconnect}
          disabled={!canDisconnect}>
          {isLoading && canDisconnect ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Disconnect</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Force Disconnect Button - only show when connected */}
      {vpnState.state === 'CONNECTED' && (
        <View style={styles.forceDisconnectContainer}>
          <TouchableOpacity
            style={[styles.button, styles.forceDisconnectButton]}
            onPress={handleForceDisconnect}
            disabled={isLoading}>
            <Text style={styles.buttonText}>Force Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  permissionText: {
    fontSize: 14,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  configContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forceDisconnectContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  forceDisconnectButton: {
    backgroundColor: '#FF6B35',
  },
});

export default VpnControl;
