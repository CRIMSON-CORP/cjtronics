import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 2000;

/**
 * Live socket scoped to one device.
 *
 * Tracks whether we are connected and whether the device is online, so controls
 * can re-enable themselves the moment a screen comes back rather than needing a
 * page refresh. `onMessage` receives every parsed frame, after device-connection
 * has already been handled here.
 */
export default function useDeviceSocket({ deviceId, initialIsOnline = false, onMessage }) {
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);
  const unmounted = useRef(false);
  const onMessageRef = useRef(onMessage);
  const [isConnected, setIsConnected] = useState(false);
  const [screenIsOnline, setScreenIsOnline] = useState(!!initialIsOnline);

  // Held in a ref so a caller passing an inline handler doesn't tear the
  // connection down and rebuild it on every render.
  onMessageRef.current = onMessage;

  useEffect(() => {
    unmounted.current = false;

    const connect = () => {
      const socket = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URL);
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

        if (data.event === 'device-connection') {
          const thisScreen = data.screens?.find((item) => item.deviceId === deviceId);
          if (thisScreen) setScreenIsOnline(thisScreen.isOnline);
        }

        onMessageRef.current?.(data);
      };

      socket.onclose = () => {
        setIsConnected(false);
        socketRef.current = null;
        if (unmounted.current || reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) return;
        const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
        reconnectAttempts.current += 1;
        reconnectTimeout.current = setTimeout(connect, delay);
      };

      socket.onerror = () => socket.close();
    };

    connect();

    return () => {
      unmounted.current = true;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [deviceId]);

  const send = useCallback((payload) => {
    const socket = socketRef.current;
    // Instance constant, not the global: this also runs during SSR teardown.
    if (!socket || socket.readyState !== socket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  return { isConnected, screenIsOnline, send };
}
