
import { FC } from "react";
import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Coins, BarChart, Search, Lock, Tag } from "lucide-react";

const LearnPage: FC = () => {
  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Hero Section with Banner */}
        <div className="relative w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>
          <img 
            src="/lovable-uploads/e52a7738-e155-4794-8ff0-b77032603b15.png" 
            alt="CS Skin Vault - O cofre para suas skins" 
            className="w-full h-[500px] object-cover object-center"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center z-20 px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              CS Skin Vault
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-8 drop-shadow-md">
              Seu inventário de skins de Counter-Strike organizado, analisado e valorizado
            </p>
            <Button size="lg" className="bg-primary/90 hover:bg-primary">
              Comece Agora
            </Button>
          </div>
        </div>

        {/* Intro Section */}
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">O que é o CS Skin Vault?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              O CS Skin Vault é uma plataforma completa para colecionadores e investidores de skins de Counter-Strike. 
              Nosso objetivo é oferecer ferramentas precisas para gerenciar seu inventário, acompanhar seus investimentos 
              e tomar decisões informadas sobre suas skins.
            </p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-12 px-4 bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Recursos Principais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                    <Check className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>Gerenciamento de Inventário</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Adicione, remova e organize suas skins. Acompanhe detalhes importantes como condição, StatTrak™, e períodos de trade lock em uma interface intuitiva.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                    <Coins className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>Acompanhamento de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Registre compras, vendas e trocas. Calcule lucros ou prejuízos automaticamente e mantenha um histórico detalhado de todas suas transações.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                    <BarChart className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>Análises e Estatísticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Visualize o valor total do seu inventário, identifique suas skins mais valiosas e obtenha insights sobre o desempenho de seus investimentos ao longo do tempo.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Card 4 */}
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                    <Search className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>Busca e Filtros Avançados</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Encontre skins rapidamente com nossa busca inteligente. Filtre por arma, raridade, coleção, preço e mais para navegar facilmente pelo seu inventário.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Card 5 */}
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                    <Lock className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>Segurança e Privacidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Proteja seus dados com nossa autenticação segura. Seu inventário fica visível apenas para você, garantindo a privacidade de suas informações.
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Card 6 */}
              <Card>
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                    <Tag className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>Suporte Multi-Moeda</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Veja os valores em sua moeda preferida. O CS Skin Vault suporta conversão automática de moedas para acompanhar valores em USD, EUR, BRL e outras moedas.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Como Funciona</h2>
          
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1">
                <span className="text-primary font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Crie sua conta</h3>
                <p className="text-muted-foreground">
                  Comece registrando-se no CS Skin Vault. O processo é rápido e gratuito, permitindo acesso imediato às funcionalidades básicas.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Adicione suas skins</h3>
                <p className="text-muted-foreground">
                  Adicione suas skins ao inventário manualmente ou use nossa ferramenta de busca para encontrar rapidamente os itens que você possui.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1">
                <span className="text-primary font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Acompanhe os valores</h3>
                <p className="text-muted-foreground">
                  Veja o valor total do seu inventário e acompanhe as alterações de preço ao longo do tempo. Registre vendas e calcule seus lucros automaticamente.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1">
                <span className="text-primary font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Obtenha insights</h3>
                <p className="text-muted-foreground">
                  Receba análises e insights sobre seu inventário. Descubra tendências e oportunidades para otimizar seus investimentos em skins.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Features */}
        <section className="py-16 px-4 bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Recursos Premium</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Análises Avançadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500 h-5 w-5" />
                      <span>Histórico detalhado de preços</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500 h-5 w-5" />
                      <span>Previsões de tendências de mercado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500 h-5 w-5" />
                      <span>Exportação de dados em diversos formatos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500 h-5 w-5" />
                      <span>Relatórios personalizados</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Recursos Exclusivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500 h-5 w-5" />
                      <span>Inventário ilimitado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500 h-5 w-5" />
                      <span>Notificações de mudanças significativas de preço</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500 h-5 w-5" />
                      <span>Acesso prioritário a novos recursos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="text-green-500 h-5 w-5" />
                      <span>Suporte dedicado</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Button size="lg" className="bg-primary/90 hover:bg-primary">
                Conheça o Plano Premium
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Comece a organizar seu inventário hoje</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Junte-se à comunidade de colecionadores que confiam no CS Skin Vault para gerenciar seus investimentos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary/90 hover:bg-primary">
                Criar Conta Grátis
              </Button>
              <Button size="lg" variant="outline">
                Saiba Mais
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default LearnPage;
