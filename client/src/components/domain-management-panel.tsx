import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe, Plus, Edit, Trash2, CheckCircle, XCircle, ExternalLink, Link, Copy } from "lucide-react";

const domainSchema = z.object({
  domain: z.string().min(1, "Domain is required").regex(
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    "Please enter a valid domain name"
  ),
  vendorId: z.string().min(1, "Please select a vendor"),
  status: z.string().default("pending"),
});

export function DomainManagementPanel() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: domains = [], isLoading: domainsLoading } = useQuery({
    queryKey: ["/api/admin/custom-domains"],
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const form = useForm<z.infer<typeof domainSchema>>({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domain: "",
      vendorId: "",
      status: "pending",
    },
  });

  const createDomainMutation = useMutation({
    mutationFn: async (domainData: any) => {
      await apiRequest("POST", "/api/admin/custom-domains", {
        ...domainData,
        vendorId: parseInt(domainData.vendorId)
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Custom domain created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-domains"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create domain",
        variant: "destructive",
      });
    },
  });

  const updateDomainMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/admin/custom-domains/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Domain status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-domains"] });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/custom-domains/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Domain deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/custom-domains"] });
    },
  });

  const generateSubdomainMutation = useMutation({
    mutationFn: async (vendorId: number) => {
      await apiRequest("POST", `/api/admin/vendors/${vendorId}/generate-subdomain`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subdomain generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
    },
  });

  const filteredDomains = domains.filter((domain: any) => {
    const matchesSearch = domain.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         domain.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || domain.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onSubmit = (data: z.infer<typeof domainSchema>) => {
    createDomainMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      pending: { variant: "secondary" as const, icon: XCircle, color: "text-yellow-600" },
      inactive: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Domain copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Domain Management</h2>
          <p className="text-gray-600 mt-1">Manage custom domains and subdomains for each seller</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Custom Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="shop.example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors.map((vendor: any) => (
                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createDomainMutation.isPending}
                  >
                    {createDomainMutation.isPending ? "Creating..." : "Create Domain"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search domains or vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Domains List */}
      <div className="grid gap-4">
        {filteredDomains.map((domain: any) => (
          <Card key={domain.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Globe className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{domain.domain}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(domain.domain)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-gray-600">
                      Vendor: {domain.vendor?.name || "Unknown"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(domain.status)}
                      <Badge variant="outline">
                        Created: {new Date(domain.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Visit
                  </Button>
                  <Select
                    value={domain.status}
                    onValueChange={(status) => 
                      updateDomainMutation.mutate({ id: domain.id, status })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteDomainMutation.mutate(domain.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDomains.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No domains found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "No domains match your search criteria"
                : "Start by adding your first custom domain"
              }
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Domain
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Vendor Subdomain Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Auto-Generate Subdomains
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Generate automatic subdomains for vendors who don't have custom domains
          </p>
          <div className="space-y-2">
            {vendors.filter((vendor: any) => !vendor.domain).map((vendor: any) => (
              <div key={vendor.id} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{vendor.name}</span>
                <Button
                  size="sm"
                  onClick={() => generateSubdomainMutation.mutate(vendor.id)}
                  disabled={generateSubdomainMutation.isPending}
                >
                  Generate Subdomain
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}