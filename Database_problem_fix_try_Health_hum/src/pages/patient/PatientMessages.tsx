import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { mockUsers } from '@/lib/mockData';
import { toast } from 'sonner';
import { MessageSquare, Send, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Message {
  id: string;
  conversationId: string;
  sender: 'patient' | 'doctor';
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  department: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  createdAt: string;
}

const initialConversations: Conversation[] = [
  { 
    id: 'conv-1', 
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Michael Chen', 
    department: 'Cardiology', 
    lastMessage: 'Your test results look good...', 
    lastMessageTime: '2 hours ago', 
    unread: true,
    createdAt: '2024-03-10',
  },
  { 
    id: 'conv-2', 
    patientId: 'patient-1',
    doctorId: 'doctor-2',
    doctorName: 'Dr. Emily Watson', 
    department: 'Neurology', 
    lastMessage: 'Please continue the medication...', 
    lastMessageTime: '1 day ago', 
    unread: false,
    createdAt: '2024-03-08',
  },
];

const initialMessages: Message[] = [
  { 
    id: 'msg-1', 
    conversationId: 'conv-1',
    sender: 'doctor', 
    senderId: 'doctor-1',
    senderName: 'Dr. Michael Chen', 
    content: 'Hello! I have reviewed your recent lab results.', 
    timestamp: '10:30 AM',
    createdAt: '2024-03-10T10:30:00',
  },
  { 
    id: 'msg-2', 
    conversationId: 'conv-1',
    sender: 'doctor', 
    senderId: 'doctor-1',
    senderName: 'Dr. Michael Chen', 
    content: 'Your test results look good. All values are within normal range.', 
    timestamp: '10:31 AM',
    createdAt: '2024-03-10T10:31:00',
  },
  { 
    id: 'msg-3', 
    conversationId: 'conv-1',
    sender: 'patient', 
    senderId: 'patient-1',
    senderName: 'You', 
    content: 'Thank you, Doctor! That is a relief.', 
    timestamp: '10:35 AM',
    createdAt: '2024-03-10T10:35:00',
  },
  { 
    id: 'msg-4', 
    conversationId: 'conv-1',
    sender: 'doctor', 
    senderId: 'doctor-1',
    senderName: 'Dr. Michael Chen', 
    content: 'Please continue with the current medication and we will do another check-up in 3 months.', 
    timestamp: '10:36 AM',
    createdAt: '2024-03-10T10:36:00',
  },
  { 
    id: 'msg-5', 
    conversationId: 'conv-2',
    sender: 'doctor', 
    senderId: 'doctor-2',
    senderName: 'Dr. Emily Watson', 
    content: 'Please continue the medication as prescribed.', 
    timestamp: '2:00 PM',
    createdAt: '2024-03-08T14:00:00',
  },
  { 
    id: 'msg-6', 
    conversationId: 'conv-2',
    sender: 'patient', 
    senderId: 'patient-1',
    senderName: 'You', 
    content: 'Will do, thank you doctor.', 
    timestamp: '2:15 PM',
    createdAt: '2024-03-08T14:15:00',
  },
];

export default function PatientMessages() {
  const { user } = useAuth();
  const { data: conversations, addItem: addConversation, updateItem: updateConversation } = 
    useLocalStorage<Conversation>('patientConversations', initialConversations);
  const { data: messages, addItem: addMessage } = 
    useLocalStorage<Message>('patientMessages', initialMessages);
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isNewConvOpen, setIsNewConvOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  // Filter conversations for current patient
  const patientConversations = conversations.filter(c => c.patientId === user?.id);
  
  // Get messages for selected conversation
  const conversationMessages = selectedConversation 
    ? messages.filter(m => m.conversationId === selectedConversation.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  // Get available doctors
  const doctors = mockUsers.filter(u => u.role === 'doctor');

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    // Mark as read
    if (conv.unread) {
      updateConversation(conv.id, { unread: false });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message: Message = {
        id: `msg-${Date.now()}`,
        conversationId: selectedConversation.id,
        sender: 'patient',
        senderId: user?.id || '',
        senderName: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
      };
      addMessage(message);
      
      // Update conversation's last message
      updateConversation(selectedConversation.id, { 
        lastMessage: newMessage.substring(0, 50) + (newMessage.length > 50 ? '...' : ''),
        lastMessageTime: 'Just now',
      });
      
      setNewMessage('');
      toast.success('Message sent');

      // Simulate doctor reply after 2 seconds
      setTimeout(() => {
        const autoReply: Message = {
          id: `msg-${Date.now()}-reply`,
          conversationId: selectedConversation.id,
          sender: 'doctor',
          senderId: selectedConversation.doctorId,
          senderName: selectedConversation.doctorName,
          content: 'Thank you for your message. I will review it and get back to you soon.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString(),
        };
        addMessage(autoReply);
      }, 2000);
    }
  };

  const handleStartNewConversation = () => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }
    
    const doctor = doctors.find(d => d.id === selectedDoctor);
    if (!doctor) return;

    // Check if conversation already exists
    const existing = patientConversations.find(c => c.doctorId === selectedDoctor);
    if (existing) {
      setSelectedConversation(existing);
      setIsNewConvOpen(false);
      setSelectedDoctor('');
      return;
    }

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      patientId: user?.id || '',
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.department || 'General',
      lastMessage: 'New conversation started',
      lastMessageTime: 'Just now',
      unread: false,
      createdAt: new Date().toISOString(),
    };
    
    addConversation(newConv);
    setSelectedConversation(newConv);
    setIsNewConvOpen(false);
    setSelectedDoctor('');
    toast.success('Conversation started');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-muted-foreground">Communicate with your healthcare providers</p>
        </div>
        <Button onClick={() => setIsNewConvOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {patientConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a new message with a doctor</p>
                </div>
              ) : (
                patientConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted transition-colors ${selectedConversation?.id === conv.id ? 'bg-muted' : ''}`}
                    onClick={() => handleSelectConversation(conv)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{conv.doctorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold truncate">{conv.doctorName}</p>
                          {conv.unread && <Badge className="bg-primary h-2 w-2 p-0 rounded-full" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{conv.department}</p>
                        <p className="text-sm text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
                        <p className="text-xs text-muted-foreground mt-1">{conv.lastMessageTime}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{selectedConversation.doctorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedConversation.doctorName}</CardTitle>
                    <CardDescription>{selectedConversation.department}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {conversationMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.sender === 'patient'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender === 'patient' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-[500px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={isNewConvOpen} onOpenChange={setIsNewConvOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>Select a doctor to message</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map(doctor => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex flex-col">
                        <span>{doctor.name}</span>
                        <span className="text-xs text-muted-foreground">{doctor.department || 'General'}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewConvOpen(false)}>Cancel</Button>
            <Button onClick={handleStartNewConversation}>Start Conversation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
