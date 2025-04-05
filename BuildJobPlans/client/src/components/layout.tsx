import { Link, useLocation } from "wouter";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, FileText, HelpCircle, LogIn, Mail } from "lucide-react";
import PaymentSettings from "@/components/payment-settings";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex">
        <Sidebar>
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-8">Maintenance Planner</h1>
            <nav className="space-y-2">
              <Link href="/">
                <Button
                  variant={location === "/" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
              <Link href="/job-plans">
                <Button
                  variant={location === "/job-plans" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Job Plans
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant={location === "/faq" ? "secondary" : "ghost"} className="w-full justify-start">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  FAQ
                </Button>
              </Link>
              <Link href="/contact"> {/* Added contact link */}
                <Button variant="ghost" className="w-full justify-start"> {/* Added contact button */}
                  <Mail className="mr-2 h-4 w-4" /> {/* Added Mail icon */}
                  Contact Us {/* Added Contact Us text */}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="w-full justify-start">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In / Register 
                </Button>
              </Link>
            </nav>
            <div className="mt-8 px-2">
              <PaymentSettings />
            </div>
          </div>
        </Sidebar>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}