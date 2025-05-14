
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const HomeScreenPopup = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t, language } = useLanguage();
  
  useEffect(() => {
    // Verificar se o popup já foi mostrado antes
    const hasShownPopup = localStorage.getItem("homeScreenPopupShown");
    
    // Mostrar o popup apenas em dispositivos móveis e se não tiver sido mostrado antes
    if (isMobile && !hasShownPopup) {
      // Esperar alguns segundos antes de mostrar o popup para melhor experiência do usuário
      const timer = setTimeout(() => {
        setOpen(true);
        // Marcar o popup como mostrado
        localStorage.setItem("homeScreenPopupShown", "true");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // Detectar o sistema operacional
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Limpar o localStorage para testar novamente (apenas para desenvolvimento)
  const resetPopupState = () => {
    localStorage.removeItem("homeScreenPopupShown");
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {t("pwa.install")}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === "en" ? "Access the app quickly directly from your home screen" :
             language === "es" ? "Acceda rápidamente a la aplicación directamente desde su pantalla de inicio" :
             "Acesse rapidamente o aplicativo diretamente da sua tela inicial"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center p-4">
          <img 
            src="/lovable-uploads/bf94853c-aef8-4bc7-8ca6-60524a082ca0.png" 
            alt="CS Skin Vault" 
            className="w-16 h-16 mb-4 rounded-lg bg-black"
          />
          
          {isIOS ? (
            <div className="space-y-4 text-sm">
              <p><strong>{language === "en" ? "For iOS:" : language === "es" ? "Para iOS:" : "Para iOS:"}</strong></p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  {language === "en" ? "Tap the share icon" : 
                   language === "es" ? "Pulse el icono de compartir" : 
                   "Toque no ícone compartilhar"} 
                  <span className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                    {language === "en" ? "Share" : 
                     language === "es" ? "Compartir" : 
                     "Compartilhar"} 
                    <span className="ml-1">↑</span>
                  </span> 
                  {language === "en" ? "at the bottom of Safari" : 
                   language === "es" ? "en la parte inferior de Safari" : 
                   "na barra inferior do Safari"}
                </li>
                <li>
                  {language === "en" ? "Scroll up and select" : 
                   language === "es" ? "Desplácese hacia arriba y seleccione" : 
                   "Deslize para cima e selecione"} 
                  <span className="font-semibold">
                    {language === "en" ? "Add to Home Screen" : 
                     language === "es" ? "Añadir a la pantalla de inicio" : 
                     "Adicionar à Tela de Início"}
                  </span>
                </li>
                <li>
                  {language === "en" ? "Confirm by tapping" : 
                   language === "es" ? "Confirme tocando" : 
                   "Confirme tocando em"} 
                  <span className="font-semibold">
                    {language === "en" ? "Add" : 
                     language === "es" ? "Añadir" : 
                     "Adicionar"}
                  </span> 
                  {language === "en" ? "in the upper right corner" : 
                   language === "es" ? "en la esquina superior derecha" : 
                   "no canto superior direito"}
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <p><strong>{language === "en" ? "For Android:" : language === "es" ? "Para Android:" : "Para Android:"}</strong></p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  {language === "en" ? "Tap the menu icon" : 
                   language === "es" ? "Pulse el icono de menú" : 
                   "Toque no ícone de menu"} 
                  <span className="inline-flex items-center justify-center px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">⋮</span> 
                  {language === "en" ? "in Chrome" : 
                   language === "es" ? "en Chrome" : 
                   "no Chrome"}
                </li>
                <li>
                  {language === "en" ? "Select" : 
                   language === "es" ? "Seleccione" : 
                   "Selecione"} 
                  <span className="font-semibold">
                    {language === "en" ? "Add to Home Screen" : 
                     language === "es" ? "Añadir a pantalla principal" : 
                     "Adicionar à tela inicial"}
                  </span> 
                  {language === "en" ? "or" : 
                   language === "es" ? "o" : 
                   "ou"} 
                  <span className="font-semibold">
                    {language === "en" ? "Install app" : 
                     language === "es" ? "Instalar aplicación" : 
                     "Instalar aplicativo"}
                  </span>
                </li>
                <li>
                  {language === "en" ? "Confirm by tapping" : 
                   language === "es" ? "Confirme tocando" : 
                   "Confirme tocando em"} 
                  <span className="font-semibold">
                    {language === "en" ? "Add" : 
                     language === "es" ? "Añadir" : 
                     "Adicionar"}
                  </span> 
                  {language === "en" ? "or" : 
                   language === "es" ? "o" : 
                   "ou"} 
                  <span className="font-semibold">
                    {language === "en" ? "Install" : 
                     language === "es" ? "Instalar" : 
                     "Instalar"}
                  </span>
                </li>
              </ol>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setOpen(false)}>
            {t("pwa.understood")}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setOpen(false);
              // Reset para mostrar o popup novamente na próxima visita
              localStorage.removeItem("homeScreenPopupShown");
            }}
          >
            {t("pwa.later")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
