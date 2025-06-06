import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SaaSCommerce Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The complete multi-tenant eCommerce solution for businesses. 
            Create your online store, manage products, and grow your business with our powerful platform.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg"
          >
            Get Started - Login with Email
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-primary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-store text-primary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Tenant Stores</h3>
              <p className="text-gray-600">
                Create and manage multiple storefronts with custom domains and branding.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-secondary bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-secondary text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Passwordless Auth</h3>
              <p className="text-gray-600">
                Secure email OTP authentication with role-based access control.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="bg-accent bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-line text-accent text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete eCommerce</h3>
              <p className="text-gray-600">
                Full shopping cart, checkout, order management, and analytics.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Perfect for Every Role
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-primary mb-3">Super Admin</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Manage all vendors and domains</li>
                <li>• Platform-wide analytics</li>
                <li>• Subscription management</li>
                <li>• User role control</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-secondary mb-3">Seller</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Product catalog management</li>
                <li>• Order processing</li>
                <li>• Sales analytics</li>
                <li>• Customer communication</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-accent mb-3">Buyer</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Browse multiple stores</li>
                <li>• Shopping cart & wishlist</li>
                <li>• Order tracking</li>
                <li>• Account management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
