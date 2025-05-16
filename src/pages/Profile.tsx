import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Currency, Language } from "@/types";

const Profile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile({ name });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleCurrencyChange = (value: string) => {
    // Convert string to Currency type
    setCurrency(value as Currency);
  };

  const handleLanguageChange = (value: string) => {
    // Convert string to Language type
    setLanguage(value as Language);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" value={email} disabled />
          </div>

          <div className="grid gap-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="BRL">BRL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between">
            {isEditing ? (
              <>
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleUpdateProfile}>
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
                <Button type="button" variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      <Separator className="my-6" />
      <div className="text-center text-sm text-muted-foreground">
        © 2024 CS Skin Vault. All rights reserved.
      </div>
    </div>
  );
};

export default Profile;
