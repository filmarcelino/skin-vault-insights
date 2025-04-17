
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Adiciona um handler global para erros não tratados
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Adiciona um handler para promessas não tratadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  console.log("Iniciando a aplicação...");
  const rootElement = document.getElementById("root");
  
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  } else {
    console.error("Elemento root não encontrado no DOM");
  }
} catch (error) {
  console.error("Erro ao renderizar a aplicação:", error);
}
