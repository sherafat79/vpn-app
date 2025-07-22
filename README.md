# IKEv2/IPsec VPN App for React Native

A production-ready React Native application with native Android IKEv2/IPsec VPN functionality using pre-shared key (PSK) authentication.

![VPN Mobile App](/src/assets/cover.png 'VPN Mobile App')

## ✨ Features

- 🔒 **IKEv2/IPsec VPN Protocol** - Industry-standard VPN protocol with robust security
- 🔑 **PSK Authentication** - Pre-shared key authentication for secure connections
- 📱 **Native Android Implementation** - Uses Android's built-in VPN APIs for optimal performance
- 🎯 **Android 10+ Support** - Native `Ikev2VpnProfile` support with legacy fallback
- 🔄 **Real-time State Monitoring** - Live VPN connection status updates
- ⚡ **TypeScript Integration** - Fully typed API with Promise-based architecture
- 🛡️ **Automatic Permission Handling** - Seamless VPN permission management
- 📊 **Event-driven Updates** - React Native event system for state changes
- 🎨 **Modern UI Components** - Beautiful and intuitive user interface
- 🚀 **Production Ready** - Comprehensive error handling and logging

## 🏗️ Architecture

```
React Native Layer (TypeScript)
    ↓
VpnService.ts (Service Layer)
    ↓
VpnModule.java (Native Bridge)
    ↓
IkeV2VpnService (IKEv2/IPsec Implementation)
    ↓
Android VpnService + Ikev2VpnProfile
```

## 🛠 Installation

### Prerequisites

- React Native development environment set up
- Android SDK installed
- Node.js and npm/yarn
- Android device or emulator (API level 21+)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd vpn-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Install correct Node version** (using [NVM](https://github.com/nvm-sh/nvm))

   ```bash
   nvm install
   nvm use
   ```

4. **Android setup**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

## 🚀 Running the Application

1. **Start Metro bundler**

   ```bash
   npm start
   ```

2. **Run on Android**

   ```bash
   npm run android
   ```

3. **Run on iOS** (VPN functionality not implemented for iOS)
   ```bash
   npm run ios
   ```

## 📋 VPN Configuration

### Basic IKEv2/IPsec Setup

```typescript
import vpnService, {VpnConfig} from './src/services/VpnService';

const vpnConfig: VpnConfig = {
  server: 'ikev2.yourserver.com', // IKEv2 server address
  identifier: 'user@company.com', // IPsec identifier
  psk: 'YourPreSharedKey123!', // Pre-shared key
};

// Connect to VPN
await vpnService.connect(vpnConfig);

// Disconnect from VPN
await vpnService.disconnect();
```

### Real-World Examples

#### Corporate VPN

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
  server: '203.0.113.100',
  identifier: 'myusername',
  psk: 'MyPersonalPSK2024!',
};
```

## 🎮 Usage Examples

### Basic Connection Management

```typescript
import vpnService from './src/services/VpnService';

// Check VPN permission
const hasPermission = await vpnService.checkPermission();

// Connect with error handling
try {
  await vpnService.connect(config);
  console.log('VPN connected successfully');
} catch (error) {
  console.error('Connection failed:', error);
}

// Monitor connection state
vpnService.addStateListener(state => {
  console.log('VPN State:', state.state);
  // States: DISABLED, CONNECTING, CONNECTED, DISCONNECTING
});
```

### React Component Integration

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

### Advanced State Management

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

  return {
    state,
    isConnecting,
    isConnected: state.state === 'CONNECTED',
    connect: vpnService.connect,
    disconnect: vpnService.disconnect,
  };
};
```

## 📚 API Documentation

### VpnService Methods

| Method                       | Description                  | Returns                    |
| ---------------------------- | ---------------------------- | -------------------------- |
| `connect(config)`            | Connect to IKEv2/IPsec VPN   | `Promise<string>`          |
| `disconnect()`               | Disconnect from VPN          | `Promise<string>`          |
| `forceDisconnect()`          | Force disconnect (emergency) | `Promise<string>`          |
| `getState()`                 | Get current VPN state        | `Promise<VpnState>`        |
| `checkPermission()`          | Check VPN permission status  | `Promise<boolean>`         |
| `addStateListener(callback)` | Subscribe to state changes   | `() => void` (unsubscribe) |

### VPN States

- **DISABLED** - VPN is disconnected
- **CONNECTING** - Establishing VPN connection
- **CONNECTED** - VPN is active and routing traffic
- **DISCONNECTING** - VPN is being disconnected

### Error Codes

- `VPN_PERMISSION_ERROR` - VPN permission not available
- `VPN_PERMISSION_DENIED` - User denied VPN permission
- `VPN_CONNECTION_ERROR` - Failed to establish connection
- `VPN_DISCONNECTION_ERROR` - Failed to disconnect
- `VPN_STATE_ERROR` - State retrieval failed

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**

   ```bash
   cd android && ./gradlew clean
   npm run android
   ```

2. **VPN Permission Issues**

   - Permission is requested automatically on first connection
   - Check Android VPN settings if issues persist

3. **Connection Failures**

   - Verify server address and credentials
   - Check network connectivity
   - Review Android logs: `adb logcat -s IkeV2VpnService VpnModule`

4. **Disconnect Issues**
   - Use the force disconnect button if normal disconnect fails
   - Check logs for service termination details

### Debug Commands

```bash
# Monitor VPN logs
adb logcat -s IkeV2VpnService VpnModule

# Check VPN interfaces
adb shell ip link show type tun

# Test server connectivity
ping ikev2.yourserver.com
nmap -p 500,4500 ikev2.yourserver.com
```

## 🔒 Security Considerations

### Best Practices

1. **Strong PSK** - Use at least 20 random characters
2. **Unique Identifiers** - Don't reuse identifiers across users
3. **Secure Storage** - Consider using react-native-keychain for credentials
4. **Server Security** - Protect your IKEv2 server with proper firewall rules
5. **Certificate Upgrade** - Consider upgrading to certificate-based auth

### Supported VPN Servers

- **strongSwan** servers
- **Libreswan** servers
- **Windows Server** with IKEv2 role
- **pfSense** with IKEv2 package
- **Mikrotik RouterOS** with IKEv2
- **Cisco ASA** with IKEv2 support
- Most commercial VPN providers supporting IKEv2/IPsec

## 📱 Platform Support

- ✅ **Android**: Full IKEv2/IPsec support (API 21+)
  - Android 10+: Native `Ikev2VpnProfile` implementation
  - Android 9 and below: Legacy VPN interface with IKEv2 simulation
- ❌ **iOS**: Not implemented (requires NetworkExtension framework)

## 📂 Project Structure

```
vpn-app/
├── src/
│   ├── components/
│   │   └── VpnControl.tsx          # Main VPN UI component
│   ├── services/
│   │   └── VpnService.ts           # TypeScript VPN service
│   ├── constants/
│   └── screens/
├── android/
│   └── app/src/main/java/com/vpnapp/vpn/
│       ├── VpnModule.java          # React Native bridge
│       ├── IkeV2VpnService.java    # Native VPN implementation
│       └── VpnPackage.java         # Module registration
├── VPN_INTEGRATION.md              # Detailed integration guide
├── IKEV2_USAGE_EXAMPLE.md          # Usage examples
└── DISCONNECT_TROUBLESHOOTING.md   # Disconnect troubleshooting
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Test thoroughly with real VPN servers
- Maintain backward compatibility
- Update documentation for API changes
- Follow React Native best practices for native modules
- Add appropriate logging for debugging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UI Design: [Day 278 – VPN Mobile App UI Kit](https://project365.design/2018/10/05/day-278-vpn-mobile-app-ui-kit-sketch-freebie/)
- strongSwan project for IKEv2/IPsec protocol implementation
- React Native community for the excellent framework

## 📞 Support

- 📖 [Documentation](VPN_INTEGRATION.md)
- 🎯 [Usage Examples](IKEV2_USAGE_EXAMPLE.md)
- 🔧 [Troubleshooting](DISCONNECT_TROUBLESHOOTING.md)
- 🐛 [Issues](../../issues)

---

**Happy coding!** 🚀

_Built with ❤️ using React Native and Android's native VPN APIs_
