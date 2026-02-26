 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useAuth } from '@/contexts/AuthContext';
 import { 
   Bell, 
   Calendar, 
   FileText, 
   CreditCard, 
   AlertCircle, 
   User, 
   Check,
   ArrowLeft,
   type LucideIcon 
 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface Notification {
   id: number;
   title: string;
   message: string;
   time: string;
   read: boolean;
   icon: LucideIcon;
   category: 'system' | 'appointment' | 'lab' | 'billing' | 'alert';
 }
 
 export default function Notifications() {
   const { user } = useAuth();
   const navigate = useNavigate();
   const [readNotifications, setReadNotifications] = useState<number[]>([]);
   const [activeTab, setActiveTab] = useState('all');
 
   // Generate notifications based on user role
   const getNotifications = (): Notification[] => {
     const baseNotifications: Notification[] = [
       { id: 1, title: 'System Update', message: 'Medicare HMS was updated to v2.1 with new features and improvements.', time: '2 hours ago', read: false, icon: AlertCircle, category: 'system' },
       { id: 10, title: 'Scheduled Maintenance', message: 'System maintenance scheduled for Sunday 2:00 AM - 4:00 AM.', time: '1 day ago', read: true, icon: AlertCircle, category: 'system' },
     ];
     
     const roleNotifications: Record<string, Notification[]> = {
       doctor: [
         { id: 2, title: 'New Appointment', message: 'Patient John Doe scheduled an appointment for 3:00 PM today.', time: '30 min ago', read: false, icon: Calendar, category: 'appointment' },
         { id: 3, title: 'Lab Results Ready', message: 'CBC report for Sarah Smith is ready for review.', time: '1 hour ago', read: false, icon: FileText, category: 'lab' },
         { id: 4, title: 'Appointment Cancelled', message: 'Patient Mary Johnson cancelled their 4:00 PM appointment.', time: '2 hours ago', read: true, icon: Calendar, category: 'appointment' },
         { id: 5, title: 'New Lab Request', message: 'You have a new lab test request pending approval.', time: '3 hours ago', read: true, icon: FileText, category: 'lab' },
       ],
       nurse: [
         { id: 2, title: 'Vitals Due', message: 'Patient in Room 204 needs vitals check in 15 minutes.', time: '15 min ago', read: false, icon: AlertCircle, category: 'alert' },
         { id: 3, title: 'Medication Alert', message: 'Medication due for patient James Williams in Room 301.', time: '30 min ago', read: false, icon: AlertCircle, category: 'alert' },
         { id: 4, title: 'New Admission', message: 'New patient admitted to General Ward A, Bed A-105.', time: '1 hour ago', read: true, icon: User, category: 'alert' },
       ],
       patient: [
         { id: 2, title: 'Appointment Reminder', message: 'Your appointment with Dr. Michael Chen is tomorrow at 10:00 AM.', time: '1 hour ago', read: false, icon: Calendar, category: 'appointment' },
         { id: 3, title: 'Lab Results Available', message: 'Your blood test results are now available for viewing.', time: '3 hours ago', read: false, icon: FileText, category: 'lab' },
         { id: 4, title: 'Prescription Ready', message: 'Your prescription is ready for pickup at the pharmacy.', time: '5 hours ago', read: true, icon: FileText, category: 'lab' },
         { id: 5, title: 'Bill Payment Reminder', message: 'You have a pending bill of $253.00. Please make payment.', time: '1 day ago', read: true, icon: CreditCard, category: 'billing' },
       ],
       reception: [
         { id: 2, title: 'Walk-in Patient', message: 'New walk-in patient waiting for registration at the front desk.', time: '5 min ago', read: false, icon: User, category: 'alert' },
         { id: 3, title: 'Appointment Rescheduled', message: 'Patient requested reschedule for appointment #APT-456.', time: '30 min ago', read: false, icon: Calendar, category: 'appointment' },
       ],
       pharmacy: [
         { id: 2, title: 'Low Stock Alert', message: 'Paracetamol 500mg stock is running low (45 units remaining).', time: '1 hour ago', read: false, icon: AlertCircle, category: 'alert' },
         { id: 3, title: 'New Prescription', message: 'New prescription received from Dr. Michael Chen for dispensing.', time: '2 hours ago', read: false, icon: FileText, category: 'lab' },
         { id: 4, title: 'Expiry Alert', message: 'Metformin 850mg batch MET-2024-003 expires in 60 days.', time: '1 day ago', read: true, icon: AlertCircle, category: 'alert' },
       ],
       laboratory: [
         { id: 2, title: 'Pending Samples', message: '8 samples awaiting collection from various departments.', time: '15 min ago', read: false, icon: FileText, category: 'lab' },
         { id: 3, title: 'Urgent Test Request', message: 'STAT blood culture requested for ICU patient.', time: '30 min ago', read: false, icon: AlertCircle, category: 'alert' },
         { id: 4, title: 'Equipment Calibration', message: 'Hematology analyzer due for weekly calibration.', time: '2 hours ago', read: true, icon: AlertCircle, category: 'system' },
       ],
       billing: [
         { id: 2, title: 'Payment Received', message: 'Payment of $500 received for Invoice INV-089.', time: '30 min ago', read: false, icon: CreditCard, category: 'billing' },
         { id: 3, title: 'Insurance Claim Approved', message: 'Insurance claim for patient John Smith has been approved.', time: '1 hour ago', read: false, icon: CreditCard, category: 'billing' },
         { id: 4, title: 'Overdue Invoice', message: 'Invoice INV-076 is 15 days overdue. Follow-up required.', time: '3 hours ago', read: true, icon: AlertCircle, category: 'billing' },
       ],
       admin: [
         { id: 2, title: 'New Staff Request', message: 'Leave request from Dr. Johnson pending approval.', time: '1 hour ago', read: false, icon: User, category: 'alert' },
         { id: 3, title: 'Department Report', message: 'Monthly department performance report is ready.', time: '2 hours ago', read: false, icon: FileText, category: 'lab' },
         { id: 4, title: 'New User Registration', message: 'New staff member Dr. Smith registered in the system.', time: '1 day ago', read: true, icon: User, category: 'system' },
       ],
     };
     
     return [...(roleNotifications[user?.role || ''] || []), ...baseNotifications];
   };
 
   const notifications = getNotifications();
 
   const isRead = (notification: Notification) => {
     return notification.read || readNotifications.includes(notification.id);
   };
 
   const markAsRead = (id: number) => {
     if (!readNotifications.includes(id)) {
       setReadNotifications(prev => [...prev, id]);
     }
   };
 
   const markAllAsRead = () => {
     setReadNotifications(notifications.map(n => n.id));
   };
 
   const unreadCount = notifications.filter(n => !isRead(n)).length;
 
   const filteredNotifications = activeTab === 'all' 
     ? notifications 
     : activeTab === 'unread' 
       ? notifications.filter(n => !isRead(n))
       : notifications.filter(n => n.category === activeTab);
 
   const getCategoryIcon = (category: string) => {
     switch (category) {
       case 'appointment': return Calendar;
       case 'lab': return FileText;
       case 'billing': return CreditCard;
       case 'alert': return AlertCircle;
       default: return Bell;
     }
   };
 
   return (
     <div className="min-h-screen bg-background p-4 lg:p-6">
       <div className="max-w-4xl mx-auto space-y-6">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
               <ArrowLeft className="h-5 w-5" />
             </Button>
             <div>
               <h1 className="text-2xl font-bold flex items-center gap-2">
                 <Bell className="h-6 w-6" />
                 Notifications
               </h1>
               <p className="text-muted-foreground">
                 {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
               </p>
             </div>
           </div>
           {unreadCount > 0 && (
             <Button variant="outline" onClick={markAllAsRead}>
               <Check className="h-4 w-4 mr-2" />
               Mark all as read
             </Button>
           )}
         </div>
 
         <Tabs value={activeTab} onValueChange={setActiveTab}>
           <TabsList className="grid w-full grid-cols-5">
             <TabsTrigger value="all">All</TabsTrigger>
             <TabsTrigger value="unread">
               Unread {unreadCount > 0 && <Badge className="ml-1 h-5 w-5 p-0 text-xs">{unreadCount}</Badge>}
             </TabsTrigger>
             <TabsTrigger value="appointment">Appointments</TabsTrigger>
             <TabsTrigger value="alert">Alerts</TabsTrigger>
             <TabsTrigger value="system">System</TabsTrigger>
           </TabsList>
 
           <TabsContent value={activeTab} className="mt-4">
             <Card>
               <CardContent className="p-0">
                 {filteredNotifications.length > 0 ? (
                   <div className="divide-y">
                     {filteredNotifications.map((notification) => {
                       const Icon = notification.icon;
                       const notifRead = isRead(notification);
                       return (
                         <div 
                           key={notification.id} 
                           className={cn(
                             "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                             !notifRead && "bg-primary/5"
                           )}
                           onClick={() => markAsRead(notification.id)}
                         >
                           <div className="flex gap-4">
                             <div className={cn(
                               "p-3 rounded-lg shrink-0",
                               !notifRead ? "bg-primary/10" : "bg-muted"
                             )}>
                               <Icon className={cn("h-5 w-5", !notifRead ? "text-primary" : "text-muted-foreground")} />
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex items-start justify-between gap-2">
                                 <div>
                                   <p className={cn("font-medium", !notifRead && "text-primary")}>
                                     {notification.title}
                                   </p>
                                   <p className="text-sm text-muted-foreground mt-1">
                                     {notification.message}
                                   </p>
                                 </div>
                                 {!notifRead && (
                                   <Badge variant="default" className="h-2 w-2 p-0 rounded-full shrink-0" />
                                 )}
                               </div>
                               <div className="flex items-center gap-2 mt-2">
                                 <Badge variant="outline" className="text-xs capitalize">{notification.category}</Badge>
                                 <span className="text-xs text-muted-foreground">{notification.time}</span>
                               </div>
                             </div>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <div className="p-8 text-center">
                     <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                     <p className="text-muted-foreground">No notifications in this category</p>
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>
         </Tabs>
       </div>
     </div>
   );
 }