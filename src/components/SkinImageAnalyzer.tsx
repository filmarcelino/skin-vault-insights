
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Camera } from 'lucide-react'
import { useSkinImageAnalysis } from '@/hooks/use-skin-image-analysis'
import { useIsMobile } from '@/hooks/use-mobile'

export const SkinImageAnalyzer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { analyzeSkinImage, isAnalyzing, analysisResult } = useSkinImageAnalysis()
  const isMobile = useIsMobile()

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
            analysisResult?.description && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{analysisResult.description}</p>
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
    </>
  )
}
