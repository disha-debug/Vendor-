import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShieldCheck, Wrench, Calendar, CreditCard, Star, ArrowRight, Zap, CheckCircle } from "lucide-react";

const features = [
  { icon: Wrench, title: "Find Services", desc: "Browse plumbers, electricians, cleaners and more near you" },
  { icon: Calendar, title: "Easy Booking", desc: "Pick a date & time that works. We handle the rest" },
  { icon: CreditCard, title: "Secure Payments", desc: "Pay safely with integrated payment processing" },
  { icon: Star, title: "Verified Reviews", desc: "Read honest reviews from real customers" },
];

const categories = [
  "Plumbing", "Electrical", "Carpentry", "Cleaning", "Painting", "Gardening", "Pest Control", "Appliance Repair",
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">Vendor Service Provider</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" className="font-medium">Sign in</Button>
            </Link>
            <Link to="/auth">
              <Button className="font-medium gap-1.5">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        <div className="max-w-3xl mx-auto animate-in-fade">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Zap className="h-3.5 w-3.5" />
            Trusted by 10,000+ customers
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-[1.1] tracking-tight mb-6">
            Home services,
            <br />
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">made simple.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Connect with verified local service providers. Book, pay, and review — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto gap-2 font-medium text-base h-12 px-6">
                Book a service
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-medium text-base h-12 px-6">
                Join as provider
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <span
              key={cat}
              className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-primary/5 transition-colors cursor-default"
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 md:py-28">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-3">How it works</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">Everything you need to get help at home</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 animate-in-fade"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="rounded-2xl gradient-primary p-10 md:p-14 text-center overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 max-w-3xl mx-auto">
            {[
              { value: "10K+", label: "Customers" },
              { value: "2K+", label: "Service providers" },
              { value: "50K+", label: "Bookings completed" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">{s.value}</p>
                <p className="text-primary-foreground/80 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-heading font-semibold">Vendor Service Provider</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Vendor Service Provider. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
