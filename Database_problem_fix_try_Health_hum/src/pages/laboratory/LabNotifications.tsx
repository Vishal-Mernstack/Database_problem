import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Bell, AlertCircle, CheckCircle, Clock, Trash2, Check } from 'lucide-react';

interface Notification {
  id: string;
  type: 'urgent' | 'result' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function LabNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'urgent', title: 'Urgent Sample Required', message: 'Blood sample needed for patient John Smith - Critical case', time: '5 min ago', read: false },
    { id: '2', type: 'result', title: 'Result Review Pending', message: 'CBC results for Jane Doe require verification', time: '15 min ago', read: false },
    { id: '3', type: 'system', title: 'Equipment Maintenance', message: 'Scheduled maintenance for Hematology analyzer tomorrow', time: '1 hour ago', read: true },
    { id: '4', type: 'urgent', title: 'STAT Order', message: 'Emergency blood work requested for ER patient', time: '2 hours ago', read: false },
    { id: '5', type: 'result', title: 'Abnormal Result', message: 'Elevated glucose levels detected for patient Michael Brown', time: '3 hours ago', read: true },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    toast.success('Marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'result': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'system': return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'urgent': return 'destructive';
      case 'result': return 'default';
      case 'system': return 'secondary';
      default: return 'outline';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentNotifications = notifications.filter(n => n.type === 'urgent');
  const resultNotifications = notifications.filter(n => n.type === 'result');
  const systemNotifications = notifications.filter(n => n.type === 'system');

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card className={`${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">{getIcon(notification.type)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{notification.title}</h4>
              <Badge variant={getBadgeVariant(notification.type) as any}>{notification.type}</Badge>
              {!notification.read && <Badge variant="outline" className="text-xs">New</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
          </div>
          <div className="flex gap-2">
            {!notification.read && (
              <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground">Stay updated with lab activities</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {unreadCount} Unread
          </Badge>
          <Button variant="outline" onClick={markAllAsRead}>
            Mark All Read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="urgent">Urgent ({urgentNotifications.length})</TabsTrigger>
          <TabsTrigger value="result">Results ({resultNotifications.length})</TabsTrigger>
          <TabsTrigger value="system">System ({systemNotifications.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {notifications.length > 0 ? (
            notifications.map(n => <NotificationCard key={n.id} notification={n} />)
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No notifications</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4 mt-4">
          {urgentNotifications.length > 0 ? (
            urgentNotifications.map(n => <NotificationCard key={n.id} notification={n} />)
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No urgent notifications</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="result" className="space-y-4 mt-4">
          {resultNotifications.length > 0 ? (
            resultNotifications.map(n => <NotificationCard key={n.id} notification={n} />)
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No result notifications</CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4 mt-4">
          {systemNotifications.length > 0 ? (
            systemNotifications.map(n => <NotificationCard key={n.id} notification={n} />)
          ) : (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No system notifications</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
