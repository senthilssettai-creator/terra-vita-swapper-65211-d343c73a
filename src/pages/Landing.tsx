import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Leaf, ShoppingBag, Users, Recycle, ChevronDown, Sun, Moon, Target, Heart, Droplet, Globe, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import GlassBlurToggle from "@/components/GlassBlurToggle";
import { GlassIntensityControl } from "@/components/GlassIntensityControl";
import { LiquidGlassPanel } from "@/components/LiquidGlassPanel";
import { ParallaxGlass } from "@/components/ParallaxGlass";
import { FluidBackground } from "@/components/FluidBackground";

const Landing = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [swapCount, setSwapCount] = useState(0);
  const [ecoImpact, setEcoImpact] = useState(0);

  useEffect(() => {
    // Animate counters on load
    const swapInterval = setInterval(() => {
      setSwapCount(prev => (prev < 12847 ? prev + 127 : 12847));
    }, 50);
    
    const impactInterval = setInterval(() => {
      setEcoImpact(prev => (prev < 8532 ? prev + 85 : 8532));
    }, 50);

    return () => {
      clearInterval(swapInterval);
      clearInterval(impactInterval);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buyer?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/buyer");
    }
  };

  return (
    <div className="min-h-screen text-foreground transition-theme relative overflow-hidden">
      {/* Interactive Fluid Background */}
      <FluidBackground
        viscosity={0.001}
        vorticityStrength={25}
        interactive={true}
        complexity="high"
        resolutionScale={0.7}
      />

      {/* Glass Controls */}
      <GlassBlurToggle />
      <GlassIntensityControl />
      
      {/* Main Content */}
      <main className="relative z-10">
        {/* Header */}
        <header className="container py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Recycle className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Terra Vitta
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="glass-button rounded-full"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/auth")} className="glass-button">
              Sign In
            </Button>
            <Button className="btn-glow" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </header>

        {/* Hero Content - Advanced Liquid Glass Panel */}
        <section className="container py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            {/* Main Liquid Glass Panel with WebGL Support */}
            <ParallaxGlass intensity={0.6} enableTilt={true} easing="spring">
              <LiquidGlassPanel
                variant="medium"
                refractionStrength={0.6}
                interactive={true}
                enableParallax={true}
                enablePhysics={true}
                className="rounded-3xl p-8 md:p-12 space-y-8 animate-fade-in"
              >
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-light text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Building a Circular Future Together</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold leading-[1.1] tracking-tight">
                  Trade Smart.
                  <br />
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Live Green.
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                  Join a global community reducing waste through conscious exchanges. Every swap creates ripples of positive impact.
                </p>

                {/* Live Impact Counters */}
                <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
                  <div className="glass-panel rounded-2xl px-6 py-4 counter-glow">
                    <div className="text-3xl font-bold text-primary">{swapCount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Swaps Completed</div>
                  </div>
                  <div className="glass-panel rounded-2xl px-6 py-4 counter-glow">
                    <div className="text-3xl font-bold text-primary">{ecoImpact.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">kg CO₂ Saved</div>
                  </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-8">
                  <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                    <Input
                      type="text"
                      placeholder="What would you like to swap today?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="glass-panel pl-14 pr-5 h-16 text-lg search-focus rounded-2xl border-0"
                    />
                  </div>
                </form>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                  <Button 
                    size="lg" 
                    className="btn-glow bio-glow text-lg px-10 h-14 rounded-2xl"
                    onClick={() => navigate("/buyer")}
                  >
                    <Recycle className="mr-2 h-5 w-5" />
                    Start Swapping
                  </Button>
                  <Button 
                    size="lg" 
                    className="glass-button text-lg px-10 h-14 rounded-2xl"
                    onClick={() => navigate("/buyer")}
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Explore Community
                  </Button>
                </div>
              </div>
              </LiquidGlassPanel>
            </ParallaxGlass>

            {/* Scroll Indicator */}
            <div className="flex justify-center mt-12">
              <div className="scroll-indicator text-muted-foreground">
                <ChevronDown className="h-8 w-8" />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground">Three simple steps to sustainable swapping</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "List Your Items",
                  description: "Upload photos of items you want to swap. From clothes to books to electronics.",
                  icon: <ShoppingBag className="h-8 w-8" />
                },
                {
                  step: "02",
                  title: "Find Your Match",
                  description: "Browse community listings and find items you love. Our AI helps you discover perfect matches.",
                  icon: <Sparkles className="h-8 w-8" />
                },
                {
                  step: "03",
                  title: "Swap & Save",
                  description: "Complete the swap and earn EcoPoints. Track your environmental impact in real-time.",
                  icon: <Recycle className="h-8 w-8" />
                }
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="glass-panel rounded-2xl p-8 refract-hover animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="text-primary text-5xl font-bold opacity-20 mb-4">{item.step}</div>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* UN SDG Section */}
        <section className="container pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-light text-sm font-semibold">
                <Globe className="h-4 w-4 text-primary" />
                <span>Aligned with Global Goals</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold">UN Sustainable Development Goals</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Terra Vitta actively contributes to the United Nations' vision for a better world
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Target className="h-10 w-10" />,
                  number: "SDG 12",
                  title: "Responsible Consumption",
                  description: "Promoting sustainable production and consumption patterns through peer-to-peer exchanges",
                  color: "text-amber-500"
                },
                {
                  icon: <TrendingUp className="h-10 w-10" />,
                  number: "SDG 13",
                  title: "Climate Action",
                  description: "Reducing carbon footprint by extending product lifecycles and preventing waste",
                  color: "text-green-500"
                },
                {
                  icon: <Award className="h-10 w-10" />,
                  number: "SDG 11",
                  title: "Sustainable Communities",
                  description: "Building inclusive local networks that strengthen circular economy principles",
                  color: "text-blue-500"
                }
              ].map((goal, index) => (
                <div
                  key={goal.number}
                  className="glass-panel rounded-3xl p-8 card-hover animate-fade-in space-y-4"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center ${goal.color}`}>
                    {goal.icon}
                  </div>
                  <div className="text-sm font-bold text-primary">{goal.number}</div>
                  <h3 className="text-2xl font-bold">{goal.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{goal.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Sustainability Matters */}
        <section className="container pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="glass-panel rounded-3xl p-12 md:p-16 text-center space-y-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mx-auto mb-6">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold">Every Swap Matters</h2>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                By choosing to swap instead of buy new, you're part of a movement that saves resources, reduces emissions, and builds a circular economy where nothing is wasted.
              </p>

              <div className="grid md:grid-cols-3 gap-8 pt-8">
                {[
                  { value: "2.5M", label: "Items Saved from Landfills", icon: <Recycle className="h-5 w-5" /> },
                  { value: "8.5K", label: "Tons of CO₂ Prevented", icon: <Droplet className="h-5 w-5" /> },
                  { value: "50K+", label: "Active Community Members", icon: <Users className="h-5 w-5" /> }
                ].map((stat, index) => (
                  <div key={index} className="glass-light rounded-2xl p-6 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      {stat.icon}
                    </div>
                    <div className="text-5xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Community Highlights */}
        <section className="container pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Community Highlights</h2>
              <p className="text-xl text-muted-foreground">Real swaps from real people making a difference</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  user: "Sarah M.",
                  swap: "Vintage Camera ↔ Designer Backpack",
                  impact: "12 kg CO₂ saved",
                  time: "2 hours ago"
                },
                {
                  user: "James K.",
                  swap: "Board Games Set ↔ Yoga Equipment",
                  impact: "8 kg CO₂ saved",
                  time: "5 hours ago"
                },
                {
                  user: "Maya P.",
                  swap: "Children's Books ↔ Art Supplies",
                  impact: "6 kg CO₂ saved",
                  time: "1 day ago"
                }
              ].map((highlight, index) => (
                <div
                  key={index}
                  className="glass-panel rounded-2xl p-6 card-hover animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{highlight.user}</div>
                      <div className="text-sm text-muted-foreground">{highlight.time}</div>
                    </div>
                  </div>
                  <div className="text-sm mb-3">{highlight.swap}</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Leaf className="h-3 w-3" />
                    {highlight.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Call to Action Footer */}
      <section className="container pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-3xl p-12 md:p-16 text-center space-y-8 bio-glow">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of conscious swappers building a sustainable future, one exchange at a time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="btn-glow text-lg px-10 h-14 rounded-2xl"
                onClick={() => navigate("/auth")}
              >
                Join Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="glass-button text-lg px-10 h-14 rounded-2xl border-2"
                onClick={() => navigate("/buyer")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 glass-panel border-t">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Recycle className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground font-medium">
                © 2025 Terra Vitta. Building a Circular Future.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <button className="hover:text-primary transition-colors">About</button>
              <button className="hover:text-primary transition-colors">Community</button>
              <button className="hover:text-primary transition-colors">Impact</button>
              <button className="hover:text-primary transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
