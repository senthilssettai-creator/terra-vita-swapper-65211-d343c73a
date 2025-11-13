import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Award, Recycle, Loader2, Leaf, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import FluidBackground from "@/components/FluidBackground";
import InteractiveGlassPanel from "@/components/InteractiveGlassPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AIChatButton } from "@/components/AIChatButton";
import { CartDrawer } from "@/components/CartDrawer";
import { useCart } from "@/hooks/useCart";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(50);
  const { addItem } = useCart();
  const catalogRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await (supabase as any)
        .from('products')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      title: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image_url,
    });
    setPoints(points + 10);
    toast.success(`${product.name} added! +10 EcoPoints earned 🎉`);
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const allTags = products.flatMap(p => p.tags || []);
  const categories = ["all", ...Array.from(new Set(allTags))];
  const filteredProducts = activeTab === "all" 
    ? products 
    : products.filter(p => p.tags?.includes(activeTab));

  return (
    <FluidBackground complexity="medium" interactive={true}>
      <div className="min-h-screen relative overflow-hidden bg-background/50">
        {/* Green Nature Background */}
        <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/20 dark:via-green-950/20 dark:to-teal-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(5,150,105,0.1),transparent_50%)]" />
        
        {/* Floating Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
              backgroundColor: i % 3 === 0 ? 'rgba(16,185,129,0.3)' : i % 3 === 1 ? 'rgba(5,150,105,0.3)' : 'rgba(6,182,212,0.3)',
            }}
          />
        ))}
        </div>

        <div className="relative z-10">
        {/* Header */}
        <header className="glass-panel border-b sticky top-0 z-50 backdrop-blur-xl shadow-sm">
          <div className="container py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                <Recycle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">Terra Vitta</h1>
                <p className="text-sm text-muted-foreground font-medium">EcoPoints: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{points}</span></p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <AIChatButton />
              <CartDrawer />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut} 
                className="glass-button font-semibold hover:bg-emerald-500/10"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8 smooth-scroll relative z-10">
          {/* Hero Section */}
          <section className="py-16 text-center space-y-8">
            <div className="glass-panel rounded-3xl p-12 max-w-4xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-light text-sm font-semibold">
                <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sustainable Marketplace</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Shop with
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                  Purpose & Impact
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Every purchase supports sustainability. Discover eco-friendly products and earn EcoPoints for making conscious choices.
              </p>
              
              <Button 
                onClick={scrollToCatalog}
                size="lg"
                className="btn-glow text-lg px-10 h-14 rounded-2xl font-semibold transition-spring hover:scale-105 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
              >
                Explore Products
                <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </section>

          {/* Product Catalog */}
          <section ref={catalogRef} className="pb-20">
            <div className="text-center mb-12 space-y-4">
              <h3 className="text-4xl font-bold">Product Catalog</h3>
              <p className="text-lg text-muted-foreground">Browse our curated selection of sustainable products</p>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="glass-panel w-full justify-center gap-2 p-2">
                {categories.map(cat => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="glass-button rounded-xl data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 font-semibold capitalize"
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map(cat => (
                <TabsContent key={cat} value={cat} className="mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {loading ? (
                      <div className="col-span-full flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-muted-foreground">
                        No products found in this category
                      </div>
                    ) : (
                      filteredProducts.map((product) => (
                        <InteractiveGlassPanel
                          key={product.id}
                          variant="light"
                          interactive={true}
                          focusable={true}
                          a11yLabel={`View ${product.name}`}
                          className="rounded-3xl overflow-hidden group"
                        >
                          <div className="aspect-square overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20">
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                          </div>
                          <div className="p-6 space-y-4">
                            <div>
                              <h3 className="font-bold text-xl mb-1">{product.name}</h3>
                              <p className="text-sm text-muted-foreground font-medium capitalize">{product.tags?.[0] || 'Product'}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Sustainability Score</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {product.sustainability_score}%
                                </span>
                              </div>
                              <div className="flex-1 bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-emerald-500 to-green-500 h-full rounded-full transition-all shadow-sm"
                                  style={{ width: `${product.sustainability_score}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {product.currency === 'INR' ? '₹' : 'د.إ'} {product.price.toFixed(2)}
                              </span>
                              <Button 
                                onClick={() => handleAddToCart(product)}
                                className="btn-glow bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 font-semibold transition-spring hover:scale-105"
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </InteractiveGlassPanel>
                      ))
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </section>
        </main>

        {/* Footer */}
        <footer className="glass-panel border-t py-12">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Recycle className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">
                  © 2025 Terra Vitta. Building a sustainable future together.
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                <button className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About</button>
                <button className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Sustainability</button>
                <button className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Community</button>
                <button className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Contact</button>
              </div>
            </div>
          </div>
        </footer>
        </div>
      </div>
    </FluidBackground>
  );
};

export default BuyerDashboard;
