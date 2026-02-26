import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Clock, User, Activity, Thermometer, Pill, BedDouble } from 'lucide-react';

interface Alert {
  id: string;
  type: 'vitals' | 'medication' | 'fall-risk' | 'discharge' | 'lab' | 'general';
  priority: 'critical' | 'high' | 'medium' | 'low';
  patientId: string;
  patientName: string;
  bedNumber: string;
  title: string;
  message: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

const initialAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'vitals',
    priority: 'critical',
    patientId: 'p1',
    patientName: 'John Smith',
    bedNumber: 'A-101',
    title: 'Critical Blood Pressure',
    message: 'BP reading 180/110 mmHg - exceeds threshold. Immediate assessment required.',
    createdAt: '2024-03-15T10:30:00',
    acknowledged: false,
  },
  {
    id: 'alert-2',
    type: 'medication',
    priority: 'high',
    patientId: 'p2',
    patientName: 'Mary Johnson',
    bedNumber: 'A-102',
    title: 'Missed Medication',
    message: 'Scheduled insulin dose at 07:30 was not administered. 3 hours overdue.',
    createdAt: '2024-03-15T10:30:00',
    acknowledged: false,
  },
  {
    id: 'alert-3',
    type: 'fall-risk',
    priority: 'high',
    patientId: 'p3',
    patientName: 'Robert Brown',
    bedNumber: 'B-201',
    title: 'Fall Risk Patient',
    message: 'Patient attempted to get out of bed without assistance. Bed alarm activated.',
    createdAt: '2024-03-15T09:45:00',
    acknowledged: false,
  },
  {
    id: 'alert-4',
    type: 'vitals',
    priority: 'medium',
    patientId: 'p4',
    patientName: 'Emily Davis',
    bedNumber: 'B-202',
    title: 'Elevated Temperature',
    message: 'Temperature reading 101.2°F. Monitor for signs of infection.',
    createdAt: '2024-03-15T09:15:00',
    acknowledged: false,
  },
  {
    id: 'alert-5',
    type: 'lab',
    priority: 'medium',
    patientId: 'p1',
    patientName: 'John Smith',
    bedNumber: 'A-101',
    title: 'Lab Results Ready',
    message: 'Complete blood count results are available for review.',
    createdAt: '2024-03-15T08:30:00',
    acknowledged: true,
    acknowledgedAt: '08:45',
    acknowledgedBy: 'Nurse Sarah',
  },
  {
    id: 'alert-6',
    type: 'discharge',
    priority: 'low',
    patientId: 'p5',
    patientName: 'James Wilson',
    bedNumber: 'C-301',
    title: 'Pending Discharge',
    message: 'Patient approved for discharge. Complete discharge education and paperwork.',
    createdAt: '2024-03-15T08:00:00',
    acknowledged: true,
    acknowledgedAt: '08:15',
    acknowledgedBy: 'Nurse Sarah',
  },
];

export function NurseAlerts() {
  const { data: alerts, updateItem } = useLocalStorage<Alert>('nurseAlerts', initialAlerts);
  const [activeTab, setActiveTab] = useState('active');

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged);
  const criticalAlerts = activeAlerts.filter(a => a.priority === 'critical');

  const handleAcknowledge = (id: string) => {
    updateItem(id, {
      acknowledged: true,
      acknowledgedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      acknowledgedBy: 'Current Nurse',
    });
    toast.success('Alert acknowledged');
  };

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'vitals': return <Activity className="h-5 w-5" />;
      case 'medication': return <Pill className="h-5 w-5" />;
      case 'fall-risk': return <BedDouble className="h-5 w-5" />;
      case 'discharge': return <CheckCircle className="h-5 w-5" />;
      case 'lab': return <Thermometer className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityStyles = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical':
        return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' };
      case 'high':
        return { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' };
      case 'medium':
        return { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-500' };
      case 'low':
        return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderAlertCard = (alert: Alert) => {
    const styles = getPriorityStyles(alert.priority);
    return (
      <Card key={alert.id} className={`border-l-4 ${styles.border}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${styles.bg} text-white`}>
              {getIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{alert.title}</h4>
                    <Badge variant={alert.priority === 'critical' ? 'destructive' : 'outline'} className="text-xs">
                      {alert.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(alert.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  {alert.patientName}
                </div>
                <Badge variant="outline" className="text-xs">{alert.bedNumber}</Badge>
                {!alert.acknowledged ? (
                  <Button size="sm" onClick={() => handleAcknowledge(alert.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Alerts & Notifications
            {activeAlerts.length > 0 && (
              <Badge variant="destructive">{activeAlerts.length} active</Badge>
            )}
          </h2>
          <p className="text-muted-foreground">Patient alerts requiring attention</p>
        </div>
      </div>

      {criticalAlerts.length > 0 && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
              <div>
                <p className="font-semibold text-red-700">
                  {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} Require Immediate Attention
                </p>
                <p className="text-sm text-red-600">
                  {criticalAlerts.map(a => a.patientName).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{alerts.filter(a => a.priority === 'critical' && !a.acknowledged).length}</p>
            <p className="text-sm text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{alerts.filter(a => a.priority === 'high' && !a.acknowledged).length}</p>
            <p className="text-sm text-muted-foreground">High</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{alerts.filter(a => a.priority === 'medium' && !a.acknowledged).length}</p>
            <p className="text-sm text-muted-foreground">Medium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-500">{alerts.filter(a => a.priority === 'low' && !a.acknowledged).length}</p>
            <p className="text-sm text-muted-foreground">Low</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Active
            {activeAlerts.length > 0 && <Badge variant="destructive">{activeAlerts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="acknowledged" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Acknowledged
            <Badge variant="secondary">{acknowledgedAlerts.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeAlerts.length > 0 ? (
            activeAlerts.map(renderAlertCard)
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-1">All Clear!</h3>
                <p className="text-muted-foreground text-sm">No active alerts at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="acknowledged" className="mt-6 space-y-4">
          {acknowledgedAlerts.length > 0 ? (
            acknowledgedAlerts.map(renderAlertCard)
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No acknowledged alerts
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
