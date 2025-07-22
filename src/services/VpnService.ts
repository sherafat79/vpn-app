import {
  NativeModules,
  NativeEventEmitter,
  EmitterSubscription,
} from 'react-native';

const {VpnModule} = NativeModules;

if (!VpnModule) {
  throw new Error(
    'VpnModule is not available. Make sure the native module is properly linked.',
  );
}

export interface VpnConfig {
  server: string;
  identifier: string; // IPsec identifier
  psk: string; // Pre-shared key
}

export interface VpnState {
  state: 'DISABLED' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING';
  error?: string;
}

export type VpnStateListener = (state: VpnState) => void;

class VpnService {
  private eventEmitter: NativeEventEmitter;
  private stateSubscription: EmitterSubscription | null = null;
  private listeners: VpnStateListener[] = [];

  constructor() {
    this.eventEmitter = new NativeEventEmitter(VpnModule);
  }

  /**
   * Connect to VPN with the provided configuration
   */
  async connect(config: VpnConfig): Promise<string> {
    try {
      const result = await VpnModule.connectToVpn(
        config.server,
        config.identifier,
        config.psk,
      );
      return result;
    } catch (error) {
      throw new Error(`VPN connection failed: ${error}`);
    }
  }

  /**
   * Disconnect from VPN
   */
  async disconnect(): Promise<string> {
    try {
      const result = await VpnModule.disconnectVpn();
      return result;
    } catch (error) {
      throw new Error(`VPN disconnection failed: ${error}`);
    }
  }

  /**
   * Force disconnect from VPN (use if normal disconnect fails)
   */
  async forceDisconnect(): Promise<string> {
    try {
      const result = await VpnModule.forceDisconnectVpn();
      return result;
    } catch (error) {
      throw new Error(`VPN force disconnection failed: ${error}`);
    }
  }

  /**
   * Get current VPN state
   */
  async getState(): Promise<VpnState> {
    try {
      const result = await VpnModule.getVpnState();
      return {
        state: result.state.replace('VPN_STATE_', '') as VpnState['state'],
        error: result.error,
      };
    } catch (error) {
      throw new Error(`Failed to get VPN state: ${error}`);
    }
  }

  /**
   * Check if VPN permission is granted
   */
  async checkPermission(): Promise<boolean> {
    try {
      return await VpnModule.checkVpnPermission();
    } catch (error) {
      throw new Error(`Failed to check VPN permission: ${error}`);
    }
  }

  /**
   * Add a listener for VPN state changes
   */
  addStateListener(listener: VpnStateListener): () => void {
    this.listeners.push(listener);

    // Subscribe to native events if this is the first listener
    if (this.listeners.length === 1 && !this.stateSubscription) {
      this.stateSubscription = this.eventEmitter.addListener(
        'VpnStateChanged',
        (event: {state: string; error?: string}) => {
          const state: VpnState = {
            state: event.state.replace('VPN_STATE_', '') as VpnState['state'],
            error: event.error,
          };

          this.listeners.forEach(listener => listener(state));
        },
      );
    }

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }

      // Unsubscribe from native events if no listeners remain
      if (this.listeners.length === 0 && this.stateSubscription) {
        this.stateSubscription.remove();
        this.stateSubscription = null;
      }
    };
  }

  /**
   * Remove all listeners and clean up
   */
  cleanup(): void {
    this.listeners = [];
    if (this.stateSubscription) {
      this.stateSubscription.remove();
      this.stateSubscription = null;
    }
  }

  /**
   * Get VPN constants
   */
  get constants() {
    return {
      VPN_STATE_DISABLED: VpnModule.VPN_STATE_DISABLED,
      VPN_STATE_CONNECTING: VpnModule.VPN_STATE_CONNECTING,
      VPN_STATE_CONNECTED: VpnModule.VPN_STATE_CONNECTED,
      VPN_STATE_DISCONNECTING: VpnModule.VPN_STATE_DISCONNECTING,
    };
  }
}

// Export singleton instance
export const vpnService = new VpnService();
export default vpnService;
