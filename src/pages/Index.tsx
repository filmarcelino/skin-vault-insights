
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/layout";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se o usuário estiver autenticado, redireciona para o inventário
    if (user) {
      navigate("/inventory");
    } else {
      // Caso contrário, remove o loading
      setLoading(false);
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col min-h-[80vh] justify-center items-center p-4 animate-fade-in">
        <div className="text-center max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            CS Skin Vault
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Seu gerenciador de inventário de skins de Counter-Strike
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate("/auth")}
            >
              Comece Agora
            </Button>
            <Button
              variant="outline" 
              size="lg"
              onClick={() => navigate("/learn")}
            >
              Saiba Mais
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-medium mb-2">Controle Total</h3>
              <p className="text-muted-foreground">
                Gerencie e acompanhe todas suas skins em um só lugar
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Análise de Valor</h3>
              <p className="text-muted-foreground">
                Visualize o valor do seu inventário e analise tendências
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Histórico Completo</h3>
              <p className="text-muted-foreground">
                Acompanhe transações e calcule lucros automaticamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
