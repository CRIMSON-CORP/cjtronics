import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const DeviceSocketContext = createContext(null);

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 2000;

export const DeviceSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);
  const isUnmounted = useRef(false);
  const listenersRef = useRef(new Set());

  const [isConnected, setIsConnected] = useState(false);
  const [onlineMap, setOnlineMap] = useState({});

  const subscribe = useCallback((listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const send = useCallback((payload) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  useEffect(() => {
    isUnmounted.current = false;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) return;

    const connect = () => {
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      socket.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (error) {
          console.error('Bad socket message', error);
          return;
        }

        if (data.event === 'device-connection' && Array.isArray(data.screens)) {
          setOnlineMap((prev) => {
            const updated = { ...prev };
            data.screens.forEach((item) => {
              if (item.deviceId) {
                updated[item.deviceId] = !!item.isOnline;
              }
            });
            return updated;
          });
        }

        // Notify all registered listeners
        listenersRef.current.forEach((listener) => {
          try {
            listener(data);
          } catch (err) {
            console.error('Error in socket listener:', err);
          }
        });
      };

      socket.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;
        if (isUnmounted.current || reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) return;
        const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
        reconnectAttempts.current += 1;
        reconnectTimeout.current = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      isUnmounted.current = true;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const isScreenOnline = useCallback(
    (deviceId, fallback = false) => {
      if (!deviceId) return false;
      if (typeof onlineMap[deviceId] === 'boolean') {
        return onlineMap[deviceId];
      }
      return !!fallback;
    },
    [onlineMap]
  );

  const sendCampaignToDevice = useCallback(
    async (deviceId, options = {}) => {
      const {
        showToast = true,
        silent = false,
        loadingMessage = 'Getting Campaign data, hold on a moment...',
        successMessage = "Campaign's data sent successfully",
      } = options;

      if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
        const msg = 'Websocket is not Connected, Please Contact Maintenance';
        if (!silent) toast.error(msg);
        return { success: false, reason: 'socket_disconnected', error: msg };
      }

      if (onlineMap[deviceId] === false) {
        const msg = 'Screen is currently offline';
        if (!silent) toast.error(msg);
        return { success: false, reason: 'screen_offline', error: msg };
      }

      const fetchAndSend = async () => {
        const response = await axios.post('/api/admin/campaigns/get-new-campaign-data', {
          reference: deviceId,
        });

        socketRef.current.send(
          JSON.stringify({
            event: 'send-to-device',
            deviceId,
            data: response.data,
          })
        );
        return response.data;
      };

      try {
        if (showToast) {
          await toast.promise(fetchAndSend(), {
            loading: loadingMessage,
            success: successMessage,
            error: (err) => err.response?.data?.message || err.message,
          });
        } else {
          await fetchAndSend();
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          reason: 'request_failed',
          error: err.response?.data?.message || err.message,
        };
      }
    },
    [onlineMap]
  );

  const sendDeviceSettings = useCallback(
    (deviceId, settings) => {
      return send({
        event: 'device-settings',
        deviceId,
        data: settings,
      });
    },
    [send]
  );

  const requestScreenshot = useCallback(
    (deviceId) => {
      return send({
        event: 'take-screenshot',
        deviceId,
      });
    },
    [send]
  );

  const toggleCampaignPause = useCallback(
    async ({ campaignId, isPaused, deviceId, options = {} }) => {
      const {
        showToast = true,
        loadingMessage = isPaused ? 'Pausing campaign...' : 'Resuming campaign...',
      } = options;

      const execute = async () => {
        // 1. Update pause state in backend
        const response = await axios.put('/api/admin/campaigns/pause', {
          campaign_id: campaignId,
          is_paused: isPaused,
        });

        // 2. If deviceId is provided and screen is online, push updated campaign data
        let sentToDevice = false;
        const online = isScreenOnline(deviceId);

        if (deviceId && online) {
          const pushResult = await sendCampaignToDevice(deviceId, {
            showToast: false,
            silent: true,
          });
          sentToDevice = pushResult.success;
        }

        let message = response.data?.message;
        if (sentToDevice) {
          message =
            response.data?.message ||
            (isPaused
              ? 'Campaign paused and sent to device'
              : 'Campaign resumed and sent to device');
        } else if (deviceId && !online) {
          message =
            (isPaused ? 'Campaign paused' : 'Campaign resumed') +
            ' (Screen is offline; will sync automatically when back online)';
        } else {
          message = response.data?.message || (isPaused ? 'Campaign paused' : 'Campaign resumed');
        }

        return {
          success: true,
          sentToDevice,
          isOnline: online,
          message,
          data: response.data,
        };
      };

      if (showToast) {
        return await toast.promise(execute(), {
          loading: loadingMessage,
          success: (res) => res.message,
          error: (err) => err.response?.data?.message || err.message,
        });
      }

      return await execute();
    },
    [isScreenOnline, sendCampaignToDevice]
  );

  const value = {
    isConnected,
    onlineMap,
    setOnlineMap,
    isScreenOnline,
    send,
    sendCampaignToDevice,
    sendDeviceSettings,
    requestScreenshot,
    toggleCampaignPause,
    subscribe,
  };

  return <DeviceSocketContext.Provider value={value}>{children}</DeviceSocketContext.Provider>;
};

export const useDeviceSocketContext = () => {
  const context = useContext(DeviceSocketContext);
  if (!context) {
    throw new Error('useDeviceSocketContext must be used within a DeviceSocketProvider');
  }
  return context;
};

export default DeviceSocketContext;
