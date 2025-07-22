# IKEv2/IPsec VPN Usage Example

This example shows how to integrate and use the IKEv2/IPsec VPN functionality in your React Native app.

## Quick Start

### 1. Basic IKEv2/IPsec Connection

```typescript
import vpnService, {VpnConfig} from './src/services/VpnService';
import VpnControl from './src/components/VpnControl';

// Example IKEv2/IPsec configuration
const vpnConfig: VpnConfig = {
  server: 'ikev2.mycompany.com',
  identifier: 'user@mycompany.com',
  psk: 'MySecretPreSharedKey123!',
};

// Connect to VPN
const connectToVpn = async () => {
  try {
    const result = await vpnService.connect(vpnConfig);
    console.log('✅ IKEv2/IPsec VPN Connected:', result);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
};

// Monitor VPN state
vpnService.addStateListener(state => {
  console.log('🔄 VPN State:', state.state);
  switch (state.state) {
    case 'CONNECTING':
      console.log('🔄 Establishing IKEv2/IPsec tunnel...');
      break;
    case 'CONNECTED':
      console.log('🔒 IKEv2/IPsec tunnel established');
      break;
    case 'DISCONNECTING':
      console.log('🔓 Disconnecting from VPN...');
      break;
    case 'DISABLED':
      console.log('⭕ VPN disconnected');
      break;
  }
});
```

### 2. React Component Integration

```tsx
import React from 'react';
import {View} from 'react-native';
import VpnControl from './src/components/VpnControl';

export default function App() {
  return (
    <View style={{flex: 1}}>
      <VpnControl />
    </View>
  );
}
```

### 3. Real-World Configuration Examples

#### Corporate VPN Server

```typescript
const corporateVpn: VpnConfig = {
  server: 'vpn.company.com',
  identifier: 'employee.id@company.com',
  psk: 'CorporateSharedSecret2024',
};
```

#### Personal VPN Server

```typescript
const personalVpn: VpnConfig = {
  server: '203.0.113.100', // Your server IP
  identifier: 'myusername',
  psk: 'MyPersonalPSK2024!',
};
```

#### Cloud VPN Provider

```typescript
const cloudVpn: VpnConfig = {
  server: 'ikev2-us-east.cloudvpn.com',
  identifier: 'user12345',
  psk: 'ProviderGeneratedPSK',
};
```

## Advanced Usage

### Custom VPN State Management

```typescript
import {useState, useEffect} from 'react';
import vpnService, {VpnState} from './src/services/VpnService';

const useVpnConnection = () => {
  const [state, setState] = useState<VpnState>({state: 'DISABLED'});
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = vpnService.addStateListener(newState => {
      setState(newState);
      setIsConnecting(newState.state === 'CONNECTING');
    });

    return unsubscribe;
  }, []);

  const connect = async (config: VpnConfig) => {
    setIsConnecting(true);
    try {
      await vpnService.connect(config);
    } catch (error) {
      setIsConnecting(false);
      throw error;
    }
  };

  const disconnect = async () => {
    await vpnService.disconnect();
  };

  return {
    state,
    isConnecting,
    isConnected: state.state === 'CONNECTED',
    connect,
    disconnect,
  };
};
```

### Error Handling

```typescript
const connectWithErrorHandling = async (config: VpnConfig) => {
  try {
    // Check permission first
    const hasPermission = await vpnService.checkPermission();
    if (!hasPermission) {
      console.log('📱 VPN permission will be requested');
    }

    await vpnService.connect(config);
  } catch (error) {
    switch (error.code) {
      case 'VPN_PERMISSION_DENIED':
        console.error('❌ User denied VPN permission');
        break;
      case 'VPN_CONNECTION_ERROR':
        console.error('❌ Failed to establish IKEv2/IPsec connection');
        break;
      default:
        console.error('❌ Unknown error:', error.message);
    }
  }
};
```

### Background Connection Management

```typescript
import {AppState} from 'react-native';

class VpnManager {
  private config: VpnConfig | null = null;
  private shouldReconnect = false;

  async connect(config: VpnConfig) {
    this.config = config;
    this.shouldReconnect = true;

    await vpnService.connect(config);

    // Handle app state changes
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active' && this.shouldReconnect) {
      this.checkAndReconnect();
    }
  };

  private async checkAndReconnect() {
    const state = await vpnService.getState();
    if (state.state === 'DISABLED' && this.config) {
      console.log('🔄 Reconnecting to IKEv2/IPsec VPN...');
      await vpnService.connect(this.config);
    }
  }

  async disconnect() {
    this.shouldReconnect = false;
    await vpnService.disconnect();
    AppState.removeEventListener('change', this.handleAppStateChange);
  }
}
```

## Testing Your Implementation

### 1. Test VPN Connection

```typescript
const testConnection = async () => {
  const config: VpnConfig = {
    server: 'test.ikev2server.com',
    identifier: 'testuser',
    psk: 'testpsk123',
  };

  console.log('🧪 Testing IKEv2/IPsec connection...');

  try {
    await vpnService.connect(config);

    // Wait for connection
    await new Promise(resolve => {
      const unsubscribe = vpnService.addStateListener(state => {
        if (state.state === 'CONNECTED') {
          console.log('✅ Test successful - IKEv2/IPsec connected!');
          unsubscribe();
          resolve(true);
        }
      });
    });

    await vpnService.disconnect();
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};
```

### 2. Monitor Logs

Check Android logs for detailed IKEv2/IPsec information:

```bash
adb logcat -s IkeV2VpnService VpnModule
```

## Common IKEv2/IPsec Server Configurations

### strongSwan Server Configuration

```bash
# /etc/ipsec.conf
conn ikev2-psk
    auto=add
    keyexchange=ikev2
    type=tunnel
    leftauth=psk
    rightauth=psk
    left=%any
    right=%any
    ike=aes256-sha256-modp2048
    esp=aes256-sha256
```

### Compatible VPN Providers

- **strongSwan** servers
- **Libreswan** servers
- **Windows Server** with IKEv2 role
- **pfSense** with IKEv2 package
- **Mikrotik RouterOS** with IKEv2
- **Cisco ASA** with IKEv2 support

## Security Best Practices

1. **Strong PSK**: Use at least 20 random characters
2. **Unique Identifiers**: Don't reuse identifiers across users
3. **Server Certificates**: Consider upgrading to certificate authentication
4. **Network Security**: Protect your IKEv2 server with firewall rules
5. **Key Rotation**: Regularly update pre-shared keys

## Troubleshooting

### Common Issues

1. **"VPN_PERMISSION_DENIED"**

   - User needs to grant VPN permission in Android settings

2. **"Connection timeout"**

   - Check server address and firewall rules
   - Verify IKEv2 service is running on port 500/4500

3. **"Authentication failed"**
   - Verify PSK and identifier match server configuration
   - Check server logs for authentication details

### Debug Steps

1. Test basic connectivity: `ping ikev2.yourserver.com`
2. Check IKEv2 port accessibility: `nmap -p 500,4500 ikev2.yourserver.com`
3. Monitor Android logs: `adb logcat -s IkeV2VpnService`
4. Verify server configuration matches client settings

This IKEv2/IPsec implementation provides a solid foundation for secure VPN connectivity in your React Native application!
