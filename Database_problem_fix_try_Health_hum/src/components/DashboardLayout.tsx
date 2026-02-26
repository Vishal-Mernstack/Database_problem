import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import medicareLogo from '@/assets/medicare-logo.png';
import {
  Menu,
  X,
  LogOut,
  User,
  Bell,
  ChevronDown,
  Calendar,
  FileText,
  CreditCard,
  AlertCircle,
  Check,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
}

export function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<number[]>([]);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mock notifications based on user role
  const getNotifications = () => {
    const baseNotifications = [
      { id: 1, title: 'System Update', message: 'Medicare HMS was updated to v2.1', time: '2 hours ago', read: false, icon: AlertCircle },
    ];
    
    const roleNotifications: Record<string, { id: number; title: string; message: string; time: string; read: boolean; icon: LucideIcon }[]> = {
      doctor: [
        { id: 2, title: 'New Appointment', message: 'Patient John Doe scheduled for 3:00 PM', time: '30 min ago', read: false, icon: Calendar },
        { id: 3, title: 'Lab Results Ready', message: 'CBC report for Sarah Smith is ready', time: '1 hour ago', read: false, icon: FileText },
      ],
      nurse: [
        { id: 2, title: 'Vitals Due', message: 'Patient in Room 204 needs vitals check', time: '15 min ago', read: false, icon: AlertCircle },
      ],
      patient: [
        { id: 2, title: 'Appointment Reminder', message: 'Your appointment is tomorrow at 10:00 AM', time: '1 hour ago', read: false, icon: Calendar },
        { id: 3, title: 'Lab Results', message: 'Your blood test results are ready', time: '3 hours ago', read: false, icon: FileText },
      ],
      reception: [
        { id: 2, title: 'Walk-in Patient', message: 'New patient waiting for registration', time: '5 min ago', read: false, icon: User },
      ],
      pharmacy: [
        { id: 2, title: 'Low Stock Alert', message: 'Paracetamol stock is running low', time: '1 hour ago', read: false, icon: AlertCircle },
      ],
      laboratory: [
        { id: 2, title: 'Pending Samples', message: '8 samples awaiting collection', time: '15 min ago', read: false, icon: FileText },
      ],
      billing: [
        { id: 2, title: 'Payment Received', message: 'Payment of ₹5,000 received for INV-089', time: '30 min ago', read: false, icon: CreditCard },
      ],
      admin: [
        { id: 2, title: 'New Staff Request', message: 'Leave request from Dr. Johnson', time: '1 hour ago', read: false, icon: User },
      ],
    };
    
    return [...(roleNotifications[user?.role || ''] || []), ...baseNotifications];
  };

  const notifications = getNotifications();
  
  const markAsRead = (id: number) => {
    setReadNotifications(prev => [...prev, id]);
  };

  const markAllAsRead = () => {
    setReadNotifications(notifications.map(n => n.id));
  };

  const isRead = (notification: { id: number; read: boolean }) => {
    return notification.read || readNotifications.includes(notification.id);
  };

  const actualUnreadCount = notifications.filter(n => !isRead(n)).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <img src={medicareLogo} alt="Medicare HMS" className="h-10 object-contain" />
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {actualUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                      {actualUnreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-semibold">Notifications</h4>
                  {actualUnreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
                      <Check className="h-3 w-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-80">
                  <div className="divide-y">
                    {notifications.map((notification) => {
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
                          <div className="flex gap-3">
                            <div className={cn(
                              "p-2 rounded-lg",
                              !notifRead ? "bg-primary/10" : "bg-muted"
                            )}>
                              <Icon className={cn("h-4 w-4", !notifRead ? "text-primary" : "text-muted-foreground")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={cn("text-sm font-medium truncate", !notifRead && "text-primary")}>
                                  {notification.title}
                                </p>
                                {!notifRead && (
                                  <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
               <div className="p-2 border-t">
                   <Button variant="ghost" className="w-full text-sm" size="sm" onClick={() => { setNotificationsOpen(false); navigate('/notifications'); }}>
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    {user?.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfile}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
