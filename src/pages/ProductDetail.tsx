import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Award, Recycle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import FluidBackground from "@/components/FluidBackground";
import InteractiveGlassPanel from "@/components/InteractiveGlassPanel";
import { useCart } from '@/hooks/useCart';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CartDrawer } from '@/components/CartDrawer';
import productsData from '@/data/products.json';
import { useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  const product = productsData.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => navigate('/buyer')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      image: product.image,
    });
    toast.success(`${product.title} added to cart! 🎉`);
  };

  return (
    <FluidBackground complexity="medium" interactive={true}>
      <div className="min-h-screen text-foreground transition-theme relative overflow-hidden">
        {/* Nature Background */}
        <div className="nature-bg">
        <div className="nature-gradient" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
            }}
          />
          ))}
        </div>

        {/* Header */}
        <header className="border-b sticky top-0 glass-panel z-50 transition-theme">
          <div className="container flex items-center justify-between py-4">
          <Button variant="ghost" onClick={() => navigate('/buyer')} className="glass-button">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
          <div className="flex items-center gap-2">
            <CartDrawer />
            <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Product Detail */}
        <main className="container py-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl glass-panel p-2">
              <div className="aspect-square overflow-hidden rounded-2xl">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-6 right-6 glass-button rounded-full"
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
                }}
              >
                <Heart 
                  className={`h-5 w-5 transition-colors ${
                    isFavorite ? 'fill-red-500 text-red-500' : ''
                  }`} 
                />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <InteractiveGlassPanel
              variant="medium"
              interactive={true}
              focusable={true}
              a11yLabel={product.title}
              className="rounded-3xl p-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-button mb-4 text-sm">
                {product.category}
              </div>
              <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
              <p className="text-muted-foreground text-lg">{product.short}</p>
            </InteractiveGlassPanel>

            <InteractiveGlassPanel variant="light" interactive={true} className="rounded-3xl p-8">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  {product.currency === 'INR' ? '₹' : 'AED'} {product.price.toFixed(2)}
                </span>
                <span className="text-muted-foreground">{product.currency}</span>
              </div>
            </InteractiveGlassPanel>

            <InteractiveGlassPanel variant="medium" interactive={true} className="rounded-3xl p-8 bio-glow">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold">Sustainability Score</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold text-primary">{product.eco_score}</div>
                <div className="flex-1">
                  <div className="h-4 glass-panel rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary transition-all duration-500"
                      style={{ width: `${product.eco_score}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {product.eco_score >= 90
                      ? 'Excellent eco-friendly choice!'
                      : product.eco_score >= 80
                      ? 'Great sustainable option'
                      : 'Good eco-conscious pick'}
                  </p>
                </div>
              </div>
            </InteractiveGlassPanel>

            <InteractiveGlassPanel variant="light" interactive={true} className="rounded-3xl p-8 refract-hover">
              <div className="flex items-center gap-2 mb-4">
                <Recycle className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold">Why It's Eco-Friendly</h3>
              </div>
              <p className="text-foreground/90 leading-relaxed">{product.eco_reason}</p>
            </InteractiveGlassPanel>

            <Button onClick={handleAddToCart} size="lg" className="w-full btn-glow bio-glow rounded-2xl">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </main>
      </div>
    </FluidBackground>
  );
}
