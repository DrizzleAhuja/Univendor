import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  cartItems: any[];
  refetchCart: () => void;
}

export function ShoppingCart({ isOpen, onClose, onCheckout, cartItems = [], refetchCart }: ShoppingCartProps) {
  const { toast } = useToast();

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      await apiRequest("PUT", `/api/cart/${productId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/cart/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    },
  });

  const total = (cartItems || []).reduce((sum, item) => 
    sum + ((item?.product?.price ? parseFloat(item.product.price) : 0) * (item?.quantity || 0)), 0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b border-gray-200">
            <div className="flex justify-between items-center">
              <CardTitle>Shopping Cart</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <i className="fas fa-times"></i>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6">
            {!cartItems || cartItems.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-600">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b border-gray-200 pb-4">
                    <img 
                      src={item?.product?.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop"}
                      alt={item?.product?.name || "Product"}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item?.product?.name || "Product"}</h4>
                      <p className="text-sm text-gray-600">₹{item?.product?.price || "0.00"}</p>
                      {item?.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                      {item?.color && <p className="text-sm text-gray-500">Color: {item.color}</p>}
                      <div className="flex items-center space-x-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantityMutation.mutate({ 
                            productId: item.productId, 
                            quantity: Math.max(1, (item.quantity || 1) - 1)
                          })}
                          disabled={updateQuantityMutation.isPending || (item.quantity || 0) <= 1}
                        >
                          <i className="fas fa-minus"></i>
                        </Button>
                        <span className="px-3 py-1 bg-gray-100 rounded">{item.quantity || 0}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantityMutation.mutate({ 
                            productId: item.productId, 
                            quantity: (item.quantity || 0) + 1 
                          })}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <i className="fas fa-plus"></i>
                        </Button>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItemMutation.mutate(item.productId)}
                      disabled={removeItemMutation.isPending}
                    >
                      <i className="fas fa-trash text-red-500"></i>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {cartItems && cartItems.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-primary">₹{total.toFixed(2)}</span>
              </div>
              <Button 
                onClick={onCheckout}
                className="w-full"
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
