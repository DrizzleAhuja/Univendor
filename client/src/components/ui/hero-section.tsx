import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

// Hero slider image interface
interface SliderImage {
  url: string;
  alt: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  category?: string;
  subcategory?: string;
  badgeText?: string;
  productId?: number;
}

interface HeroSectionProps {
  sliderImages: SliderImage[];
  dealOfTheDay?: {
    title: string;
    subtitle: string;
    image: string;
    originalPrice: number | string;
    discountPrice: number | string;
    discountPercentage: number;
    hours: number;
    minutes: number;
    seconds: number;
    productId?: number; // Added product ID for linking
  };
}

export function HeroSection({ sliderImages, dealOfTheDay }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [, navigate] = useLocation();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Helper function to get category-specific image
  const getCategoryImage = (category?: string) => {
    if (category) {
      const categoryLower = category.toLowerCase();
      // List of known categories with images
      const knownCategories = [
        "electronics",
        "fashion",
        "mobiles",
        "home",
        "beauty",
        "grocery",
        "toys",
        "appliances",
      ];
      if (knownCategories.includes(categoryLower)) {
        return `/images/categories/${categoryLower}.svg`;
      }
    }
    return "/images/placeholder.svg";
  };

  // Helper function to get deal of the day category image
  const getDealCategory = () => {
    // Extract category from subtitle if available
    const category = dealOfTheDay?.subtitle.includes("Electronics")
      ? "electronics"
      : dealOfTheDay?.subtitle.includes("Fashion")
        ? "fashion"
        : dealOfTheDay?.subtitle.includes("Home")
          ? "home"
          : dealOfTheDay?.subtitle.includes("Appliances")
            ? "appliances"
            : dealOfTheDay?.subtitle.includes("Mobiles")
              ? "mobiles"
              : dealOfTheDay?.subtitle.includes("Beauty")
                ? "beauty"
                : dealOfTheDay?.subtitle.includes("Toys")
                  ? "toys"
                  : dealOfTheDay?.subtitle.includes("Grocery")
                    ? "grocery"
                    : "general";

    return `/images/categories/${category}.svg`;
  };

  // Deal of the day countdown - only initialize if we have a deal
  const [countdown, setCountdown] = useState({
    hours: dealOfTheDay?.hours || 0,
    minutes: dealOfTheDay?.minutes || 0,
    seconds: dealOfTheDay?.seconds || 0,
  });

  // Reset countdown when dealOfTheDay changes
  useEffect(() => {
    setCountdown({
      hours: dealOfTheDay?.hours || 0,
      minutes: dealOfTheDay?.minutes || 0,
      seconds: dealOfTheDay?.seconds || 0,
    });
  }, [dealOfTheDay]);

  // Update countdown timer - only if we have a deal of the day
  useEffect(() => {
    if (!dealOfTheDay) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        let newSeconds = prev.seconds - 1;
        let newMinutes = prev.minutes;
        let newHours = prev.hours;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes--;
        }

        if (newMinutes < 0) {
          newMinutes = 59;
          newHours--;
        }

        if (newHours < 0 || (newHours === 0 && newMinutes === 0 && newSeconds === 0)) {
          // When timer ends, refetch the deal and reset timer
          queryClient.invalidateQueries(["/api/deal-of-the-day"]);
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        return { hours: newHours, minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [dealOfTheDay, queryClient]);

  const goToSlide = (slideIndex: number) => {
    let newIndex = slideIndex;
    if (newIndex < 0) newIndex = sliderImages.length - 1;
    if (newIndex >= sliderImages.length) newIndex = 0;

    setCurrentSlide(newIndex);

    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${newIndex * 100}%)`;
    }
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToSlide(currentSlide - 1);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToSlide(currentSlide + 1);
  };

  const handleSlideClick = (image: SliderImage) => {
    if (image.productId) {
      // Use Wouter navigation instead of direct location change
      navigate(`/product/${image.productId}`);
    } else if (image.category) {
      let url = `/category/${image.category.toLowerCase()}`;
      if (image.subcategory) {
        url += `?subcategory=${image.subcategory.toLowerCase()}`;
      }
      navigate(url);
    }
  };

  // Set up autoplay
  useEffect(() => {
    // Function to advance to the next slide
    const advanceSlide = () => {
      setCurrentSlide((prevSlide) => {
        const nextSlide =
          prevSlide + 1 >= sliderImages.length ? 0 : prevSlide + 1;

        // Update the transform directly
        if (sliderRef.current) {
          sliderRef.current.style.transform = `translateX(-${
            nextSlide * 100
          }%)`;
        }

        return nextSlide;
      });
    };

    // Start autoplay with 5 second intervals
    const autoplayInterval = setInterval(advanceSlide, 5000);

    // Clear interval on component unmount
    return () => clearInterval(autoplayInterval);
  }, [sliderImages.length]); // Only re-run if the number of slides changes

  // Pause autoplay on hover
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    // Restart the autoplay when mouse leaves
    if (!intervalRef.current) {
      intervalRef.current = window.setInterval(() => {
        const nextSlide =
          currentSlide + 1 >= sliderImages.length ? 0 : currentSlide + 1;
        goToSlide(nextSlide);
      }, 5000);
    }
  };

  const handleDealAddToCart = async () => {
    if (!dealOfTheDay?.productId) return;

    // Check if user is logged in
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to cart",
        variant: "default",
      });
      navigate("/auth");
      return;
    }

    // Check if user is admin or seller
    if (user.role === "admin" || user.role === "seller") {
      toast({
        title: "Action Not Allowed",
        description:
          "Only buyers can add items to cart. Please switch to a buyer account.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/products/${dealOfTheDay.productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      const product = await response.json();

      await addToCart(product, 1);
      toast({
        title: "Added to cart",
        description: "The deal of the day has been added to your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Main hero slider */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#f5e7d4] via-[#fff8f1] to-[#ffe7b8] shadow-2xl rounded-2xl border border-cream" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div
          ref={sliderRef}
          className="flex transition-transform duration-500 ease-in-out min-h-[340px] md:min-h-[420px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {sliderImages.map((image, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0 cursor-pointer"
              onClick={() => handleSlideClick(image)}
            >
              <div className="container mx-auto px-4 py-10 md:py-20 flex flex-col md:flex-row items-center">
                {/* Content area */}
                <div className="md:w-1/2 text-black mb-8 md:mb-0 md:pr-8">
                  {image.badgeText && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-4 py-1 rounded-full uppercase shadow-lg border border-white">
                      {image.badgeText}
                    </span>
                  )}
                  <h2 className="text-4xl md:text-6xl font-extrabold mt-6 leading-tight drop-shadow-xl text-black/90">
                    {image.title || "Summer Sale Collection"}
                  </h2>
                  <p className="mt-6 text-xl md:text-2xl opacity-90 max-w-md text-black/80 font-medium drop-shadow-sm">
                    {image.subtitle || "Up to 50% off on all summer essentials"}
                  </p>
                  <Button
                    className="mt-8 bg-gradient-to-r from-orange-400 to-yellow-400 text-black font-extrabold rounded-full px-10 py-4 text-xl shadow-xl hover:from-yellow-400 hover:to-orange-400 transition-transform duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlideClick(image);
                    }}
                  >
                    {image.buttonText || "Shop Now"}
                  </Button>
                </div>

                {/* Image area remains unchanged for now */}
                <div className="md:w-1/2 flex justify-center items-center">
                  <img
                    src={
                      image.url && !image.url.includes("placeholder.com")
                        ? image.url
                        : getCategoryImage(image.category)
                    }
                    alt={image.alt}
                    className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-2xl border-4 border-white"
                    onError={(e) => {
                      // Use a category-specific fallback image on error
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite loop
                      target.src = getCategoryImage(image.category);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 text-white rounded-full p-2 shadow-lg z-10 hover:bg-black"
          onClick={prevSlide}
        >
          <ChevronLeft className="text-white" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 text-white rounded-full p-2 shadow-lg z-10 hover:bg-black"
          onClick={nextSlide}
        >
          <ChevronRight className="text-white" />
        </Button>

        {/* Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full border border-black ${
                index === currentSlide ? "bg-black" : "bg-black/30"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
            />
          ))}
        </div>
      </div>

      {/* Deal of the Day Section - only show if we have deal data */}
      {dealOfTheDay && (
        <div className="bg-[#f5e7d4] py-6 border-t-2 border-black/10">
          <div className="container mx-auto px-4">
            <div className="bg-white/80 rounded-2xl shadow-xl border border-black/10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
              {/* Left side - Deal info */}
              <div className="md:w-1/2 mb-4 md:mb-0 md:pr-8 text-black">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded shadow uppercase tracking-wider">
                    DEAL OF THE DAY
                  </div>
                  <div className="flex ml-4 space-x-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {countdown.hours}
                      </div>
                      <div className="text-xs text-gray-500">Hours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {countdown.minutes}
                      </div>
                      <div className="text-xs text-gray-500">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {countdown.seconds}
                      </div>
                      <div className="text-xs text-gray-500">Seconds</div>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold mb-2 drop-shadow-sm">
                  {dealOfTheDay.title}
                </h3>
                <p className="text-base text-black/80 mb-4">
                  {dealOfTheDay.subtitle}
                </p>
                <div className="flex items-center mb-4 gap-3">
                  <span className="text-3xl font-extrabold text-green-700">
                    ₹
                    {typeof dealOfTheDay.discountPrice === "number"
                      ? dealOfTheDay.discountPrice.toFixed(2)
                      : typeof dealOfTheDay.discountPrice === "string"
                        ? parseFloat(dealOfTheDay.discountPrice).toFixed(2)
                        : "0.00"}
                  </span>
                  <span className="text-gray-400 line-through ml-2 text-lg">
                    ₹
                    {typeof dealOfTheDay.originalPrice === "number"
                      ? dealOfTheDay.originalPrice.toFixed(2)
                      : typeof dealOfTheDay.originalPrice === "string"
                        ? parseFloat(dealOfTheDay.originalPrice).toFixed(2)
                        : "0.00"}
                  </span>
                  <span className="text-green-600 ml-2 text-base font-semibold">
                    {dealOfTheDay.discountPercentage}% off
                  </span>
                </div>
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-full px-8 py-3 text-lg shadow-lg hover:from-orange-500 hover:to-yellow-500 transition"
                  onClick={handleDealAddToCart}
                  aria-label="Add to Cart"
                  title="Add to Cart"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
              {/* Right side - Product image */}
              <div className="md:w-1/2 flex justify-center items-center">
                <div
                  className="cursor-pointer bg-white/90 rounded-2xl p-4 shadow-lg border border-black/10 hover:scale-105 transition-transform"
                  onClick={() => {
                    if (dealOfTheDay.productId) {
                      navigate(`/product/${dealOfTheDay.productId}`);
                    }
                  }}
                >
                  <img
                    src={
                      dealOfTheDay.image &&
                      !dealOfTheDay.image.includes("placeholder.com")
                        ? dealOfTheDay.image
                        : getDealCategory()
                    }
                    alt={dealOfTheDay.title}
                    className="w-full max-h-56 object-contain rounded-xl border-2 border-yellow-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = getDealCategory();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
