import '../utils/global-polyfill';
import { api } from './api';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';

const notificationSubject = new BehaviorSubject([]);
const unreadCountSubject = new BehaviorSubject(0);
let stompClient = null;

// Get the WebSocket URL from environment variables
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const connectWebSocket = () => {
    try {
        console.log('Initializing WebSocket connection...');
        
        // Create SockJS instance with full URL
        const socket = new SockJS(`${API_URL}/ws`, null, {
            transports: ['websocket', 'xhr-streaming', 'xhr-polling']
        });
        
        // Create STOMP client
        stompClient = Stomp.over(function() {
            return socket;
        });
        
        // Configure STOMP client
        stompClient.reconnect_delay = 5000;
        stompClient.heartbeat.outgoing = 20000;
        stompClient.heartbeat.incoming = 20000;
        
        // Disable debug logging in production
        if (import.meta.env.PROD) {
            stompClient.debug = () => {};
        } else {
            stompClient.debug = (str) => {
                console.log('STOMP: ' + str);
            };
        }

        // Connect to the WebSocket server
        stompClient.connect({}, 
            // Success callback
            () => {
                console.log('WebSocket connection established successfully');
                // Subscribe to notifications
                stompClient.subscribe('/user/queue/notifications', handleNewNotification);
            },
            // Error callback
            (error) => {
                console.error('WebSocket connection error:', error);
                // Attempt to reconnect after delay
                setTimeout(connectWebSocket, 5000);
            }
        );
    } catch (error) {
        console.error('Error initializing WebSocket:', error);
        // Attempt to reconnect after delay
        setTimeout(connectWebSocket, 5000);
    }
};

const handleError = () => {
    console.error('WebSocket connection failed');
    // Attempt to reconnect after 5 seconds
    setTimeout(() => {
        if (!stompClient?.connected) {
            console.log('Attempting to reconnect...');
            connectWebSocket();
        }
    }, 5000);
};

const handleNewNotification = (notification) => {
    if (notification && typeof notification === 'object') {
        const currentNotifications = notificationSubject.getValue();
        notificationSubject.next([notification, ...currentNotifications]);
        unreadCountSubject.next(unreadCountSubject.getValue() + 1);
    }
};

const disconnectWebSocket = () => {
    if (stompClient) {
        try {
            stompClient.disconnect(() => {
                console.log('WebSocket disconnected');
            });
        } catch (error) {
            console.error('Error disconnecting WebSocket:', error);
        }
    }
};

export const notificationService = {
    connect: () => {
        connectWebSocket();
    },

    disconnect: () => {
        disconnectWebSocket();
    },

    getNotifications: () => notificationSubject.asObservable(),
    
    getUnreadCount: () => unreadCountSubject.asObservable(),

    getAll: async (page = 0, size = 10, sort = 'createdAt,desc') => {
        try {
            const response = await api.get('/notifications', {
                params: { page, size, sort }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all notifications:', error);
            return { content: [], totalElements: 0, totalPages: 0 };
        }
    },

    getUnreadNotifications: async (page = 0, size = 10, sort = 'createdAt,desc') => {
        try {
            const response = await api.get('/notifications/unread', {
                params: { page, size, sort }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            return { content: [], totalElements: 0, totalPages: 0 };
        }
    },

    getUnreadCountValue: async () => {
        try {
            const response = await api.get('/notifications/unread/count');
            return typeof response.data === 'number' ? response.data : 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    },

    markAsRead: async (id) => {
        try {
            const response = await api.post(`/notifications/${id}/mark-read`);
            // Update local state
            const currentCount = unreadCountSubject.getValue();
            unreadCountSubject.next(Math.max(0, currentCount - 1));
            return response.data;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    markAllAsRead: async () => {
        try {
            const response = await api.post('/notifications/mark-all-read');
            // Update local state
            unreadCountSubject.next(0);
            const currentNotifications = notificationSubject.getValue();
            notificationSubject.next(currentNotifications.map(n => ({ ...n, read: true })));
            return response.data;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
}; 