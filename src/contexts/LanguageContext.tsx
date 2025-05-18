
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define supported languages
export type Language = "en" | "pt" | "es";

// Define translations interface
export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Language context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Default translations
const translations: Translations = {
  en: {
    // Common
    "app.name": "CS Skin Vault",
    "app.tagline": "Manage your CS2 skin inventory with powerful analytics",
    
    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot Password?",
    
    // Dashboard
    "dashboard.welcome": "Welcome to CS Skin Vault",
    "dashboard.inventory": "Inventory",
    "dashboard.analytics": "Analytics",
    "dashboard.skins": "Skins",
    "dashboard.value": "Total Value",
    
    // Inventory
    "inventory.add": "Add Skin",
    "inventory.edit": "Edit Skin",
    "inventory.remove": "Remove",
    "inventory.sell": "Sell",
    "inventory.duplicate": "Duplicate",
    
    // Subscription
    "subscription.premium": "Premium",
    "subscription.trial": "Trial",
    "subscription.days": "Days Remaining",
    "subscription.upgrade": "Upgrade Now",
    
    // PWA
    "pwa.install": "Add to Home Screen",
    "pwa.later": "Remind Later",
    "pwa.understood": "Got it",
  },
  pt: {
    // Common
    "app.name": "CS Skin Vault",
    "app.tagline": "Gerencie seu inventário de skins do CS2 com análises poderosas",
    
    // Auth
    "auth.login": "Entrar",
    "auth.signup": "Cadastrar",
    "auth.email": "Email",
    "auth.password": "Senha",
    "auth.forgotPassword": "Esqueceu a senha?",
    
    // Dashboard
    "dashboard.welcome": "Bem-vindo ao CS Skin Vault",
    "dashboard.inventory": "Inventário",
    "dashboard.analytics": "Análises",
    "dashboard.skins": "Skins",
    "dashboard.value": "Valor Total",
    
    // Inventory
    "inventory.add": "Adicionar Skin",
    "inventory.edit": "Editar Skin",
    "inventory.remove": "Remover",
    "inventory.sell": "Vender",
    "inventory.duplicate": "Duplicar",
    
    // Subscription
    "subscription.premium": "Premium",
    "subscription.trial": "Trial",
    "subscription.days": "Dias Restantes",
    "subscription.upgrade": "Atualizar Agora",
    
    // PWA
    "pwa.install": "Adicionar à Tela Inicial",
    "pwa.later": "Lembrar Depois",
    "pwa.understood": "Entendi",
  },
  es: {
    // Common
    "app.name": "CS Skin Vault",
    "app.tagline": "Gestiona tu inventario de skins de CS2 con análisis potentes",
    
    // Auth
    "auth.login": "Iniciar sesión",
    "auth.signup": "Registrarse",
    "auth.email": "Email",
    "auth.password": "Contraseña",
    "auth.forgotPassword": "¿Olvidó su contraseña?",
    
    // Dashboard
    "dashboard.welcome": "Bienvenido a CS Skin Vault",
    "dashboard.inventory": "Inventario",
    "dashboard.analytics": "Análisis",
    "dashboard.skins": "Skins",
    "dashboard.value": "Valor Total",
    
    // Inventory
    "inventory.add": "Añadir Skin",
    "inventory.edit": "Editar Skin",
    "inventory.remove": "Eliminar",
    "inventory.sell": "Vender",
    "inventory.duplicate": "Duplicar",
    
    // Subscription
    "subscription.premium": "Premium",
    "subscription.trial": "Prueba",
    "subscription.days": "Días Restantes",
    "subscription.upgrade": "Actualizar Ahora",
    
    // PWA
    "pwa.install": "Añadir a Pantalla de Inicio",
    "pwa.later": "Recordar Después",
    "pwa.understood": "Entendido",
  }
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: () => "",
});

// Language provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Try to get saved language from local storage or use browser language
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'pt' || browserLang === 'es') 
      ? browserLang as Language 
      : 'en';
  };
  
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("cs-skin-vault-language");
    return (savedLanguage === 'pt' || savedLanguage === 'en' || savedLanguage === 'es') 
      ? savedLanguage as Language 
      : getBrowserLanguage();
  });

  // Effect to save language preference
  useEffect(() => {
    localStorage.setItem("cs-skin-vault-language", language);
    document.documentElement.lang = language;
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
