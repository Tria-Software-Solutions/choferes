export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  category: 'employee' | 'schedule' | 'vehicle' | 'system' | 'report';
  priority: 'low' | 'medium' | 'high';
}

export interface NotificationFilters {
  read?: boolean;
  type?: Notification['type'];
  category?: Notification['category'];
  priority?: Notification['priority'];
} 