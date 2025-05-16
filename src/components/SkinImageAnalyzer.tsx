
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Camera, Save, Search, List } from 'lucide-react'
import { useSkinImageAnalysis } from '@/hooks/use-skin-image-analysis'
import { useIsMobile } from '@/hooks/use-mobile'
import { useInventoryActions } from '@/hooks/useInventoryActions'
import { SkinDetailModal } from '@/components/skins/skin-detail-modal'
import { useNavigate } from 'react-router-dom'
import { InventoryCard } from '@/components/dashboard/inventory-card'
import { Skin } from '@/types/skin'
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge'
import { useSkins } from '@/hooks/use-skins'

export const SkinImageAnalyzer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { analyzeSkinImage, isAnalyzing, analysisResult } = useSkinImageAnalysis()
  const { data: allSkins, isLoading: isCategoriesLoading } = useSkins()
  const { handleAddToInventory } = useInventoryActions()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // Extract unique categories
  const categories = React.useMemo(() => {
    if (!allSkins || !Array.isArray(allSkins)) return [];
    return [...new Set(allSkins.map((skin: any) => skin.category).filter(Boolean))];
  }, [allSkins]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result?.toString().split(',')[1]
        if (base64) {
          await analyzeSkinImage(base64)
          setIsOpen(true) // Abrir o modal quando o resultado estiver pronto
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleOpenDetailModal = (skin: Skin) => {
    setSelectedSkin(skin)
    setIsOpen(false)
    setDetailModalOpen(true)
  }

  const handleAddSkin = (skinData: Skin) => {
    console.log("Adicionando skin com dados:", skinData)
    
    handleAddToInventory(skinData);
    
    toast({
      title: "Skin adicionada",
      description: `${skinData.weapon} | ${skinData.name} foi adicionada ao seu inventário`
    });
    
    setDetailModalOpen(false);
    navigate("/inventory");
  }
  
  const toggleCategoriesModal = () => {
    setShowCategories(!showCategories)
  }

  // Apenas mostrar o botão em dispositivos móveis
  if (!isMobile) {
    return null
  }

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        capture="environment"
        onChange={handleFileChange}
        className="hidden" 
      />
      
      <div className="flex flex-col gap-2">
        <Button onClick={triggerFileInput} className="w-full">
          <Camera className="mr-2 h-4 w-4" /> Analisar Skin com Câmera
        </Button>
        
        <Button onClick={toggleCategoriesModal} variant="outline" className="w-full">
          <List className="mr-2 h-4 w-4" /> Ver Categorias Disponíveis
        </Button>
      </div>

      {/* Modal de resultado da análise */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Análise de Skin</DialogTitle>
          </DialogHeader>
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Analisando imagem...</p>
            </div>
          ) : (
            analysisResult && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-medium mb-2">
                    {analysisResult.skinData?.weapon || "Desconhecido"} | {analysisResult.skinData?.name || "Desconhecido"}
                  </h3>
                  <p className="text-sm leading-relaxed">{analysisResult.description}</p>
                </div>
                
                {/* Mostrar as skins encontradas, se houver alguma */}
                {analysisResult.foundSkins && analysisResult.foundSkins.length > 0 ? (
                  <>
                    <h4 className="text-sm font-medium flex items-center">
                      <Search className="h-3.5 w-3.5 mr-1" /> Skins encontradas ({analysisResult.foundSkins.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {analysisResult.foundSkins.slice(0, 4).map((skin) => (
                        <div 
                          key={skin.id} 
                          onClick={() => handleOpenDetailModal(skin)}
                          className="cursor-pointer transition-all hover:scale-[1.02]"
                        >
                          <InventoryCard
                            weaponName={skin.weapon || ""}
                            skinName={skin.name}
                            image={skin.image}
                            rarity={skin.rarity}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Clique em uma skin para adicionar ao seu inventário
                    </p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Nenhuma skin correspondente encontrada no banco de dados.
                    </p>
                    <Button 
                      onClick={() => handleOpenDetailModal(analysisResult.skinData!)}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Preencher detalhes manualmente
                    </Button>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  Fechar
                </Button>
              </div>
            )
          )}
          {analysisResult?.error && (
            <div className="space-y-4">
              <p className="text-red-500">{analysisResult.error}</p>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de categorias */}
      <Dialog open={showCategories} onOpenChange={setShowCategories}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorias Disponíveis</DialogTitle>
          </DialogHeader>
          {isCategoriesLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Carregando categorias...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {categories && categories.length > 0 ? (
                  categories.map((category: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada na API.</p>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Total: {categories?.length || 0} categorias
              </p>
              
              <Button 
                variant="outline" 
                onClick={() => setShowCategories(false)}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes para preenchimento e salvamento */}
      {selectedSkin && (
        <SkinDetailModal 
          skin={selectedSkin}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          onAddSkin={handleAddSkin}
        />
      )}
    </>
  )
}
