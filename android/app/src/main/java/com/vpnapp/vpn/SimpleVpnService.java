package com.vpnapp.vpn;

import android.content.Intent;
import android.net.VpnService;
import android.os.ParcelFileDescriptor;
import android.util.Log;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.DatagramChannel;

public class SimpleVpnService extends VpnService {
    private static final String TAG = "SimpleVpnService";
    private ParcelFileDescriptor vpnInterface;
    private Thread vpnThread;
    private boolean isRunning = false;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String server = intent.getStringExtra("server");
            String username = intent.getStringExtra("username");
            String password = intent.getStringExtra("password");
            String psk = intent.getStringExtra("psk");
            
            Log.d(TAG, "Starting VPN service for server: " + server);
            
            if (vpnInterface == null) {
                startVpn(server, username, password, psk);
            }
        }
        
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        stopVpn();
        super.onDestroy();
    }

    private void startVpn(String server, String username, String password, String psk) {
        try {
            // Create VPN interface
            Builder builder = new Builder();
            builder.setMtu(1500);
            builder.addAddress("10.0.0.2", 24);
            builder.addDnsServer("8.8.8.8");
            builder.addDnsServer("8.8.4.4");
            builder.addRoute("0.0.0.0", 0);
            builder.setSession("React Native VPN");
            
            vpnInterface = builder.establish();
            
            if (vpnInterface != null) {
                Log.d(TAG, "VPN interface established");
                isRunning = true;
                
                // Start VPN thread (simplified - in real implementation you'd handle actual VPN traffic)
                vpnThread = new Thread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            // This is a simplified VPN implementation
                            // In a real VPN, you would:
                            // 1. Establish connection to VPN server
                            // 2. Handle authentication
                            // 3. Route traffic through VPN tunnel
                            
                            while (isRunning && !Thread.currentThread().isInterrupted()) {
                                Thread.sleep(1000);
                                // VPN is "running" - traffic would be processed here
                            }
                        } catch (InterruptedException e) {
                            Log.d(TAG, "VPN thread interrupted");
                        } catch (Exception e) {
                            Log.e(TAG, "VPN thread error", e);
                        }
                    }
                });
                vpnThread.start();
                
            } else {
                Log.e(TAG, "Failed to establish VPN interface");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to start VPN", e);
        }
    }

    private void stopVpn() {
        Log.d(TAG, "Stopping VPN service");
        isRunning = false;
        
        if (vpnThread != null) {
            vpnThread.interrupt();
            try {
                vpnThread.join(1000);
            } catch (InterruptedException e) {
                Log.w(TAG, "Interrupted while waiting for VPN thread to stop");
            }
            vpnThread = null;
        }
        
        if (vpnInterface != null) {
            try {
                vpnInterface.close();
            } catch (IOException e) {
                Log.e(TAG, "Failed to close VPN interface", e);
            }
            vpnInterface = null;
        }
    }
} 