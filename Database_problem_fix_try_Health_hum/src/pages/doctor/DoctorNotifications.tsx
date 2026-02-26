import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { Bell, FlaskConical, Calendar, AlertCircle, CheckCircle, Clock, Trash2, Check, Filter } from 'lucide-react';

interface Notification {
  id: string;
  type: 'lab-result' | 'appointment' | 'alert' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'normal' | 'high' | 'critical';
  relatedId?: string;
}

const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'lab-result',
    title: 'Lab Results Ready',
    message: 'Complete Blood Count results for John Smith are now available for review.',
    time: '2024-03-15T10:30:00',
    read: false,
    priority: 'normal',
    relatedId: 'lab-1',
  },
  {
    id: 'notif-2',
    type: 'alert',
    title: 'Critical Lab Result',
    message: 'URGENT: Abnormal glucose levels detected in Mary Johnson\'s test results. Immediate review required.',
    time: '2024-03-15T09:15:00',
    read: false,
    priority: 'critical',
    relatedId: 'lab-2',
  },
  {
    id: 'notif-3',
    type: 'appointment',
    title: 'New Appointment Scheduled',
    message: 'New appointment with James Williams scheduled for tomorrow at 2:00 PM.',
    time: '2024-03-15T08:00:00',
    read: false,
    priority: 'normal',
    relatedId: 'apt-1',
  },
  {
    id: 'notif-4',
    type: 'appointment',
    title: 'Appointment Cancelled',
    message: 'Robert Brown has cancelled their appointment for March 16th.',
    time: '2024-03-14T16:45:00',
    read: true,
    priority: 'normal',
    relatedId: 'apt-2',
  },
  {
    id: 'notif-5',
    type: 'lab-result',
    title: 'Lipid Panel Results',
    message: 'Lipid panel results for Sarah Davis are ready. LDL levels slightly elevated.',
    time: '2024-03-14T14:20:00',
    read: true,
    priority: 'high',
    relatedId: 'lab-3',
  },
  {
    id: 'notif-6',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled system maintenance tonight from 2:00 AM to 4:00 AM.',
    time: '2024-03-14T12:00:00',
    read: true,
    priority: 'normal',
  },
  {
    id: 'notif-7',
    type: 'alert',
    title: 'Follow-up Reminder',
    message: 'Patient Emily Wilson is due for a follow-up appointment. Last visit was 3 months ago.',
    time: '2024-03-14T10:30:00',
    read: false,
    priority: 'high',
  },
];

export function DoctorNotifications() {
  const { data: notifications, setData, updateItem, deleteItem } = useLocalStorage<Notification>('doctorNotifications', initialNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length;

  const markAsRead = (id: string) => {
    updateItem(id, { read: true });
  };

  const markAllAsRead = () => {
    setData(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    deleteItem(id);
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setData([]);
    toast.success('All notifications cleared');
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'lab-result':
        return <FlaskConical className="h-5 w-5" />;
      case 'appointment':
        return <Calendar className="h-5 w-5" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffHrs < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </h2>
          <p className="text-muted-foreground">Stay updated with lab results, appointments, and alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={notifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {criticalCount > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="font-medium text-destructive">
              You have {criticalCount} critical notification(s) requiring immediate attention
            </span>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Bell className="h-4 w-4" />
            All
            {notifications.length > 0 && <Badge variant="secondary">{notifications.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            <Clock className="h-4 w-4" />
            Unread
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="lab-result" className="gap-2">
            <FlaskConical className="h-4 w-4" />
            Lab Results
          </TabsTrigger>
          <TabsTrigger value="appointment" className="gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="alert" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all ${!notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {notification.title}
                            {notification.priority === 'critical' && (
                              <Badge variant="destructive">Critical</Badge>
                            )}
                            {notification.priority === 'high' && (
                              <Badge className="bg-orange-500">High</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(notification.time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {!notification.read && (
                          <Button size="sm" variant="outline" onClick={() => markAsRead(notification.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Read
                          </Button>
                        )}
                        {notification.type === 'lab-result' && (
                          <Button size="sm" variant="secondary">View Results</Button>
                        )}
                        {notification.type === 'appointment' && (
                          <Button size="sm" variant="secondary">View Appointment</Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-1">No notifications</h3>
                  <p className="text-muted-foreground text-sm">
                    {activeTab === 'unread' 
                      ? "You're all caught up!" 
                      : `No ${activeTab === 'all' ? '' : activeTab} notifications to show`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
