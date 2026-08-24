import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { dbNotifications } from './db';
import { useAuth } from './authContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  sendNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refreshNotifications = () => {
    const list = dbNotifications.getByRole(user?.role);
    setNotifications(list);
  };

  useEffect(() => {
    refreshNotifications();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    dbNotifications.markAsRead(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    dbNotifications.markAllAsRead();
    refreshNotifications();
  };

  const sendNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const item: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    dbNotifications.add(item);
    refreshNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        sendNotification,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
