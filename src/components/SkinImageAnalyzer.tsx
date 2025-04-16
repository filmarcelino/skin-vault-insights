
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Camera } from 'lucide-react'
import { useSkinImageAnalysis } from '@/hooks/use-skin-image-analysis'

export const SkinImageAnalyzer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { analyzeSkinImage, isAnalyzing, analysisResult } = useSkinImageAnalysis()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result?.toString().split(',')[1]
        if (base64) {
          await analyzeSkinImage(base64)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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
            <div className="flex justify-center items-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              <p>Analisando imagem...</p>
            </div>
          ) : (
            analysisResult?.description && (
              <div>
                <p>{analysisResult.description}</p>
              </div>
            )
          )}
          {analysisResult?.error && (
            <p className="text-red-500">{analysisResult.error}</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
