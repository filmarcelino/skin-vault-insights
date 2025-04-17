
import { SubscriptionManagement } from "@/components/subscription/subscription-management";

const Subscription = () => {
  return (
    <div className="container py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Assinatura Premium
      </h1>
      
      <p className="text-muted-foreground mb-8 text-center max-w-xl mx-auto">
        Libere todo o potencial do CS Skin Vault com acesso premium. Comece com 3 dias de teste gratuito.
      </p>
      
      <div className="max-w-3xl mx-auto">
        <SubscriptionManagement />
      </div>
      
      <div className="mt-8 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Informações para testes</h2>
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <h3 className="font-medium mb-2 text-primary">Dados de cartão para teste:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="font-medium">Número:</span> 4242 4242 4242 4242
            </li>
            <li className="flex items-center gap-2">
              <span className="font-medium">Data de expiração:</span> Qualquer data futura
            </li>
            <li className="flex items-center gap-2">
              <span className="font-medium">CVV:</span> Qualquer número de 3 dígitos
            </li>
            <li className="flex items-center gap-2">
              <span className="font-medium">Nome:</span> Qualquer nome
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            *Estes dados são apenas para teste. Não será feita nenhuma cobrança real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
