import { Button } from "@/components/ui/button";
import { Package, Plus, ShoppingBag, LogOut, Recycle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Nature Background */}
      <div className="nature-bg">
        <div className="nature-gradient" />
        {Array.from({ length: 8 }).map((_, i) => (
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
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="glass-panel rounded-3xl p-8 mb-8 refract-hover">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Recycle className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">
                  Seller Dashboard
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">List. Deliver. Earn.</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="glass-button">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel rounded-2xl p-6 counter-glow">
            <p className="text-muted-foreground text-sm mb-1">Active Listings</p>
            <p className="text-4xl font-bold text-primary">0</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 counter-glow">
            <p className="text-muted-foreground text-sm mb-1">Pending Orders</p>
            <p className="text-4xl font-bold text-primary">0</p>
          </div>

          <div className="glass-panel rounded-2xl p-6 counter-glow">
            <p className="text-muted-foreground text-sm mb-1">Points Earned</p>
            <p className="text-4xl font-bold text-primary">0</p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-panel rounded-3xl p-8 refract-hover cursor-pointer bio-glow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 glass-button rounded-full">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Create Listing</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Add a new eco-friendly product to the marketplace
            </p>
            <Button className="w-full btn-glow" size="lg">
              New Product
            </Button>
          </div>

          <div className="glass-panel rounded-3xl p-8 refract-hover cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 glass-button rounded-full">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Browse Suggestions</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              See items suggested by buyer scans
            </p>
            <Button variant="outline" className="w-full glass-button" size="lg">
              View Suggestions
            </Button>
          </div>
        </div>

        {/* My Listings */}
        <div className="glass-panel rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-primary" />
            <h3 className="text-2xl font-bold">My Listings</h3>
          </div>
          <p className="text-muted-foreground mb-8">Manage your active products</p>
          <div className="text-center py-12 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No listings yet. Create your first eco-friendly product!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
