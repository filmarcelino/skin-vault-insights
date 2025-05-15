import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define supported languages
export type Language = "en" | "pt" | "es";

// Define translations interface
export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
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
    "auth.redirecting_to_login": "Redirecting to login",
    "auth.please_login": "Please sign in to view this page",
    "auth.invalid_credentials": "Invalid login credentials",
    "auth.email_not_confirmed": "Email not confirmed",
    "auth.unexpected_error": "An unexpected error occurred",
    "auth.login_success": "Login successful",
    "auth.welcome_back": "Welcome back!",
    "auth.user_already_registered": "User already registered",
    "auth.signup_success": "Sign up successful",
    "auth.welcome_message": "Welcome to CS Skin Vault!",
    "auth.reset_email_sent": "Reset email sent",
    "auth.reset_email_check_inbox": "Please check your inbox for the password reset link",
    "auth.enter_email_recover": "Enter your email to recover your password",
    "auth.login_to_account": "Login to your account",
    "auth.create_new_account": "Create a new account",
    "auth.remember_me": "Remember me",
    "auth.logging_in": "Logging in...",
    "auth.registering": "Registering...",
    "auth.sending": "Sending...",
    "auth.send_recovery_link": "Send recovery link",
    "auth.username": "Username",
    "auth.username_placeholder": "Enter username",
    "auth.full_name": "Full Name",
    "auth.full_name_placeholder": "Enter your full name",
    "auth.email_placeholder": "Enter your email",
    "auth.city": "City",
    "auth.city_placeholder": "Enter your city",
    "auth.country": "Country",
    "auth.country_placeholder": "Enter your country",
    "auth.preferred_currency": "Preferred Currency",
    "auth.select_currency": "Select a currency",
    "auth.confirm_password": "Confirm Password",
    "auth.trial_notice": "Sign up includes a 7-day free trial of premium features",
    "auth.register": "Register",
    "auth.logout_success": "Logged out successfully",
    "auth.logout_success_description": "You have been logged out from your account",
    "auth.logout_error": "Logout error",
    "auth.logout_error_description": "There was a problem logging you out",
    
    // Validation
    "validation.required": "This field is required",
    "validation.invalid_email": "Please enter a valid email address",
    "validation.password_min_length": "Password must be at least 6 characters",
    "validation.username_min_length": "Username must be at least 3 characters",
    "validation.full_name_required": "Full name is required",
    "validation.passwords_dont_match": "Passwords don't match",
    
    // Currencies
    "currencies.usd": "US Dollar",
    "currencies.brl": "Brazilian Real",
    "currencies.rub": "Russian Ruble",
    "currencies.cny": "Chinese Yuan",
    "currencies.eur": "Euro",
    "currencies.gbp": "British Pound",
    
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
    "dashboard.inventoryDescription": "Manage your inventory of CS2 skins",
    
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
    "inventory.searchPlaceholder": "Search inventory...",
    "inventory.noItems": "Your inventory is empty",
    "inventory.noFilterResults": "No items matched your filters",
    
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
    "search.allSkins": "All Skins",
    "search.item": "item",
    "search.items": "items",
    "search.clear": "Clear search",
    "search.noSkinsAvailable": "No skins available",
    
    // Filters
    "filters.search": "Search",
    "filters.weapon": "Weapon",
    "filters.rarity": "Rarity", 
    "filters.sort": "Sort",
    "filters.weaponType": "Weapon Type",
    "filters.allWeapons": "All Weapons",
    "filters.allRarities": "All Rarities",
    "filters.sortBy": "Sort By",
    "filters.highestValue": "Highest Value",
    "filters.lowestValue": "Lowest Value",
    "filters.nameAZ": "Name (A-Z)",
    "filters.nameZA": "Name (Z-A)",
    "filters.newest": "Newest",
    "filters.oldest": "Oldest",
    "filters.clear": "Clear Filters",
    
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
    
    // Skins
    "skins.details": "Details",
    "skins.additionalInfo": "Additional Info",
    "skins.sell": "Sell",
    "skins.skinDetails": "Skin Details",
    "skins.addToInventory": "Add to Inventory",
    "skins.editSkin": "Edit Skin"
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
    "auth.redirecting_to_login": "Redirecionando para login",
    "auth.please_login": "Por favor, faça login para ver esta página",
    "auth.invalid_credentials": "Credenciais de login inválidas",
    "auth.email_not_confirmed": "Email não confirmado",
    "auth.unexpected_error": "Ocorreu um erro inesperado",
    "auth.login_success": "Login bem-sucedido",
    "auth.welcome_back": "Bem-vindo de volta!",
    "auth.user_already_registered": "Usuário já registrado",
    "auth.signup_success": "Cadastro bem-sucedido",
    "auth.welcome_message": "Bem-vindo ao CS Skin Vault!",
    "auth.reset_email_sent": "Email de redefinição enviado",
    "auth.reset_email_check_inbox": "Verifique sua caixa de entrada para o link de redefinição de senha",
    "auth.enter_email_recover": "Digite seu email para recuperar sua senha",
    "auth.login_to_account": "Entre na sua conta",
    "auth.create_new_account": "Crie uma nova conta",
    "auth.remember_me": "Lembrar-me",
    "auth.logging_in": "Entrando...",
    "auth.registering": "Registrando...",
    "auth.sending": "Enviando...",
    "auth.send_recovery_link": "Enviar link de recuperação",
    "auth.username": "Nome de usuário",
    "auth.username_placeholder": "Digite seu nome de usuário",
    "auth.full_name": "Nome completo",
    "auth.full_name_placeholder": "Digite seu nome completo",
    "auth.email_placeholder": "Digite seu email",
    "auth.city": "Cidade",
    "auth.city_placeholder": "Digite sua cidade",
    "auth.country": "País",
    "auth.country_placeholder": "Digite seu país",
    "auth.preferred_currency": "Moeda preferida",
    "auth.select_currency": "Selecione uma moeda",
    "auth.confirm_password": "Confirmar senha",
    "auth.trial_notice": "O cadastro inclui 7 dias de teste gratuito dos recursos premium",
    "auth.register": "Registrar",
    "auth.logout_success": "Desconectado com sucesso",
    "auth.logout_success_description": "Você foi desconectado da sua conta",
    "auth.logout_error": "Erro ao sair",
    "auth.logout_error_description": "Houve um problema ao desconectar você",
    
    // Validation
    "validation.required": "Este campo é obrigatório",
    "validation.invalid_email": "Por favor, insira um endereço de email válido",
    "validation.password_min_length": "A senha deve ter pelo menos 6 caracteres",
    "validation.username_min_length": "O nome de usuário deve ter pelo menos 3 caracteres",
    "validation.full_name_required": "O nome completo é obrigatório",
    "validation.passwords_dont_match": "As senhas não coincidem",
    
    // Currencies
    "currencies.usd": "Dólar Americano",
    "currencies.brl": "Real Brasileiro",
    "currencies.rub": "Rublo Russo",
    "currencies.cny": "Yuan Chinês",
    "currencies.eur": "Euro",
    "currencies.gbp": "Libra Esterlina",
    
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
    "dashboard.inventoryDescription": "Gerencie seu inventário de skins do CS2",
    
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
    "inventory.searchPlaceholder": "Buscar no inventário...",
    "inventory.noItems": "Seu inventário está vazio",
    "inventory.noFilterResults": "Nenhum item corresponde aos seus filtros",
    
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
    "search.allSkins": "Todas as Skins",
    "search.item": "item",
    "search.items": "itens",
    "search.clear": "Limpar busca",
    "search.noSkinsAvailable": "Nenhuma skin disponível",
    
    // Filters
    "filters.search": "Buscar",
    "filters.weapon": "Arma",
    "filters.rarity": "Raridade", 
    "filters.sort": "Ordenar",
    "filters.weaponType": "Tipo de Arma",
    "filters.allWeapons": "Todas as Armas",
    "filters.allRarities": "Todas as Raridades",
    "filters.sortBy": "Ordenar Por",
    "filters.highestValue": "Maior Valor",
    "filters.lowestValue": "Menor Valor",
    "filters.nameAZ": "Nome (A-Z)",
    "filters.nameZA": "Nome (Z-A)",
    "filters.newest": "Mais Recente",
    "filters.oldest": "Mais Antigo",
    "filters.clear": "Limpar Filtros",
    
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
    "settings.appearance": "Apariência",
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
    "subscription.upgradeToPremiumDesc": "Atualize para Premium para ver gráficos detalhados de historial de preços",
    
    // Errors
    "errors.loadingError": "Erro ao carregar dados",
    "errors.tryAgain": "Por favor, tente novamente mais tarde",
    "errors.somethingWrong": "Algo deu errado",
    
    // PWA
    "pwa.install": "Adicionar à Tela Inicial",
    "pwa.later": "Lembrar Depois",
    "pwa.understood": "Entendi",
    
    // Skins
    "skins.details": "Detalhes",
    "skins.additionalInfo": "Informações Adicionais",
    "skins.sell": "Vender",
    "skins.skinDetails": "Detalhes da Skin",
    "skins.addToInventory": "Adicionar ao Inventário",
    "skins.editSkin": "Editar Skin"
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
    "auth.redirecting_to_login": "Redireccionando al inicio de sesión",
    "auth.please_login": "Por favor, inicie sesión para ver esta página",
    "auth.invalid_credentials": "Credenciales de inicio de sesión inválidas",
    "auth.email_not_confirmed": "Email no confirmado",
    "auth.unexpected_error": "Ocurrió un error inesperado",
    "auth.login_success": "Inicio de sesión exitoso",
    "auth.welcome_back": "¡Bienvenido de nuevo!",
    "auth.user_already_registered": "Usuario ya registrado",
    "auth.signup_success": "Registro exitoso",
    "auth.welcome_message": "¡Bienvenido a CS Skin Vault!",
    "auth.reset_email_sent": "Email de restablecimiento enviado",
    "auth.reset_email_check_inbox": "Por favor, revise su bandeja de entrada para el enlace de restablecimiento de contraseña",
    "auth.enter_email_recover": "Ingrese su email para recuperar su contraseña",
    "auth.login_to_account": "Iniciar sesión en su cuenta",
    "auth.create_new_account": "Crear una nueva cuenta",
    "auth.remember_me": "Recordarme",
    "auth.logging_in": "Iniciando sesión...",
    "auth.registering": "Registrando...",
    "auth.sending": "Enviando...",
    "auth.send_recovery_link": "Enviar enlace de recuperación",
    "auth.username": "Nombre de usuario",
    "auth.username_placeholder": "Ingrese su nombre de usuario",
    "auth.full_name": "Nombre completo",
    "auth.full_name_placeholder": "Ingrese su nombre completo",
    "auth.email_placeholder": "Ingrese su email",
    "auth.city": "Ciudad",
    "auth.city_placeholder": "Ingrese su ciudad",
    "auth.country": "País",
    "auth.country_placeholder": "Ingrese su país",
    "auth.preferred_currency": "Moneda preferida",
    "auth.select_currency": "Seleccione una moneda",
    "auth.confirm_password": "Confirmar contraseña",
    "auth.trial_notice": "El registro incluye una prueba gratuita de 7 días de funciones premium",
    "auth.register": "Registrarse",
    "auth.logout_success": "Sesión cerrada con éxito",
    "auth.logout_success_description": "Has cerrado sesión en tu cuenta",
    "auth.logout_error": "Error al cerrar sesión",
    "auth.logout_error_description": "Hubo un problema al cerrar sesión",
    
    // Validation
    "validation.required": "Este campo es obligatorio",
    "validation.invalid_email": "Por favor, introduce una dirección de email válida",
    "validation.password_min_length": "La contraseña debe tener al menos 6 caracteres",
    "validation.username_min_length": "El nombre de usuario debe tener al menos 3 caracteres",
    "validation.full_name_required": "El nombre completo es obligatorio",
    "validation.passwords_dont_match": "Las contraseñas no coinciden",
    
    // Currencies
    "currencies.usd": "Dólar Estadounidense",
    "currencies.brl": "Real Brasileño",
    "currencies.rub": "Rublo Ruso",
    "currencies.cny": "Yuan Chino",
    "currencies.eur": "Euro",
    "currencies.gbp": "Libra Esterlina",
    
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
    "dashboard.inventoryDescription": "Administra tu inventario de skins de CS2",
    
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
    "inventory.searchPlaceholder": "Buscar en inventario...",
    "inventory.noItems": "Tu inventario está vacío",
    "inventory.noFilterResults": "Ningún elemento coincide con tus filtros",
    
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
    "search.allSkins": "Todas las Skins",
    "search.item": "artículo",
    "search.items": "artículos",
    "search.clear": "Limpiar búsqueda",
    "search.noSkinsAvailable": "No hay skins disponibles",
    
    // Filters
    "filters.search": "Buscar",
    "filters.weapon": "Arma",
    "filters.rarity": "Rareza", 
    "filters.sort": "Ordenar",
    "filters.weaponType": "Tipo de Arma",
    "filters.allWeapons": "Todas las Armas",
    "filters.allRarities": "Todas las Rarezas",
    "filters.sortBy": "Ordenar Por",
    "filters.highestValue": "Mayor Valor",
    "filters.lowestValue": "Menor Valor",
    "filters.nameAZ": "Nombre (A-Z)",
    "filters.nameZA": "Nombre (Z-A)",
    "filters.newest": "Más Reciente",
    "filters.oldest": "Más Antiguo",
    "filters.clear": "Limpiar Filtros",
    
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
    
    // Skins
    "skins.details": "Detalles",
    "skins.additionalInfo": "Información Adicional",
    "skins.sell": "Vender",
    "skins.skinDetails": "Detalles de la Skin",
    "skins.addToInventory": "Añadir al Inventario",
    "skins.editSkin": "Editar Skin"
  }
};

// Language context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

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
