import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AlertType = 'pm10_high' | 'pm25_high' | 'co2_high' | 'temperature_high' | 'humidity_high' | 'aqi_warning';

interface UserAlert {
  id: string;
  alert_type: AlertType;
  threshold_value: number;
  is_enabled: boolean;
}

interface AlertLog {
  id: string;
  alert_type: AlertType;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ALERT_LABELS: Record<AlertType, string> = {
  pm10_high: 'PM10 High',
  pm25_high: 'PM2.5 High',
  co2_high: 'CO2 High',
  temperature_high: 'Temperature High',
  humidity_high: 'Humidity High',
  aqi_warning: 'AQI Warning'
};

export function AlertsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlertType, setNewAlertType] = useState<AlertType>('pm25_high');
  const [newThreshold, setNewThreshold] = useState('');

  useEffect(() => {
    if (user) {
      fetchAlerts();
      fetchLogs();
      subscribeToAlerts();
    }
  }, [user]);

  const subscribeToAlerts = () => {
    const channel = supabase
      .channel('alert-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alert_logs',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          const newLog = payload.new as AlertLog;
          setLogs(prev => [newLog, ...prev]);
          
          toast({
            title: ALERT_LABELS[newLog.alert_type],
            description: newLog.message,
            variant: 'destructive'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const toggleAlert = async (alertId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .update({ is_enabled: !currentState })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, is_enabled: !currentState } : alert
        )
      );

      toast({
        title: 'Success',
        description: `Alert ${!currentState ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update alert',
        variant: 'destructive'
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast({
        title: 'Success',
        description: 'Alert deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete alert',
        variant: 'destructive'
      });
    }
  };

  const createAlert = async () => {
    if (!newThreshold || isNaN(Number(newThreshold))) {
      toast({
        title: 'Error',
        description: 'Please enter a valid threshold value',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .insert({
          user_id: user?.id,
          alert_type: newAlertType,
          threshold_value: Number(newThreshold),
          is_enabled: true
        })
        .select()
        .single();

      if (error) throw error;

      setAlerts(prev => [...prev, data]);
      setNewThreshold('');
      toast({
        title: 'Success',
        description: 'Alert created successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create alert',
        variant: 'destructive'
      });
    }
  };

  const markAsRead = async (logId: string) => {
    try {
      await supabase
        .from('alert_logs')
        .update({ is_read: true })
        .eq('id', logId);

      setLogs(prev =>
        prev.map(log =>
          log.id === logId ? { ...log, is_read: true } : log
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Please sign in to manage alerts</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Alert Configuration */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alert Settings
          </h3>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Alert Type</Label>
                  <Select value={newAlertType} onValueChange={(value) => setNewAlertType(value as AlertType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ALERT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Threshold Value</Label>
                  <Input
                    type="number"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    placeholder="Enter threshold value"
                  />
                </div>
                <Button onClick={createAlert} className="w-full">Create Alert</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No alerts configured</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{ALERT_LABELS[alert.alert_type]}</p>
                  <p className="text-sm text-muted-foreground">
                    Threshold: {alert.threshold_value}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={alert.is_enabled}
                    onCheckedChange={() => toggleAlert(alert.id, alert.is_enabled)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Alert History */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <BellOff className="w-5 h-5" />
          Alert History
        </h3>

        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No alert history</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`p-4 border border-border rounded-lg transition-colors cursor-pointer ${
                  log.is_read ? 'bg-muted/30' : 'bg-destructive/10 hover:bg-destructive/20'
                }`}
                onClick={() => !log.is_read && markAsRead(log.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={log.is_read ? 'secondary' : 'destructive'}>
                        {ALERT_LABELS[log.alert_type]}
                      </Badge>
                      {!log.is_read && (
                        <Badge variant="default">New</Badge>
                      )}
                    </div>
                    <p className="text-sm">{log.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}