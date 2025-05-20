
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Construction } from "lucide-react";

const UnderConstruction: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Construction className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-xl font-bold">CS Skin Vault</CardTitle>
          <CardDescription className="text-lg">
            Under Construction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2 bg-muted/50 p-3 rounded-md">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="leading-relaxed text-muted-foreground">
                We're working on making CS Skin Vault even better. The application will be back online soon with improved features.
              </p>
              <p className="text-sm text-muted-foreground">
                Thank you for your patience!
              </p>
            </div>
          </div>
          <div className="text-center">
            <Button variant="outline" disabled>
              Check Back Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnderConstruction;
