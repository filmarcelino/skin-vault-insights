
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Camera, Save, Search } from 'lucide-react'
import { useSkinImageAnalysis } from '@/hooks/use-skin-image-analysis'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAddSkin } from '@/hooks/use-skins'
import { SkinDetailModal } from '@/components/skins/skin-detail-modal'
import { useNavigate } from 'react-router-dom'
import { InventoryCard } from '@/components/dashboard/inventory-card'
import { Skin } from '@/types/skin'
import { useToast } from '@/hooks/use-toast'

export const SkinImageAnalyzer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { analyzeSkinImage, isAnalyzing, analysisResult } = useSkinImageAnalysis()
  const addSkinMutation = useAddSkin()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { toast } = useToast()

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

  const handleAddSkin = (skinData: any) => {
    console.log("Adicionando skin com dados:", skinData)
    
    addSkinMutation.mutate({
      skin: skinData,
      purchaseInfo: {
        purchasePrice: skinData.purchasePrice || 0,
        marketplace: skinData.marketplace || "Steam Market",
        feePercentage: skinData.feePercentage || 0,
        notes: skinData.notes || ""
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Skin adicionada",
          description: `${skinData.weapon} | ${skinData.name} foi adicionada ao seu inventário`
        })
        setDetailModalOpen(false)
        navigate("/inventory")
      },
      onError: (error) => {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar a skin ao inventário",
          variant: "destructive"
        })
        console.error("Erro ao adicionar skin:", error)
      }
    })
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
      <Button onClick={triggerFileInput} className="w-full">
        <Camera className="mr-2 h-4 w-4" /> Analisar Skin com Câmera
      </Button>

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
                    
                    {analysisResult.foundSkins.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Clique em uma skin para adicionar ao seu inventário
                      </p>
                    )}
                  </>
                ) : (
                  <Button 
                    onClick={() => handleOpenDetailModal(analysisResult.skinData!)}
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Preencher detalhes e salvar
                  </Button>
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
