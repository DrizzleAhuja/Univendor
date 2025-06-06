import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart } from "@/components/shopping-cart";
import { CheckoutModal } from "@/components/checkout-modal";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dummy products data with color variants
const dummyProducts = {
  electronics: [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 199.99,
      description: "Premium noise-cancelling headphones",
      colors: [
        { name: "Black", hex: "#000000", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" },
        { name: "White", hex: "#FFFFFF", image: "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=300" },
        { name: "Rose Gold", hex: "#B76E79", image: "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=300" },
      ],
      vendor: "TechPro",
      rating: 4.5,
      reviews: 128,
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 299.99,
      description: "Advanced fitness tracking and notifications",
      colors: [
        { name: "Space Gray", hex: "#2F2F2F", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300" },
        { name: "Silver", hex: "#C0C0C0", image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=300" },
      ],
      vendor: "TechPro",
      rating: 4.8,
      reviews: 245,
    },
  ],
  fashion: [
    {
      id: 3,
      name: "Premium Cotton T-Shirt",
      price: 29.99,
      description: "Comfortable and stylish everyday wear",
      sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
      colors: [
        { name: "Navy", hex: "#000080", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300" },
        { name: "White", hex: "#FFFFFF", image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=300" },
        { name: "Gray", hex: "#808080", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300" },
        { name: "Black", hex: "#000000", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300" },
        { name: "Red", hex: "#FF0000", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300" },
        { name: "Blue", hex: "#0000FF", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300" },
      ],
      vendor: "FashionStyle",
      rating: 4.3,
      reviews: 89,
    },
    {
      id: 4,
      name: "Designer Jeans",
      price: 79.99,
      description: "Premium denim with perfect fit",
      sizes: ["28", "30", "32", "34", "36", "38"],
      colors: [
        { name: "Dark Blue", hex: "#00008B", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300" },
        { name: "Light Blue", hex: "#ADD8E6", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300" },
        { name: "Black", hex: "#000000", image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=300" },
      ],
      vendor: "FashionStyle",
      rating: 4.6,
      reviews: 156,
    },
  ],
  homeGarden: [
    {
      id: 5,
      name: "Modern Table Lamp",
      price: 89.99,
      description: "Elegant design with ambient lighting",
      colors: [
        { name: "Black", hex: "#000000", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300" },
        { name: "Gold", hex: "#FFD700", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=300" },
      ],
      vendor: "HomeDecor",
      rating: 4.4,
      reviews: 67,
    },
    {
      id: 6,
      name: "Indoor Plant Set",
      price: 49.99,
      description: "Set of 3 low-maintenance plants",
      colors: [
        { name: "White Pot", hex: "#FFFFFF", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=300" },
        { name: "Terra Cotta", hex: "#E2725B", image: "https://images.unsplash.com/photo-1459156212016-306b6ae9a720?w=300" },
      ],
      vendor: "HomeDecor",
      rating: 4.7,
      reviews: 92,
    },
  ],
};

function ProductCard({ product }) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        window.location.href = "/api/login";
        return;
      }
      
      await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
        size: selectedSize,
        color: selectedColor.name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} - Size: ${selectedSize}, Color: ${selectedColor.name} added to your cart`,
      });
      setError("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      window.location.href = "/api/login";
      return;
    }

    if (!selectedSize || !selectedColor) {
      setError("Please select both size and color before adding to cart");
      toast({
        title: "Selection Required",
        description: "Please select both size and color before adding to cart",
        variant: "destructive",
      });
      return;
    }

    addToCartMutation.mutate();
  };

  return (
    <Card className="group overflow-hidden">
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <img
          src={selectedColor.image}
          alt={product.name}
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-center space-x-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg">
            {product.colors.map((color) => (
              <button
                key={color.name}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  selectedColor.name === color.name ? 'border-primary scale-110' : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: color.hex }}
                onMouseEnter={() => setSelectedColor(color)}
                onClick={() => setSelectedColor(color)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.vendor}</p>
          </div>
          <span className="font-bold text-primary">${product.price}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
        
        {/* Size Selection */}
        {product.sizes && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Size
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
                    ${selectedSize === size 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection Label */}
        {product.colors && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Color: {selectedColor.name}
            </label>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`fas fa-star text-sm ${
                    i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">({product.reviews})</span>
          </div>
          <Button 
            onClick={handleAddToCart} 
            size="sm"
            variant={!selectedSize || !selectedColor ? "outline" : "default"}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Storefront() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("electronics");

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-xl font-bold text-gray-900 cursor-pointer">SaaSCommerce</h1>
            </Link>
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
                  <i className="fas fa-shopping-cart text-gray-600 text-lg hover:text-primary"></i>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>
              )}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = "/api/logout"}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  size="sm"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-[70vh] bg-cover bg-center"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920')"
          }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
              <h1 className="text-6xl font-bold mb-4 animate-fade-in">Premium Marketplace</h1>
              <p className="text-xl mb-8 animate-fade-in-delay">Discover amazing products from top vendors</p>
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 animate-fade-in-delay-2"
                onClick={() => {
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Tabs defaultValue="electronics" className="w-full">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Shop by Category</h2>
            <TabsList className="grid w-full max-w-2xl grid-cols-3 gap-4">
              <TabsTrigger value="electronics" className="py-3">
                <i className="fas fa-laptop mr-2"></i>
                Electronics
              </TabsTrigger>
              <TabsTrigger value="fashion" className="py-3">
                <i className="fas fa-tshirt mr-2"></i>
                Fashion
              </TabsTrigger>
              <TabsTrigger value="homeGarden" className="py-3">
                <i className="fas fa-home mr-2"></i>
                Home & Garden
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="electronics" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dummyProducts.electronics.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fashion" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dummyProducts.fashion.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="homeGarden" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dummyProducts.homeGarden.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Shopping Cart Sidebar */}
      {isCartOpen && (
        <ShoppingCart onClose={() => setIsCartOpen(false)} />
      )}
    </div>
  );
}
