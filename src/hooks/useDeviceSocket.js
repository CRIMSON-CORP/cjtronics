import { useEffect, useMemo, useRef } from 'react';
import { useDeviceSocketContext } from 'src/contexts/device-socket-context';

/**
 * Universal hook to interact with screens/devices over WebSocket.
 *
 * Scopes:
 * 1. Global dashboard usage:
 *    const { sendCampaignToDevice, isScreenOnline, onlineMap, isConnected, send } = useDeviceSocket();
 *
 * 2. Device-scoped usage (100% backwards-compatible):
 *    const { isConnected, screenIsOnline, send, sendCampaignToDevice } = useDeviceSocket({
 *      deviceId,
 *      initialIsOnline,
 *      onMessage,
 *    });
 */
export default function useDeviceSocket(options = {}) {
  const { deviceId, initialIsOnline = false, onMessage } = options;
  const context = useDeviceSocketContext();
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!onMessageRef.current) return;

    const unsubscribe = context.subscribe((data) => {
      onMessageRef.current?.(data);
    });

    return unsubscribe;
  }, [context]);

  const screenIsOnline = useMemo(() => {
    if (!deviceId) return false;
    return context.isScreenOnline(deviceId, initialIsOnline);
  }, [context, deviceId, initialIsOnline]);

  return {
    ...context,
    screenIsOnline,
  };
}
