package com.vpnapp.vpn;

import android.content.Context;
import android.content.Intent;
import android.net.VpnService;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class VpnModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final String TAG = "VpnModule";
    private static final int VPN_REQUEST_CODE = 1001;
    
    private ReactApplicationContext reactContext;
    private Promise connectPromise;
    private VpnConnectionConfig currentConfig;
    private String currentState = "DISABLED";

    // VPN Configuration class for IKEv2/IPsec
    private static class VpnConnectionConfig {
        String server;
        String identifier;
        String psk;
        
        VpnConnectionConfig(String server, String identifier, String psk) {
            this.server = server;
            this.identifier = identifier;
            this.psk = psk;
        }
    }

    public VpnModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        context.addActivityEventListener(this);
    }

    @NonNull
    @Override
    public String getName() {
        return "VpnModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("VPN_STATE_DISABLED", "DISABLED");
        constants.put("VPN_STATE_CONNECTING", "CONNECTING");
        constants.put("VPN_STATE_CONNECTED", "CONNECTED");
        constants.put("VPN_STATE_DISCONNECTING", "DISCONNECTING");
        return constants;
    }

    @ReactMethod
    public void connectToVpn(String server, String identifier, String psk, Promise promise) {
        try {
            Log.d(TAG, "Attempting to connect to IKEv2/IPsec VPN server: " + server);
            Log.d(TAG, "IPsec identifier: " + identifier);
            
            this.connectPromise = promise;
            this.currentConfig = new VpnConnectionConfig(server, identifier, psk);
            
            // Check if VPN permission is granted
            Intent intent = VpnService.prepare(reactContext);
            if (intent != null) {
                // VPN permission not granted, request it
                if (getCurrentActivity() != null) {
                    getCurrentActivity().startActivityForResult(intent, VPN_REQUEST_CODE);
                } else {
                    promise.reject("VPN_PERMISSION_ERROR", "Activity not available for VPN permission request");
                }
                return;
            }
            
            // Permission already granted, start VPN
            startVpnService();
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to connect to VPN", e);
            promise.reject("VPN_CONNECTION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void disconnectVpn(Promise promise) {
        try {
            Log.d(TAG, "Disconnecting from IKEv2/IPsec VPN");
            
            if ("CONNECTED".equals(currentState) || "CONNECTING".equals(currentState)) {
                updateState("DISCONNECTING");
                
                // Stop VPN service properly
                stopVpnService();
                
                // Send disconnect action to service
                Intent disconnectIntent = new Intent(reactContext, IkeV2VpnService.class);
                disconnectIntent.setAction("DISCONNECT_VPN");
                reactContext.startService(disconnectIntent);
                
                // Update state to disconnected after a short delay
                reactContext.getCurrentActivity().runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        new android.os.Handler().postDelayed(new Runnable() {
                            @Override
                            public void run() {
                                updateState("DISABLED");
                                Log.d(TAG, "IKEv2/IPsec VPN disconnected successfully");
                            }
                        }, 500);
                    }
                });
                
                promise.resolve("Disconnecting from IKEv2/IPsec VPN");
            } else {
                promise.resolve("VPN already disconnected");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to disconnect from VPN", e);
            promise.reject("VPN_DISCONNECTION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getVpnState(Promise promise) {
        try {
            WritableMap result = Arguments.createMap();
            result.putString("state", currentState);
            result.putString("error", null);
            
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("VPN_STATE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void checkVpnPermission(Promise promise) {
        try {
            Intent intent = VpnService.prepare(reactContext);
            promise.resolve(intent == null);
        } catch (Exception e) {
            promise.reject("VPN_PERMISSION_CHECK_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void forceDisconnectVpn(Promise promise) {
        try {
            Log.d(TAG, "Force disconnecting from IKEv2/IPsec VPN");
            
            // Force stop the service
            stopVpnService();
            
            // Send disconnect action
            Intent disconnectIntent = new Intent(reactContext, IkeV2VpnService.class);
            disconnectIntent.setAction("DISCONNECT_VPN");
            reactContext.startService(disconnectIntent);
            
            // Immediately update state
            updateState("DISABLED");
            
            promise.resolve("Force disconnected from IKEv2/IPsec VPN");
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to force disconnect from VPN", e);
            promise.reject("VPN_FORCE_DISCONNECTION_ERROR", e.getMessage());
        }
    }

    private void startVpnService() {
        Log.d(TAG, "Starting IKEv2/IPsec VPN service");
        Log.d(TAG, "Server: " + currentConfig.server);
        Log.d(TAG, "Identifier: " + currentConfig.identifier);
        
        updateState("CONNECTING");
        
        // Start the VPN service with IKEv2/IPsec configuration
        Intent intent = new Intent(reactContext, IkeV2VpnService.class);
        intent.putExtra("server", currentConfig.server);
        intent.putExtra("identifier", currentConfig.identifier);
        intent.putExtra("psk", currentConfig.psk);
        
        reactContext.startService(intent);
        
        // Simulate connection process
        reactContext.getCurrentActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                new android.os.Handler().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        updateState("CONNECTED");
                        if (connectPromise != null) {
                            connectPromise.resolve("IKEv2/IPsec VPN connected successfully");
                            connectPromise = null;
                        }
                    }
                }, 3000); // Simulate 3 second connection time for IKEv2
            }
        });
    }

    private void stopVpnService() {
        try {
            Log.d(TAG, "Stopping IKEv2/IPsec VPN service");
            Intent intent = new Intent(reactContext, IkeV2VpnService.class);
            boolean stopped = reactContext.stopService(intent);
            Log.d(TAG, "VPN service stop result: " + stopped);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping VPN service", e);
        }
    }

    private void updateState(String newState) {
        currentState = newState;
        sendVpnStateUpdate();
    }

    private void sendVpnStateUpdate() {
        try {
            WritableMap params = Arguments.createMap();
            params.putString("state", currentState);
            params.putString("error", null);
            
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("VpnStateChanged", params);
                
        } catch (Exception e) {
            Log.e(TAG, "Failed to send VPN state update", e);
        }
    }

    @Override
    public void onActivityResult(android.app.Activity activity, int requestCode, int resultCode, Intent data) {
        if (requestCode == VPN_REQUEST_CODE) {
            if (resultCode == android.app.Activity.RESULT_OK) {
                // VPN permission granted, proceed with connection
                if (currentConfig != null && connectPromise != null) {
                    startVpnService();
                } else {
                    if (connectPromise != null) {
                        connectPromise.resolve("VPN permission granted");
                        connectPromise = null;
                    }
                }
            } else {
                // VPN permission denied
                if (connectPromise != null) {
                    connectPromise.reject("VPN_PERMISSION_DENIED", "User denied VPN permission");
                    connectPromise = null;
                }
            }
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        // Handle new intents if needed
    }
} 