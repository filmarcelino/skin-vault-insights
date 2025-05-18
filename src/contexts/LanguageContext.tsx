
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
    "common.home": "Home",
    "common.add": "Add",
    "common.more": "More",
    "common.refresh": "Refresh",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.yes": "Yes",
    "common.no": "No",
    
    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.logout": "Logout",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot Password?",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome to CS Skin Vault",
    "dashboard.inventory": "Inventory",
    "dashboard.analytics": "Analytics",
    "dashboard.skins": "Skins",
    "dashboard.value": "Total Value",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.insights": "Insights",
    "dashboard.topSkins": "Top Skins",
    
    // Inventory
    "inventory.title": "Inventory",
    "inventory.current": "Current Inventory",
    "inventory.sold": "Sold Skins",
    "inventory.add": "Add Skin",
    "inventory.edit": "Edit Skin",
    "inventory.remove": "Remove",
    "inventory.sell": "Sell",
    "inventory.duplicate": "Duplicate",
    "inventory.empty": "Your inventory is empty",
    "inventory.emptyDesc": "Add your first skin to start tracking your collection",
    "inventory.noSoldItems": "You haven't sold any items yet",
    "inventory.sellItemsDesc": "When you sell items from your inventory, they will appear here",
    
    // Search
    "search.title": "Search",
    "search.searchSkins": "Search Skins",
    "search.placeholder": "Search by name, weapon...",
    "search.filters": "Filters",
    "search.weapon": "Weapon",
    "search.rarity": "Rarity",
    "search.minPrice": "Min Price",
    "search.maxPrice": "Max Price",
    "search.resetFilters": "Reset Filters",
    "search.noResults": "No skins found with these criteria",
    "search.tryDifferent": "Try adjusting your filters",
    
    // Analytics
    "analytics.title": "Analytics",
    "analytics.dashboard": "Analytics Dashboard",
    "analytics.overview": "Overview",
    "analytics.soldItems": "Sold Items",
    "analytics.trends": "Trends",
    "analytics.totalItems": "Total Items",
    "analytics.totalValue": "Total Value",
    "analytics.averageValue": "Average Value",
    "analytics.valueChange": "30d Change",
    "analytics.rarityDistribution": "Rarity Distribution",
    "analytics.recentTransactions": "Recent Transactions",
    "analytics.soldItemsSummary": "Sold Items Summary",
    "analytics.itemsSold": "Items Sold",
    "analytics.totalSoldValue": "Total Sold Value",
    "analytics.totalProfit": "Total Profit",
    "analytics.noTransactions": "No recent transactions",
    "analytics.priceHistory": "Price History",
    "analytics.sell": "Sell",
    "analytics.buy": "Buy",
    
    // Profile
    "profile.title": "Profile",
    "profile.account": "Account",
    "profile.preferences": "Preferences",
    "profile.subscription": "Subscription",
    "profile.logout": "Logout",
    
    // Settings
    "settings.title": "Settings",
    "settings.general": "General",
    "settings.appearance": "Appearance",
    "settings.notifications": "Notifications",
    "settings.language": "Language",
    "settings.currency": "Currency",
    
    // Subscription
    "subscription.premium": "Premium",
    "subscription.trial": "Trial",
    "subscription.days": "Days Remaining",
    "subscription.upgrade": "Upgrade Now",
    "subscription.premiumFeature": "Premium Feature",
    "subscription.upgradeToPremium": "Upgrade to Premium",
    "subscription.upgradeToPremiumDesc": "Upgrade to Premium to view detailed price history charts",
    
    // Errors
    "errors.loadingError": "Error loading data",
    "errors.tryAgain": "Please try again later",
    "errors.somethingWrong": "Something went wrong",
    
    // PWA
    "pwa.install": "Add to Home Screen",
    "pwa.later": "Remind Later",
    "pwa.understood": "Got it",
  },
  pt: {
    // Common
    "app.name": "CS Skin Vault",
    "app.tagline": "Gerencie seu inventário de skins do CS2 com análises poderosas",
    "common.home": "Início",
    "common.add": "Adicionar",
    "common.more": "Mais",
    "common.refresh": "Atualizar",
    "common.save": "Salvar",
    "common.cancel": "Cancelar",
    "common.delete": "Excluir",
    "common.edit": "Editar",
    "common.yes": "Sim",
    "common.no": "Não",
    
    // Auth
    "auth.login": "Entrar",
    "auth.signup": "Cadastrar",
    "auth.logout": "Sair",
    "auth.email": "Email",
    "auth.password": "Senha",
    "auth.forgotPassword": "Esqueceu a senha?",
    
    // Dashboard
    "dashboard.title": "Painel",
    "dashboard.welcome": "Bem-vindo ao CS Skin Vault",
    "dashboard.inventory": "Inventário",
    "dashboard.analytics": "Análises",
    "dashboard.skins": "Skins",
    "dashboard.value": "Valor Total",
    "dashboard.recentActivity": "Atividade Recente",
    "dashboard.insights": "Insights",
    "dashboard.topSkins": "Melhores Skins",
    
    // Inventory
    "inventory.title": "Inventário",
    "inventory.current": "Inventário Atual",
    "inventory.sold": "Skins Vendidas",
    "inventory.add": "Adicionar Skin",
    "inventory.edit": "Editar Skin",
    "inventory.remove": "Remover",
    "inventory.sell": "Vender",
    "inventory.duplicate": "Duplicar",
    "inventory.empty": "Seu inventário está vazio",
    "inventory.emptyDesc": "Adicione sua primeira skin para começar a rastrear sua coleção",
    "inventory.noSoldItems": "Você ainda não vendeu nenhum item",
    "inventory.sellItemsDesc": "Quando você vender itens do seu inventário, eles aparecerão aqui",
    
    // Search
    "search.title": "Buscar",
    "search.searchSkins": "Buscar Skins",
    "search.placeholder": "Buscar por nome, arma...",
    "search.filters": "Filtros",
    "search.weapon": "Arma",
    "search.rarity": "Raridade",
    "search.minPrice": "Preço Mínimo",
    "search.maxPrice": "Preço Máximo",
    "search.resetFilters": "Redefinir Filtros",
    "search.noResults": "Nenhuma skin encontrada com esses critérios",
    "search.tryDifferent": "Tente ajustar seus filtros",
    
    // Analytics
    "analytics.title": "Análises",
    "analytics.dashboard": "Painel de Análises",
    "analytics.overview": "Visão Geral",
    "analytics.soldItems": "Itens Vendidos",
    "analytics.trends": "Tendências",
    "analytics.totalItems": "Total de Itens",
    "analytics.totalValue": "Valor Total",
    "analytics.averageValue": "Valor Médio",
    "analytics.valueChange": "Variação em 30d",
    "analytics.rarityDistribution": "Distribuição de Raridade",
    "analytics.recentTransactions": "Transações Recentes",
    "analytics.soldItemsSummary": "Resumo de Itens Vendidos",
    "analytics.itemsSold": "Itens Vendidos",
    "analytics.totalSoldValue": "Valor Total Vendido",
    "analytics.totalProfit": "Lucro Total",
    "analytics.noTransactions": "Nenhuma transação recente",
    "analytics.priceHistory": "Histórico de Preços",
    "analytics.sell": "Venda",
    "analytics.buy": "Compra",
    
    // Profile
    "profile.title": "Perfil",
    "profile.account": "Conta",
    "profile.preferences": "Preferências",
    "profile.subscription": "Assinatura",
    "profile.logout": "Sair",
    
    // Settings
    "settings.title": "Configurações",
    "settings.general": "Geral",
    "settings.appearance": "Aparência",
    "settings.notifications": "Notificações",
    "settings.language": "Idioma",
    "settings.currency": "Moeda",
    
    // Subscription
    "subscription.premium": "Premium",
    "subscription.trial": "Trial",
    "subscription.days": "Dias Restantes",
    "subscription.upgrade": "Atualizar Agora",
    "subscription.premiumFeature": "Recurso Premium",
    "subscription.upgradeToPremium": "Atualizar para Premium",
    "subscription.upgradeToPremiumDesc": "Atualize para Premium para ver gráficos detalhados de histórico de preços",
    
    // Errors
    "errors.loadingError": "Erro ao carregar dados",
    "errors.tryAgain": "Por favor, tente novamente mais tarde",
    "errors.somethingWrong": "Algo deu errado",
    
    // PWA
    "pwa.install": "Adicionar à Tela Inicial",
    "pwa.later": "Lembrar Depois",
    "pwa.understood": "Entendi",
  },
  es: {
    // Common
    "app.name": "CS Skin Vault",
    "app.tagline": "Gestiona tu inventario de skins de CS2 con análisis potentes",
    "common.home": "Inicio",
    "common.add": "Añadir",
    "common.more": "Más",
    "common.refresh": "Actualizar",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.yes": "Sí",
    "common.no": "No",
    
    // Auth
    "auth.login": "Iniciar sesión",
    "auth.signup": "Registrarse",
    "auth.logout": "Cerrar sesión",
    "auth.email": "Email",
    "auth.password": "Contraseña",
    "auth.forgotPassword": "¿Olvidó su contraseña?",
    
    // Dashboard
    "dashboard.title": "Panel",
    "dashboard.welcome": "Bienvenido a CS Skin Vault",
    "dashboard.inventory": "Inventario",
    "dashboard.analytics": "Análisis",
    "dashboard.skins": "Skins",
    "dashboard.value": "Valor Total",
    "dashboard.recentActivity": "Actividad Reciente",
    "dashboard.insights": "Insights",
    "dashboard.topSkins": "Mejores Skins",
    
    // Inventory
    "inventory.title": "Inventario",
    "inventory.current": "Inventario Actual",
    "inventory.sold": "Skins Vendidas",
    "inventory.add": "Añadir Skin",
    "inventory.edit": "Editar Skin",
    "inventory.remove": "Eliminar",
    "inventory.sell": "Vender",
    "inventory.duplicate": "Duplicar",
    "inventory.empty": "Tu inventario está vacío",
    "inventory.emptyDesc": "Añade tu primera skin para empezar a seguir tu colección",
    "inventory.noSoldItems": "Aún no has vendido ningún artículo",
    "inventory.sellItemsDesc": "Cuando vendas artículos de tu inventario, aparecerán aquí",
    
    // Search
    "search.title": "Buscar",
    "search.searchSkins": "Buscar Skins",
    "search.placeholder": "Buscar por nombre, arma...",
    "search.filters": "Filtros",
    "search.weapon": "Arma",
    "search.rarity": "Rareza",
    "search.minPrice": "Precio Mínimo",
    "search.maxPrice": "Precio Máximo",
    "search.resetFilters": "Restablecer Filtros",
    "search.noResults": "No se encontraron skins con estos criterios",
    "search.tryDifferent": "Intenta ajustar tus filtros",
    
    // Analytics
    "analytics.title": "Análisis",
    "analytics.dashboard": "Panel de Análisis",
    "analytics.overview": "Visión General",
    "analytics.soldItems": "Artículos Vendidos",
    "analytics.trends": "Tendencias",
    "analytics.totalItems": "Total de Artículos",
    "analytics.totalValue": "Valor Total",
    "analytics.averageValue": "Valor Promedio",
    "analytics.valueChange": "Cambio en 30d",
    "analytics.rarityDistribution": "Distribución de Rareza",
    "analytics.recentTransactions": "Transacciones Recientes",
    "analytics.soldItemsSummary": "Resumen de Artículos Vendidos",
    "analytics.itemsSold": "Artículos Vendidos",
    "analytics.totalSoldValue": "Valor Total Vendido",
    "analytics.totalProfit": "Beneficio Total",
    "analytics.noTransactions": "No hay transacciones recientes",
    "analytics.priceHistory": "Historial de Precios",
    "analytics.sell": "Venta",
    "analytics.buy": "Compra",
    
    // Profile
    "profile.title": "Perfil",
    "profile.account": "Cuenta",
    "profile.preferences": "Preferencias",
    "profile.subscription": "Suscripción",
    "profile.logout": "Cerrar sesión",
    
    // Settings
    "settings.title": "Configuración",
    "settings.general": "General",
    "settings.appearance": "Apariencia",
    "settings.notifications": "Notificaciones",
    "settings.language": "Idioma",
    "settings.currency": "Moneda",
    
    // Subscription
    "subscription.premium": "Premium",
    "subscription.trial": "Prueba",
    "subscription.days": "Días Restantes",
    "subscription.upgrade": "Actualizar Ahora",
    "subscription.premiumFeature": "Función Premium",
    "subscription.upgradeToPremium": "Actualizar a Premium",
    "subscription.upgradeToPremiumDesc": "Actualiza a Premium para ver gráficos detallados de historial de precios",
    
    // Errors
    "errors.loadingError": "Error al cargar datos",
    "errors.tryAgain": "Por favor, inténtalo de nuevo más tarde",
    "errors.somethingWrong": "Algo salió mal",
    
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
