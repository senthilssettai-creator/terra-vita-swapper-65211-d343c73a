import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, TrendingUp, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import FluidRibbons from "@/components/FluidRibbons";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen p-6 relative">
      <FluidRibbons />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Ecomart Admin
            </h1>
            <p className="text-muted-foreground text-lg font-semibold">Oversee. Moderate. Optimize.</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Sellers</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Products Listed</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Scans Processed</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-glow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Manage Users</CardTitle>
              </div>
              <CardDescription>
                View and modify user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                User Management
              </Button>
            </CardContent>
          </Card>

          <Card className="card-glow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Review Products</CardTitle>
              </div>
              <CardDescription>
                Moderate seller listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="lg">
                Product Review
              </Button>
            </CardContent>
          </Card>

          <Card className="card-glow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle>Analytics</CardTitle>
              </div>
              <CardDescription>
                View platform insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="lg">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Platform Activity</CardTitle>
            <CardDescription>Latest actions across Ecomart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>No activity to display yet</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
