import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AdminLayout } from "@/components/admin-layout";
import { 
  Database, 
  Server, 
  Settings, 
  HardDrive,
  Monitor,
  Cpu,
  MemoryStick,
  Network,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Shield,
  Zap,
  Globe,
  Mail,
  FileText,
  Clock,
  Bell
} from "lucide-react";

export default function AdminSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock system data
  const systemHealth = {
    status: "healthy",
    uptime: "15 days, 7 hours",
    lastRestart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    version: "2.1.4",
    environment: "production"
  };

  const systemResources = {
    cpu: { usage: 45, cores: 8, model: "Intel Xeon E5-2686 v4" },
    memory: { used: 6.2, total: 16, unit: "GB" },
    storage: { used: 245, total: 500, unit: "GB" },
    network: { incoming: 1.2, outgoing: 0.8, unit: "Mbps" }
  };

  const databaseStats = {
    status: "connected",
    size: "2.4 GB",
    tables: 15,
    connections: 12,
    maxConnections: 100,
    queries: 1847,
    slowQueries: 3
  };

  const systemConfiguration = {
    maintenance: false,
    backupEnabled: true,
    loggingLevel: "info",
    cacheEnabled: true,
    compressionEnabled: true,
    autoScaling: false,
    emailNotifications: true,
    smsNotifications: false
  };

  const backupSchedule = [
    { id: 1, type: "Full Backup", frequency: "Daily", time: "02:00 AM", retention: "30 days", status: "active" },
    { id: 2, type: "Database Backup", frequency: "Every 6 hours", time: "06:00, 12:00, 18:00, 00:00", retention: "7 days", status: "active" },
    { id: 3, type: "Config Backup", frequency: "Weekly", time: "Sunday 01:00 AM", retention: "12 weeks", status: "active" }
  ];

  const systemLogs = [
    {
      id: 1,
      level: "info",
      message: "Database backup completed successfully",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      service: "backup-service"
    },
    {
      id: 2,
      level: "warning",
      message: "High memory usage detected (85%)",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      service: "monitoring"
    },
    {
      id: 3,
      level: "error",
      message: "Failed to send email notification",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      service: "notification-service"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      warning: { variant: "secondary" as const, icon: AlertTriangle, color: "text-yellow-600" },
      error: { variant: "destructive" as const, icon: AlertTriangle, color: "text-red-600" },
      active: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      connected: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.error;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getLogLevelBadge = (level: string) => {
    const colors = {
      info: "bg-blue-100 text-blue-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level as keyof typeof colors] || colors.info}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  const triggerBackup = useMutation({
    mutationFn: async (backupType: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { backupType };
    },
    onSuccess: (data) => {
      toast({
        title: "Backup Started",
        description: `${data.backupType} backup has been initiated`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start backup",
        variant: "destructive",
      });
    },
  });

  const updateSystemSetting = useMutation({
    mutationFn: async ({ setting, value }: { setting: string; value: any }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { setting, value };
    },
    onSuccess: () => {
      toast({
        title: "Setting Updated",
        description: "System setting has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update system setting",
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-1">Monitor and configure system resources and settings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              System Report
            </Button>
            <Button className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Status
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <div className="mt-2">{getStatusBadge(systemHealth.status)}</div>
                </div>
                <Monitor className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-lg font-bold text-gray-900">{systemHealth.uptime}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Version</p>
                  <p className="text-lg font-bold text-gray-900">v{systemHealth.version}</p>
                </div>
                <Settings className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Environment</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{systemHealth.environment}</p>
                </div>
                <Server className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
          </TabsList>

          {/* System Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resource Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cpu className="w-5 h-5 mr-2" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CPU Usage</span>
                      <span>{systemResources.cpu.usage}%</span>
                    </div>
                    <Progress value={systemResources.cpu.usage} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">{systemResources.cpu.model} ({systemResources.cpu.cores} cores)</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Memory Usage</span>
                      <span>{systemResources.memory.used}/{systemResources.memory.total} {systemResources.memory.unit}</span>
                    </div>
                    <Progress value={(systemResources.memory.used / systemResources.memory.total) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage Usage</span>
                      <span>{systemResources.storage.used}/{systemResources.storage.total} {systemResources.storage.unit}</span>
                    </div>
                    <Progress value={(systemResources.storage.used / systemResources.storage.total) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Network I/O</span>
                      <span>↓{systemResources.network.incoming} / ↑{systemResources.network.outgoing} {systemResources.network.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Database Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Database Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    {getStatusBadge(databaseStats.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Database Size</span>
                    <span className="text-sm font-medium">{databaseStats.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tables</span>
                    <span className="text-sm font-medium">{databaseStats.tables}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Connections</span>
                    <span className="text-sm font-medium">{databaseStats.connections}/{databaseStats.maxConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Queries Today</span>
                    <span className="text-sm font-medium">{databaseStats.queries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Slow Queries</span>
                    <span className="text-sm font-medium text-yellow-600">{databaseStats.slowQueries}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Enable to restrict platform access</p>
                    </div>
                    <Switch 
                      checked={systemConfiguration.maintenance} 
                      onCheckedChange={(checked) => updateSystemSetting.mutate({ setting: 'maintenance', value: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatic Backups</p>
                      <p className="text-sm text-gray-600">Enable scheduled backups</p>
                    </div>
                    <Switch 
                      checked={systemConfiguration.backupEnabled} 
                      onCheckedChange={(checked) => updateSystemSetting.mutate({ setting: 'backupEnabled', value: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cache System</p>
                      <p className="text-sm text-gray-600">Enable application caching</p>
                    </div>
                    <Switch 
                      checked={systemConfiguration.cacheEnabled} 
                      onCheckedChange={(checked) => updateSystemSetting.mutate({ setting: 'cacheEnabled', value: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Compression</p>
                      <p className="text-sm text-gray-600">Compress data for storage optimization</p>
                    </div>
                    <Switch 
                      checked={systemConfiguration.compressionEnabled} 
                      onCheckedChange={(checked) => updateSystemSetting.mutate({ setting: 'compressionEnabled', value: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send alerts via email</p>
                    </div>
                    <Switch 
                      checked={systemConfiguration.emailNotifications} 
                      onCheckedChange={(checked) => updateSystemSetting.mutate({ setting: 'emailNotifications', value: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-600">Send critical alerts via SMS</p>
                    </div>
                    <Switch 
                      checked={systemConfiguration.smsNotifications} 
                      onCheckedChange={(checked) => updateSystemSetting.mutate({ setting: 'smsNotifications', value: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto Scaling</p>
                      <p className="text-sm text-gray-600">Automatically scale resources</p>
                    </div>
                    <Switch 
                      checked={systemConfiguration.autoScaling} 
                      onCheckedChange={(checked) => updateSystemSetting.mutate({ setting: 'autoScaling', value: checked })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Logging Level</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={systemConfiguration.loggingLevel}
                      onChange={(e) => updateSystemSetting.mutate({ setting: 'loggingLevel', value: e.target.value })}
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backup & Recovery Tab */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {backupSchedule.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{backup.type}</h4>
                        <p className="text-sm text-gray-600">{backup.frequency} at {backup.time}</p>
                        <p className="text-xs text-gray-500">Retention: {backup.retention}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(backup.status)}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => triggerBackup.mutate(backup.type)}
                          disabled={triggerBackup.isPending}
                        >
                          {triggerBackup.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Run Now"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getLogLevelBadge(log.level)}
                          <span className="text-xs text-gray-500">{log.service}</span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{log.timestamp.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}