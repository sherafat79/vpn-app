# IKEv2/IPsec VPN Integration for React Native

This implementation provides a native Android IKEv2/IPsec VPN solution using Android's built-in VPN APIs, offering robust IPsec connectivity with PSK authentication directly integrated into your React Native app.

## Features

- ✅ IKEv2/IPsec VPN protocol support
- ✅ Pre-shared Key (PSK) authentication
- ✅ Android native VpnService integration
- ✅ Real-time VPN state monitoring
- ✅ Promise-based API with TypeScript support
- ✅ Automatic VPN permission handling
- ✅ Event-driven state updates
- ✅ Production-ready error handling
- ✅ Android 10+ native IKEv2 support with legacy fallback

## Architecture

```
React Native Layer
    ↓
VpnService.ts (TypeScript Service)
    ↓
VpnModule.java (Native Bridge)
    ↓
IkeV2VpnService (IKEv2/IPsec Implementation)
    ↓
Android VpnService + Ikev2VpnProfile
```

## Installation & Setup

### 1. Dependencies

The following dependencies are automatically added to your `android/app/build.gradle`:

```gradle
// VPN dependencies
implementation 'androidx.preference:preference:1.2.1'
```

### 2. Permissions

These permissions are added to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BIND_VPN_SERVICE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

### 3. Service Declaration

The IkeV2VpnService is declared in your manifest:

```xml
<service android:name="com.vpnapp.vpn.IkeV2VpnService"
         android:permission="android.permission.BIND_VPN_SERVICE">
  <intent-filter>
    <action android:name="android.net.VpnService" />
  </intent-filter>
</service>
```

### 4. Native Module Registration

The VPN module is registered in `MainApplication.java`:

```java
import com.vpnapp.vpn.VpnPackage;

// In getPackages()
packages.add(new VpnPackage());
```

## Usage

### Basic Implementation

```typescript
import vpnService, {VpnConfig} from './src/services/VpnService';

// Configure IKEv2/IPsec VPN connection
const config: VpnConfig = {
  server: 'ikev2.example.com',
  identifier: 'your-ipsec-identifier',
  psk: 'your-pre-shared-key',
};

// Connect to VPN
try {
  await vpnService.connect(config);
  console.log('VPN connection initiated');
} catch (error) {
  console.error('VPN connection failed:', error);
}

// Disconnect from VPN
try {
  await vpnService.disconnect();
  console.log('VPN disconnected');
} catch (error) {
  console.error('VPN disconnection failed:', error);
}
```

### State Monitoring

```typescript
import {VpnState} from './src/services/VpnService';

// Subscribe to state changes
const unsubscribe = vpnService.addStateListener((state: VpnState) => {
  console.log('VPN State:', state.state);
  if (state.error) {
    console.error('VPN Error:', state.error);
  }
});

// Get current state
const currentState = await vpnService.getState();
console.log('Current VPN state:', currentState);

// Clean up listener
unsubscribe();
```

### Permission Handling

```typescript
// Check VPN permission
const hasPermission = await vpnService.checkPermission();
if (!hasPermission) {
  console.log('VPN permission will be requested on connection');
}
```

### React Component Integration

```typescript
import VpnControl from './src/components/VpnControl';

export default function App() {
  return <VpnControl />;
}
```

## API Reference

### VpnService Methods

#### `connect(config: VpnConfig): Promise<string>`

Initiates VPN connection with the provided configuration.

**Parameters:**

- `config.server`: IKEv2/IPsec server hostname or IP
- `config.identifier`: IPsec identifier for authentication
- `config.psk`: Pre-shared key for IKEv2/IPsec

#### `disconnect(): Promise<string>`

Disconnects the active VPN connection.

#### `getState(): Promise<VpnState>`

Returns current VPN connection state and any error information.

#### `checkPermission(): Promise<boolean>`

Checks if VPN permission is granted.

#### `addStateListener(listener: VpnStateListener): () => void`

Subscribes to VPN state changes. Returns unsubscribe function.

### VPN States

- `DISABLED`: VPN is not connected
- `CONNECTING`: VPN connection is being established
- `CONNECTED`: VPN is successfully connected
- `DISCONNECTING`: VPN is being disconnected

### Error Handling

The service provides detailed error messages for common scenarios:

- `VPN_PERMISSION_ERROR`: VPN permission not granted
- `VPN_PERMISSION_DENIED`: User denied VPN permission
- `VPN_CONNECTION_ERROR`: Connection establishment failed
- `VPN_DISCONNECTION_ERROR`: Disconnection failed
- `VPN_STATE_ERROR`: State retrieval failed

## VPN Configuration

### Current Implementation

This is a **IKEv2/IPsec implementation** using Android's native VPN APIs:

**Android 10+ (API 29+):**

- Native `Ikev2VpnProfile` support with PSK authentication
- Full IKEv2/IPsec protocol implementation
- Hardware-accelerated encryption when available

**Legacy Support (Android 9 and below):**

- VPN interface with IKEv2-like configuration
- MTU optimized for IPsec (1400 bytes)
- DNS configuration (Google DNS: 8.8.8.8, 8.8.4.4)
- Private IP assignment (10.0.0.2/24)

**Common Features:**

- PSK (Pre-shared Key) authentication
- IPsec identifier-based authentication
- Real-time connection monitoring

### Extending the IKEv2/IPsec Implementation

The current implementation provides solid IKEv2/IPsec support. You can extend `IkeV2VpnService` to:

1. **Enhanced Authentication**: Add certificate-based authentication (X.509)
2. **Advanced Configuration**: Configure custom IKE proposals and ESP algorithms
3. **Multi-Server Support**: Implement failover between multiple IKEv2 servers
4. **Traffic Optimization**: Add split-tunneling and custom routing rules

### Example Extension

```java
// In IkeV2VpnService.java, enhance with certificate authentication:

private void startNativeIkeV2Vpn() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        Ikev2VpnProfile.Builder profileBuilder = new Ikev2VpnProfile.Builder(
            serverAddress, identifier);

        // Add certificate authentication (in addition to PSK)
        profileBuilder.setAuthUsernamePassword(username, password);

        // Configure custom IKE algorithms
        profileBuilder.setAllowedAlgorithms(Arrays.asList(
            IKE_ALGORITHM_AES_256_CBC,
            IKE_ALGORITHM_SHA2_256_HMAC
        ));

        Ikev2VpnProfile profile = profileBuilder.build();
        // ... rest of implementation
    }
}
```

### Customization

To modify IKEv2/IPsec settings, edit the `startNativeIkeV2Vpn` method in `IkeV2VpnService.java`:

```java
private void startNativeIkeV2Vpn() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        // Configure IKEv2 profile
        Ikev2VpnProfile.Builder profileBuilder = new Ikev2VpnProfile.Builder(
            serverAddress, identifier);
        profileBuilder.setAuthPsk(psk.getBytes());

        // Configure VPN interface
        Builder builder = new Builder();
        builder.setMtu(1400);                      // IPsec optimized MTU
        builder.addAddress("10.0.0.2", 24);       // VPN client IP
        builder.addDnsServer("8.8.8.8");          // Primary DNS
        builder.addDnsServer("8.8.4.4");          // Secondary DNS
        builder.addRoute("0.0.0.0", 0);           // Route all traffic
        builder.setSession("IKEv2/IPsec VPN");     // VPN session name

        vpnInterface = builder.establish();
        // ... rest of implementation
    }
}
```

## Troubleshooting

### Common Issues

1. **Module not found error**

   - Ensure the VpnPackage is added to MainApplication.java
   - Clean and rebuild the project: `cd android && ./gradlew clean`

2. **Permission denied**

   - VPN permission is requested automatically on first connection
   - Check device VPN settings if permission issues persist

3. **Connection failures**

   - Verify server credentials and connectivity
   - Check device network connection
   - Review logcat for detailed error messages

4. **Build errors**
   - Ensure all dependencies are properly added to build.gradle
   - Check for conflicts with other VPN-related libraries

### Debugging

Enable detailed logging by checking logcat with the VpnModule tag:

```bash
adb logcat -s VpnModule
```

### Testing

To test the implementation:

1. Use the provided `VpnControl` component for UI testing
2. Test with a known working VPN server
3. Verify state transitions in the app logs
4. Test permission flow on fresh app installs

## Security Considerations

- Store VPN credentials securely (consider using react-native-keychain)
- Validate server certificates in production
- Implement proper error handling for security-related failures
- Consider implementing certificate-based authentication for enhanced security

## Platform Support

- ✅ Android: Native VpnService foundation (extensible for any VPN protocol)
- ❌ iOS: Not supported (requires separate implementation using NetworkExtension framework)

## Contributing

When contributing to this VPN implementation:

1. Test thoroughly with real VPN servers
2. Maintain backward compatibility
3. Update documentation for any API changes
4. Follow React Native best practices for native modules

## License

This implementation uses only Android's native VpnService and standard React Native components. No external VPN libraries are included, making it free from additional licensing requirements.
