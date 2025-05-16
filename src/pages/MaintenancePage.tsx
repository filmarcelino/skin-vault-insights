
import React from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-[#1B1F23] overflow-hidden flex flex-col">
      <header className="bg-[#1B1F23] border-b border-[#2A2D30] p-4 relative z-10">
        <div className="container mx-auto">
          <Logo variant="image-and-text" size="lg" />
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Image Section - Full height on mobile, half width on desktop */}
        <div className="relative h-[300px] md:h-auto md:w-1/2">
          <img 
            src="/lovable-uploads/fb1e6845-85e3-4a13-8802-94b526103482.png"
            alt="The bomb has been planted on our servers" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent md:hidden"></div>
        </div>

        {/* Content Section */}
        <div className="relative flex-1 p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#FFCC00] to-[#FFA800] bg-clip-text text-transparent">
              THE BOMB HAS BEEN PLANTED ON OUR SERVERS
            </h1>
            
            <div className="space-y-4 text-[#F0F0F0] text-lg">
              <p className="font-semibold">
                Relax, folks… it's not a total wipe!
              </p>
              
              <p>
                Turns out… launching a high-traffic app on a retro PC setup from the early 2000s?
                Yeah… not our brightest strategy.
              </p>
              
              <p>
                The launch blew up (literally) way bigger than expected — and our dusty rig just couldn't handle the heat.
              </p>
              
              <div className="border-l-4 border-[#FFCC00] pl-4 my-6">
                <p className="font-semibold">But breathe easy:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>No data was lost. Your vault is safe. Your skins are intact.</li>
                </ul>
              </div>
              
              <p>
                We're rebuilding with something slightly more modern — maybe even dual-core!<br />
                We'll be back soon™ — stronger, faster, and less flammable.
              </p>
              
              <p>
                In the meantime, stay frosty… and maybe don't plant bombs near production servers.
              </p>
              
              <p className="mt-4 text-[#FFCC00] font-medium">
                — The Clutch Studios Team<br />
                <span className="text-sm text-[#A3A3A3]">(Yeah, this is where the CS on the logo comes from.)</span>
              </p>
              
              <div className="pt-6">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-[#FFCC00] animate-pulse rounded-full"></div>
                  <span className="ml-2 text-[#FFCC00] font-mono">Status: Defusing... ETA: Soon™</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <Button 
                className="bg-[#FFCC00] hover:bg-[#FFA800] text-black"
                onClick={() => window.location.href = "https://twitter.com/CSSkinVault"}
              >
                Follow Updates
              </Button>
              
              <Button 
                variant="outline"
                className="border-[#5A90A5] text-[#5A90A5] hover:bg-[#5A90A5]/10"
                onClick={() => window.open("mailto:support@cskinvault.com")}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-[#101316] text-[#A3A3A3] py-4 px-6 text-center text-sm">
        © 2025 CS Skin Vault. We're working to get back online as quickly as possible.
      </footer>
    </div>
  );
};

export default MaintenancePage;
