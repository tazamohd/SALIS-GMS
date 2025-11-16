import { useEffect, useRef } from 'react';
import { queryClient } from '@/lib/queryClient';

interface CallCenterSession {
  id: string;
  status: string;
  [key: string]: any;
}

interface CallCenterQueue {
  id: string;
  isActive: boolean;
  [key: string]: any;
}

export function useCallCenterWebSocket(userId: string | null, garageId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId || !garageId) return;

    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/chat`;

      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log('Call Center WebSocket connected');
          
          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
          }

          wsRef.current?.send(JSON.stringify({ type: 'auth', data: {} }));
          
          setTimeout(() => {
            wsRef.current?.send(JSON.stringify({ type: 'join-call-center', data: {} }));
          }, 100);
        };

        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('Call Center WebSocket error:', error);
        };

        wsRef.current.onclose = () => {
          console.log('Call Center WebSocket disconnected');
          wsRef.current = null;
          scheduleReconnect();
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        scheduleReconnect();
      }
    };

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) return;

      reconnectTimerRef.current = setTimeout(() => {
        console.log('Reconnecting Call Center WebSocket...');
        connect();
      }, 5000);
    };

    const handleMessage = (message: { type: string; data: any }) => {
      switch (message.type) {
        case 'auth_success':
          console.log('Call Center WebSocket authenticated');
          break;
          
        case 'call-center.joined':
          console.log('Joined call-center for garage:', message.data.garageId);
          break;

        case 'call-center.session.updated':
          handleSessionUpdate(message.data.session);
          break;

        case 'call-center.queue.updated':
          handleQueueUpdate(message.data.queue);
          break;

        case 'error':
          console.error('Call Center WebSocket error:', message.data);
          break;

        default:
          break;
      }
    };

    const handleSessionUpdate = (session: CallCenterSession) => {
      queryClient.setQueryData<CallCenterSession[]>(
        ['/api/call-center/sessions'],
        (oldSessions) => {
          if (!oldSessions) return [session];
          
          const existingIndex = oldSessions.findIndex(s => s.id === session.id);
          if (existingIndex >= 0) {
            const updated = [...oldSessions];
            updated[existingIndex] = session;
            return updated;
          } else {
            return [session, ...oldSessions];
          }
        }
      );
      
      queryClient.invalidateQueries({ queryKey: ['/api/call-center/sessions'] });
    };

    const handleQueueUpdate = (queue: CallCenterQueue) => {
      queryClient.setQueryData<CallCenterQueue[]>(
        ['/api/call-center/queues'],
        (oldQueues) => {
          if (!oldQueues) return [queue];
          
          const existingIndex = oldQueues.findIndex(q => q.id === queue.id);
          if (existingIndex >= 0) {
            const updated = [...oldQueues];
            updated[existingIndex] = queue;
            return updated;
          } else {
            return [queue, ...oldQueues];
          }
        }
      );
      
      queryClient.invalidateQueries({ queryKey: ['/api/call-center/queues'] });
    };

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId, garageId]);
}
