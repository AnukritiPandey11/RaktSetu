import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../services/notificationContext';

interface NotificationDropdownProps {
  onNavigateTab?: (tab: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-sky-500" />;
    }
  };

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blood-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-blood-100 text-blood-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blood-600 hover:text-blood-800 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No notifications at this moment</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    markAsRead(n.id);
                    if (n.link_tab && onNavigateTab) {
                      onNavigateTab(n.link_tab);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-start gap-3 ${
                    !n.read ? 'bg-blood-50/30' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100/80">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400 ml-2 whitespace-nowrap">
                        {formatTime(n.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{n.message}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-blood-600 mt-1.5 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
