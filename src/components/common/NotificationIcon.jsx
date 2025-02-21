import React, { useEffect, useState } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { notificationService } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

export const NotificationIcon = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        // Connect to WebSocket when component mounts
        notificationService.connect();

        // Subscribe to notifications
        const notificationSubscription = notificationService.getNotifications()
            .subscribe(newNotifications => {
                if (Array.isArray(newNotifications)) {
                    setNotifications(newNotifications.map(notification => ({
                        ...notification,
                        createdAt: new Date(notification.createdAt)
                    })));
                }
            });

        // Subscribe to unread count
        const unreadCountSubscription = notificationService.getUnreadCount()
            .subscribe(count => {
                setUnreadCount(typeof count === 'number' ? count : 0);
            });

        // Initial fetch of notifications and count
        fetchInitialData();

        // Cleanup subscriptions and disconnect WebSocket
        return () => {
            notificationSubscription.unsubscribe();
            unreadCountSubscription.unsubscribe();
            notificationService.disconnect();
        };
    }, []);

    const fetchInitialData = async () => {
        try {
            const [unreadResponse, countResponse] = await Promise.all([
                notificationService.getUnreadNotifications(0, 5),
                notificationService.getUnreadCountValue()
            ]);

            if (unreadResponse?.content) {
                setNotifications(unreadResponse.content.map(notification => ({
                    ...notification,
                    createdAt: new Date(notification.createdAt)
                })));
            }
            setUnreadCount(typeof countResponse === 'number' ? countResponse : 0);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch initial notification data:', error);
            setError('Unable to fetch notifications');
            setNotifications([]);
            setUnreadCount(0);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await notificationService.markAsRead(notification.id);
            }
            // Handle navigation based on notification type and reference
            handleClose();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            handleClose();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return (
        <>
            <IconButton
                onClick={handleClick}
                size="large"
                aria-label="show notifications"
                color="inherit"
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 400,
                        width: '360px',
                    },
                }}
            >
                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="h6" component="div">
                        Notifications
                    </Typography>
                </Box>
                {error ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="error">
                            {error}
                        </Typography>
                    </MenuItem>
                ) : notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            No new notifications
                        </Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                                whiteSpace: 'normal',
                                bgcolor: notification.read ? 'transparent' : 'action.hover',
                            }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="subtitle2" component="div">
                                    {notification.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {notification.message}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                )}
                {!error && unreadCount > 0 && (
                    <Box sx={{ p: 1, borderTop: '1px solid #eee' }}>
                        <MenuItem onClick={handleMarkAllRead}>
                            <Typography variant="body2" color="primary">
                                Mark all as read
                            </Typography>
                        </MenuItem>
                    </Box>
                )}
            </Menu>
        </>
    );
}; 