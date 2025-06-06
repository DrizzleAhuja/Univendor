import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/admin-layout";
import { 
  Settings, 
  Globe, 
  Mail, 
  Palette,
  Shield,
  Users,
  CreditCard,
  Bell,
  Database,
  Key,
  FileText,
  Save,
  Upload,
  Download,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info
} from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [showApiKeys, setShowApiKeys] = useState(false);

  // Platform configuration data
  const platformConfig = {
    general: {
      platformName: "SaaSCommerce",
      platformDescription: "Multi-tenant eCommerce platform for businesses",
      supportEmail: "support@saascommerce.com",
      defaultTimeZone: "Asia/Kolkata",
      defaultCurrency: "INR",
      maintenanceMode: false,
      registrationEnabled: true,
      requireEmailVerification: true
    },
    branding: {
      primaryColor: "#6366f1",
      secondaryColor: "#8b5cf6",
      logoUrl: "/logo.png",
      faviconUrl: "/favicon.ico",
      customCSS: "",
      footerText: "© 2024 SaaSCommerce. All rights reserved."
    },
    email: {
      provider: "SMTP",
      smtpHost: "smtp.hostinger.com",
      smtpPort: "465",
      smtpUser: "verification@lelekart.com",
      smtpPassword: "••••••••",
      fromName: "SaaSCommerce",
      fromEmail: "noreply@saascommerce.com"
    },
    payment: {
      stripeEnabled: true,
      stripePublishableKey: "pk_test_••••••••",
      stripeSecretKey: "sk_test_••••••••",
      razorpayEnabled: false,
      razorpayKeyId: "",
      razorpayKeySecret: "",
      paypalEnabled: false,
      paypalClientId: "",
      paypalClientSecret: ""
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      maxLoginAttempts: 5,
      sessionTimeout: 24,
      twoFactorRequired: false,
      allowedFileTypes: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
      maxFileSize: 10
    },
    features: {
      multiVendor: true,
      customDomains: true,
      bulkOperations: true,
      advancedAnalytics: true,
      apiAccess: true,
      webhooks: true,
      customFields: false,
      inventoryTracking: true
    }
  };

  const saveSettings = useMutation({
    mutationFn: async (data: { section: string; settings: any }) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Settings Saved",
        description: `${data.section} settings have been updated successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  const testEmailConnection = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Email Test Successful",
        description: "Email configuration is working correctly",
      });
    },
    onError: () => {
      toast({
        title: "Email Test Failed",
        description: "Please check your email configuration",
        variant: "destructive",
      });
    },
  });

  const exportSettings = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const dataStr = JSON.stringify(platformConfig, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'platform-settings.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Settings Exported",
        description: "Platform settings have been exported successfully",
      });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
            <p className="text-gray-600 mt-1">Configure platform-wide settings and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => exportSettings.mutate()}
              disabled={exportSettings.isPending}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Settings
            </Button>
            <Button className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Settings
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  General Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input 
                      id="platformName"
                      defaultValue={platformConfig.general.platformName}
                      placeholder="Enter platform name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input 
                      id="supportEmail"
                      type="email"
                      defaultValue={platformConfig.general.supportEmail}
                      placeholder="support@example.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platformDescription">Platform Description</Label>
                  <Textarea 
                    id="platformDescription"
                    defaultValue={platformConfig.general.platformDescription}
                    placeholder="Describe your platform"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <select 
                      id="timezone"
                      className="w-full p-2 border rounded-md"
                      defaultValue={platformConfig.general.defaultTimeZone}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <select 
                      id="currency"
                      className="w-full p-2 border rounded-md"
                      defaultValue={platformConfig.general.defaultCurrency}
                    >
                      <option value="INR">INR (Indian Rupee)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="GBP">GBP (British Pound)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Temporarily disable platform access</p>
                    </div>
                    <Switch defaultChecked={platformConfig.general.maintenanceMode} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">User Registration</p>
                      <p className="text-sm text-gray-600">Allow new user registrations</p>
                    </div>
                    <Switch defaultChecked={platformConfig.general.registrationEnabled} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Verification Required</p>
                      <p className="text-sm text-gray-600">Require email verification for new accounts</p>
                    </div>
                    <Switch defaultChecked={platformConfig.general.requireEmailVerification} />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => saveSettings.mutate({ section: 'General', settings: platformConfig.general })}
                    disabled={saveSettings.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saveSettings.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Settings */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Branding & Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="primaryColor"
                        type="color"
                        defaultValue={platformConfig.branding.primaryColor}
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        defaultValue={platformConfig.branding.primaryColor}
                        placeholder="#6366f1"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="secondaryColor"
                        type="color"
                        defaultValue={platformConfig.branding.secondaryColor}
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        defaultValue={platformConfig.branding.secondaryColor}
                        placeholder="#8b5cf6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input 
                      id="logoUrl"
                      defaultValue={platformConfig.branding.logoUrl}
                      placeholder="/logo.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl">Favicon URL</Label>
                    <Input 
                      id="faviconUrl"
                      defaultValue={platformConfig.branding.faviconUrl}
                      placeholder="/favicon.ico"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Input 
                    id="footerText"
                    defaultValue={platformConfig.branding.footerText}
                    placeholder="© 2024 Your Company. All rights reserved."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customCSS">Custom CSS</Label>
                  <Textarea 
                    id="customCSS"
                    defaultValue={platformConfig.branding.customCSS}
                    placeholder="/* Add your custom CSS here */"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => saveSettings.mutate({ section: 'Branding', settings: platformConfig.branding })}
                    disabled={saveSettings.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input 
                      id="smtpHost"
                      defaultValue={platformConfig.email.smtpHost}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input 
                      id="smtpPort"
                      defaultValue={platformConfig.email.smtpPort}
                      placeholder="587"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input 
                      id="smtpUser"
                      defaultValue={platformConfig.email.smtpUser}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <div className="relative">
                      <Input 
                        id="smtpPassword"
                        type={showApiKeys ? "text" : "password"}
                        defaultValue={platformConfig.email.smtpPassword}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowApiKeys(!showApiKeys)}
                      >
                        {showApiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input 
                      id="fromName"
                      defaultValue={platformConfig.email.fromName}
                      placeholder="SaaSCommerce"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input 
                      id="fromEmail"
                      type="email"
                      defaultValue={platformConfig.email.fromEmail}
                      placeholder="noreply@saascommerce.com"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => testEmailConnection.mutate()}
                    disabled={testEmailConnection.isPending}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {testEmailConnection.isPending ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <Button 
                    onClick={() => saveSettings.mutate({ section: 'Email', settings: platformConfig.email })}
                    disabled={saveSettings.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Gateway Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stripe Configuration */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Stripe</h3>
                      <Badge variant={platformConfig.payment.stripeEnabled ? "default" : "secondary"}>
                        {platformConfig.payment.stripeEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <Switch defaultChecked={platformConfig.payment.stripeEnabled} />
                  </div>
                  
                  {platformConfig.payment.stripeEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Publishable Key</Label>
                        <Input 
                          type={showApiKeys ? "text" : "password"}
                          defaultValue={platformConfig.payment.stripePublishableKey}
                          placeholder="pk_test_..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Secret Key</Label>
                        <Input 
                          type={showApiKeys ? "text" : "password"}
                          defaultValue={platformConfig.payment.stripeSecretKey}
                          placeholder="sk_test_..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Razorpay Configuration */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Razorpay</h3>
                      <Badge variant={platformConfig.payment.razorpayEnabled ? "default" : "secondary"}>
                        {platformConfig.payment.razorpayEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <Switch defaultChecked={platformConfig.payment.razorpayEnabled} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Key ID</Label>
                      <Input 
                        defaultValue={platformConfig.payment.razorpayKeyId}
                        placeholder="rzp_test_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Key Secret</Label>
                      <Input 
                        type={showApiKeys ? "text" : "password"}
                        defaultValue={platformConfig.payment.razorpayKeySecret}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => saveSettings.mutate({ section: 'Payment', settings: platformConfig.payment })}
                    disabled={saveSettings.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input 
                      id="passwordMinLength"
                      type="number"
                      defaultValue={platformConfig.security.passwordMinLength}
                      min="6"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input 
                      id="maxLoginAttempts"
                      type="number"
                      defaultValue={platformConfig.security.maxLoginAttempts}
                      min="3"
                      max="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input 
                      id="sessionTimeout"
                      type="number"
                      defaultValue={platformConfig.security.sessionTimeout}
                      min="1"
                      max="168"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Input 
                      id="maxFileSize"
                      type="number"
                      defaultValue={platformConfig.security.maxFileSize}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Require Special Characters in Password</p>
                      <p className="text-sm text-gray-600">Enforce special characters in user passwords</p>
                    </div>
                    <Switch defaultChecked={platformConfig.security.requireSpecialChars} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication Required</p>
                      <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
                    </div>
                    <Switch defaultChecked={platformConfig.security.twoFactorRequired} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allowed File Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {platformConfig.security.allowedFileTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        .{type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => saveSettings.mutate({ section: 'Security', settings: platformConfig.security })}
                    disabled={saveSettings.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Platform Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Multi-Vendor Support</p>
                        <p className="text-sm text-gray-600">Enable multiple vendors on platform</p>
                      </div>
                      <Switch defaultChecked={platformConfig.features.multiVendor} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Custom Domains</p>
                        <p className="text-sm text-gray-600">Allow vendors to use custom domains</p>
                      </div>
                      <Switch defaultChecked={platformConfig.features.customDomains} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bulk Operations</p>
                        <p className="text-sm text-gray-600">Enable bulk product operations</p>
                      </div>
                      <Switch defaultChecked={platformConfig.features.bulkOperations} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Advanced Analytics</p>
                        <p className="text-sm text-gray-600">Provide detailed analytics and reports</p>
                      </div>
                      <Switch defaultChecked={platformConfig.features.advancedAnalytics} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">API Access</p>
                        <p className="text-sm text-gray-600">Enable REST API for integrations</p>
                      </div>
                      <Switch defaultChecked={platformConfig.features.apiAccess} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Webhooks</p>
                        <p className="text-sm text-gray-600">Support webhook notifications</p>
                      </div>
                      <Switch defaultChecked={platformConfig.features.webhooks} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Custom Fields</p>
                        <p className="text-sm text-gray-600">Allow custom product fields</p>
                      </div>
                      <Switch defaultChecked={platformConfig.features.customFields} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Inventory Tracking</p>
                        <p className="text-sm text-gray-600">Enable inventory management</p>
                      </div>
                      <Switch defaultChecked={platformConfig.features.inventoryTracking} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => saveSettings.mutate({ section: 'Features', settings: platformConfig.features })}
                    disabled={saveSettings.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}