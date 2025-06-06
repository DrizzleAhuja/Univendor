import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload } from "lucide-react";

interface ProductVariant {
  id?: string;
  sku: string;
  color: string;
  size: string;
  mrp: string;
  sellingPrice: string;
  purchasePrice: string;
  stock: string;
  weight: string;
  length: string;
  breadth: string;
  height: string;
  imageUrls: string[];
}

interface ProductVariantMatrixProps {
  baseProduct: {
    name: string;
    sku: string;
    mrp: string;
    sellingPrice: string;
    purchasePrice: string;
    weight: string;
    length: string;
    breadth: string;
    height: string;
  };
  onVariantsChange: (variants: ProductVariant[]) => void;
}

export function ProductVariantMatrix({ baseProduct, onVariantsChange }: ProductVariantMatrixProps) {
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");

  // Generate variants when colors or sizes change
  useEffect(() => {
    if (colors.length > 0 || sizes.length > 0) {
      const newVariants: ProductVariant[] = [];
      
      if (colors.length > 0 && sizes.length > 0) {
        // Both colors and sizes - create matrix
        colors.forEach(color => {
          sizes.forEach(size => {
            const variantSku = `${baseProduct.sku}-${color.toUpperCase()}-${size.toUpperCase()}`;
            newVariants.push({
              id: `${color}-${size}`,
              sku: variantSku,
              color,
              size,
              mrp: baseProduct.mrp,
              sellingPrice: baseProduct.sellingPrice,
              purchasePrice: baseProduct.purchasePrice,
              stock: "0",
              weight: baseProduct.weight,
              length: baseProduct.length,
              breadth: baseProduct.breadth,
              height: baseProduct.height,
              imageUrls: []
            });
          });
        });
      } else if (colors.length > 0) {
        // Only colors
        colors.forEach(color => {
          const variantSku = `${baseProduct.sku}-${color.toUpperCase()}`;
          newVariants.push({
            id: color,
            sku: variantSku,
            color,
            size: "",
            mrp: baseProduct.mrp,
            sellingPrice: baseProduct.sellingPrice,
            purchasePrice: baseProduct.purchasePrice,
            stock: "0",
            weight: baseProduct.weight,
            length: baseProduct.length,
            breadth: baseProduct.breadth,
            height: baseProduct.height,
            imageUrls: []
          });
        });
      } else if (sizes.length > 0) {
        // Only sizes
        sizes.forEach(size => {
          const variantSku = `${baseProduct.sku}-${size.toUpperCase()}`;
          newVariants.push({
            id: size,
            sku: variantSku,
            color: "",
            size,
            mrp: baseProduct.mrp,
            sellingPrice: baseProduct.sellingPrice,
            purchasePrice: baseProduct.purchasePrice,
            stock: "0",
            weight: baseProduct.weight,
            length: baseProduct.length,
            breadth: baseProduct.breadth,
            height: baseProduct.height,
            imageUrls: []
          });
        });
      }
      
      setVariants(newVariants);
      onVariantsChange(newVariants);
    } else {
      setVariants([]);
      onVariantsChange([]);
    }
  }, [colors, sizes, baseProduct]);

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()]);
      setNewColor("");
    }
  };

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes([...sizes, newSize.trim()]);
      setNewSize("");
    }
  };

  const removeColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
  };

  const removeSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
  };

  const updateVariant = (variantId: string, field: keyof ProductVariant, value: string) => {
    setVariants(prev => {
      const updated = prev.map(variant => 
        variant.id === variantId ? { ...variant, [field]: value } : variant
      );
      onVariantsChange(updated);
      return updated;
    });
  };

  const addImageToVariant = (variantId: string, imageUrl: string) => {
    if (imageUrl.trim()) {
      setVariants(prev => {
        const updated = prev.map(variant => 
          variant.id === variantId 
            ? { ...variant, imageUrls: [...variant.imageUrls, imageUrl.trim()] }
            : variant
        );
        onVariantsChange(updated);
        return updated;
      });
    }
  };

  const removeImageFromVariant = (variantId: string, imageIndex: number) => {
    setVariants(prev => {
      const updated = prev.map(variant => 
        variant.id === variantId 
          ? { ...variant, imageUrls: variant.imageUrls.filter((_, i) => i !== imageIndex) }
          : variant
      );
      onVariantsChange(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Variants Matrix Generator</CardTitle>
          <p className="text-sm text-gray-600">
            Add colors and sizes to automatically generate all possible combinations
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color Input */}
          <div>
            <label className="text-sm font-medium">Colors</label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="e.g., Red, Blue, Green"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addColor()}
              />
              <Button type="button" onClick={addColor} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {colors.map(color => (
                <Badge key={color} variant="secondary" className="flex items-center gap-1">
                  {color}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeColor(color)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Size Input */}
          <div>
            <label className="text-sm font-medium">Sizes</label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="e.g., S, M, L, XL"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSize()}
              />
              <Button type="button" onClick={addSize} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {sizes.map(size => (
                <Badge key={size} variant="secondary" className="flex items-center gap-1">
                  {size}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeSize(size)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {variants.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Generated {variants.length} variants: {colors.length} colors × {sizes.length} sizes
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants Table */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variant Details</CardTitle>
            <p className="text-sm text-gray-600">
              Configure pricing, stock, and images for each variant
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">SKU</th>
                    <th className="text-left p-2">Color</th>
                    <th className="text-left p-2">Size</th>
                    <th className="text-left p-2">MRP (₹)</th>
                    <th className="text-left p-2">Selling Price (₹)</th>
                    <th className="text-left p-2">Purchase Price (₹)</th>
                    <th className="text-left p-2">Stock</th>
                    <th className="text-left p-2">Weight (kg)</th>
                    <th className="text-left p-2">Images</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map(variant => (
                    <tr key={variant.id} className="border-b">
                      <td className="p-2">
                        <Input
                          value={variant.sku}
                          onChange={(e) => updateVariant(variant.id!, 'sku', e.target.value)}
                          className="w-full min-w-[120px]"
                        />
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{variant.color}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{variant.size}</Badge>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.mrp}
                          onChange={(e) => updateVariant(variant.id!, 'mrp', e.target.value)}
                          className="w-20"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.sellingPrice}
                          onChange={(e) => updateVariant(variant.id!, 'sellingPrice', e.target.value)}
                          className="w-20"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.purchasePrice}
                          onChange={(e) => updateVariant(variant.id!, 'purchasePrice', e.target.value)}
                          className="w-20"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(variant.id!, 'stock', e.target.value)}
                          className="w-16"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.weight}
                          onChange={(e) => updateVariant(variant.id!, 'weight', e.target.value)}
                          className="w-16"
                        />
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          {variant.imageUrls.map((url, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <span className="text-xs text-gray-500 truncate max-w-[100px]">
                                {url}
                              </span>
                              <X 
                                className="w-3 h-3 cursor-pointer text-red-500"
                                onClick={() => removeImageFromVariant(variant.id!, index)}
                              />
                            </div>
                          ))}
                          <Input
                            placeholder="Image URL"
                            className="w-32 text-xs"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addImageToVariant(variant.id!, (e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}