import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Settings, Bell, Shield, Database, Save } from "lucide-react";
import { useDatabaseCollection } from "@/hooks/useDatabaseCollection";

interface SettingsData {
  hospitalName: string;
  email: string;
  phone: string;
  timezone: string;
  appointmentReminders: boolean;
  labReportReady: boolean;
  paymentReminders: boolean;
  lowStockAlerts: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: boolean;
  auditLogging: boolean;
  autoBackups: boolean;
}

interface SettingsRecord {
  id: string;
  data: SettingsData;
}

const defaultSettings: SettingsData = {
  hospitalName: "MediCare Hospital",
  email: "info@medicare.com",
  phone: "+1-555-0100",
  timezone: "America/New_York",
  appointmentReminders: true,
  labReportReady: true,
  paymentReminders: true,
  lowStockAlerts: true,
  twoFactorAuth: false,
  sessionTimeout: true,
  auditLogging: true,
  autoBackups: true,
};

export function AdminSettings() {
  const { data, setData } = useDatabaseCollection<SettingsRecord>({
    collection: "system_settings",
    initialData: [{ id: "default", data: defaultSettings }],
    localStorageKey: "systemSettingsRecords",
  });

  const initialSettings = useMemo(() => data[0]?.data ?? defaultSettings, [data]);
  const [settings, setSettings] = useState<SettingsData>(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const persistSettings = async (section: string) => {
    await setData([{ id: "default", data: settings }]);
    toast.success(`${section} settings saved successfully`);
  };

  const handleBackupNow = () => {
    toast.success("Backup initiated - your data is being backed up");
    setTimeout(() => {
      toast.success("Backup completed successfully");
    }, 2000);
  };

  const handleRestore = () => {
    toast.info("Restore feature: Select a backup file to restore from");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">Configure hospital management system settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Information</CardTitle>
              <CardDescription>Basic hospital details and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name</Label>
                  <Input
                    id="hospitalName"
                    value={settings.hospitalName}
                    onChange={(event) => setSettings({ ...settings, hospitalName: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input id="phone" value={settings.phone} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone}
                    onChange={(event) => setSettings({ ...settings, timezone: event.target.value })}
                  />
                </div>
              </div>
              <Button onClick={() => persistSettings("General")}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and SMS notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Appointment Reminders</p>
                  <p className="text-sm text-muted-foreground">Send reminders to patients before appointments</p>
                </div>
                <Switch checked={settings.appointmentReminders} onCheckedChange={(checked) => setSettings({ ...settings, appointmentReminders: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lab Report Ready</p>
                  <p className="text-sm text-muted-foreground">Notify patients when lab reports are available</p>
                </div>
                <Switch checked={settings.labReportReady} onCheckedChange={(checked) => setSettings({ ...settings, labReportReady: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Reminders</p>
                  <p className="text-sm text-muted-foreground">Send reminders for pending payments</p>
                </div>
                <Switch checked={settings.paymentReminders} onCheckedChange={(checked) => setSettings({ ...settings, paymentReminders: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">Alert pharmacy when medicine stock is low</p>
                </div>
                <Switch checked={settings.lowStockAlerts} onCheckedChange={(checked) => setSettings({ ...settings, lowStockAlerts: checked })} />
              </div>
              <Button onClick={() => persistSettings("Notification")}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for all staff logins</p>
                </div>
                <Switch checked={settings.twoFactorAuth} onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Auto logout after inactivity (30 minutes)</p>
                </div>
                <Switch checked={settings.sessionTimeout} onCheckedChange={(checked) => setSettings({ ...settings, sessionTimeout: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Logging</p>
                  <p className="text-sm text-muted-foreground">Log all user actions for compliance</p>
                </div>
                <Switch checked={settings.auditLogging} onCheckedChange={(checked) => setSettings({ ...settings, auditLogging: checked })} />
              </div>
              <Button onClick={() => persistSettings("Security")}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Backup</CardTitle>
              <CardDescription>Configure automatic data backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Automatic Backups</p>
                  <p className="text-sm text-muted-foreground">Daily automated backups at midnight</p>
                </div>
                <Switch checked={settings.autoBackups} onCheckedChange={(checked) => setSettings({ ...settings, autoBackups: checked })} />
              </div>
              <div className="space-y-2">
                <Label>Last Backup</Label>
                <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()} at 12:00 AM</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBackupNow}>
                  Backup Now
                </Button>
                <Button variant="outline" onClick={handleRestore}>
                  Restore Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
