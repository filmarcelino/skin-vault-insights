
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Twitter, Mail } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-4 z-50">
      <div className="max-w-lg bg-card p-6 rounded-lg border border-destructive/30 shadow-xl">
        <div className="mb-6 flex items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-primary">
          Technical Difficulties
        </h1>
        
        <div className="space-y-4 text-center mb-6">
          <p className="text-lg text-muted-foreground">
            Relax, folks… it's not a total wipe!
          </p>
          
          <p className="text-muted-foreground">
            Turns out… launching a high-traffic app on a retro PC setup from the early 2000s?
            Yeah… not our brightest strategy.
          </p>
          
          <p className="text-muted-foreground">
            The launch blew up (literally) way bigger than expected — and our dusty rig just couldn't handle the heat.
          </p>
          
          <p className="font-bold">
            But breathe easy:
            <br />
            No data was lost. Your vault is safe. Your skins are intact.
          </p>
          
          <p className="text-muted-foreground">
            We're rebuilding with something slightly more modern — maybe even dual-core!
            <br />
            We'll be back soon™ — stronger, faster, and less flammable.
          </p>
          
          <p className="text-muted-foreground">
            In the meantime, stay frosty… and maybe don't plant bombs near production servers.
          </p>
          
          <p className="font-medium">
            — The Clutch Studios Team
            <br />
            <span className="text-sm text-muted-foreground">(Yeah, this is where the CS on the logo comes from.)</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" className="flex gap-2 items-center" asChild>
            <a href="https://twitter.com/csskinvault" target="_blank" rel="noreferrer">
              <Twitter className="h-4 w-4" />
              CS Skin Vault Twitter
            </a>
          </Button>
          
          <Button variant="default" className="flex gap-2 items-center" asChild>
            <a href="mailto:support@csskinvault.com">
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
