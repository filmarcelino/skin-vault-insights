
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1B1F23] via-[#2A2D30] to-[#1B1F23] text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-[#FFCC00] to-[#FFA800] bg-clip-text text-transparent">
                  CS Skin Vault
                </span>
                <br />
                <span className="block mt-2">Manage Your Skin Inventory</span>
              </h1>
              <p className="text-lg md:text-xl text-[#A3A3A3]">
                The most efficient way to track, analyze and manage your skin inventory with real-time statistics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-[#FFCC00] hover:bg-[#FFA800] text-black">
                  <Link to="/auth">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-[#5A90A5] text-[#5A90A5] hover:bg-[#5A90A5]/10">
                  <a href="#features">Learn More</a>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1200" 
                alt="CS Skin Vault Dashboard" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-[#1B1F23] text-[#F0F0F0]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#FFCC00] to-[#FFA800] bg-clip-text text-transparent">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#2A2D30] p-6 rounded-xl shadow-md border border-[#5A90A5]/20">
              <div className="w-12 h-12 bg-[#5A90A5]/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#5A90A5]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#F0F0F0]">Inventory Management</h3>
              <p className="text-[#A3A3A3]">
                Track all your skins in one place. Easily add, edit, and remove items.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#2A2D30] p-6 rounded-xl shadow-md border border-[#B85727]/20">
              <div className="w-12 h-12 bg-[#B85727]/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#B85727]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#F0F0F0]">Price Analysis</h3>
              <p className="text-[#A3A3A3]">
                Track your skins' value and analyze market trends. Identify the best buying and selling opportunities.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#2A2D30] p-6 rounded-xl shadow-md border border-[#8847FF]/20">
              <div className="w-12 h-12 bg-[#8847FF]/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#8847FF]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#F0F0F0]">Advanced Search</h3>
              <p className="text-[#A3A3A3]">
                Quickly find any skin using our powerful search tool with filters by rarity, weapon, and other attributes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Feature 4 */}
            <div className="bg-[#2A2D30] p-6 rounded-xl shadow-md border border-[#FFCC00]/20">
              <div className="w-12 h-12 bg-[#FFCC00]/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#FFCC00]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#F0F0F0]">Currency Conversion</h3>
              <p className="text-[#A3A3A3]">
                View prices in different currencies. Support for USD, EUR, BRL, and more, with real-time exchange rates.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#2A2D30] p-6 rounded-xl shadow-md border border-[#4B69FF]/20">
              <div className="w-12 h-12 bg-[#4B69FF]/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#4B69FF]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75m0 0h4.5m3-3v3m0 0H18m0 0h1.5m-9-3h.75m-4.5 0h.75m0 0h1.5m0 0h3m3-3h.75m.75-3h.75m-.75 3h.75" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#F0F0F0]">Detailed Reports</h3>
              <p className="text-[#A3A3A3]">
                Access detailed reports about your inventory, transaction history, and evolution of your skins' value over time.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-[#101316] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Manage Your Inventory?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-[#A3A3A3]">
            Sign up today and get access to all the tools you need to maximize the value of your skins.
          </p>
          <Button asChild size="lg" className="bg-[#FFCC00] hover:bg-[#FFA800] text-black">
            <Link to="/auth">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#101316] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#A3A3A3] text-center md:text-left">
              © 2025 CS Skin Vault. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-[#A3A3A3] hover:text-[#FFCC00]">Terms</a>
              <a href="#" className="text-[#A3A3A3] hover:text-[#FFCC00]">Privacy</a>
              <a href="#" className="text-[#A3A3A3] hover:text-[#FFCC00]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
