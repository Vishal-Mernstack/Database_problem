import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getData } from '@/lib/mockData';
import { mockActivityLogs } from '@/lib/bloodBankData';
import { Activity } from 'lucide-react';

export default function BloodActivityLogPage() {
  const logs = getData('bloodActivityLogs', mockActivityLogs);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Activity Log</h2>
        <p className="text-muted-foreground">All blood bank operations and audit trail</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg h-fit">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{log.action}</h4>
                    <Badge variant="outline" className="text-xs">{new Date(log.timestamp).toLocaleString()}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                  <p className="text-xs text-muted-foreground mt-2">By: {log.performedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
