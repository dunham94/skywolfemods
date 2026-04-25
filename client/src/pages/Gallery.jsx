import { useState, useEffect } from 'react'
import { Image } from 'lucide-react'
import { getGalleryImages } from '../lib/supabase'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      setLoading(true)
      const imagesData = await getGalleryImages()
      setImages(imagesData)
    } catch (error) {
      console.error('Erro ao carregar imagens:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Image className="w-8 h-8 text-[#FFD700]" />
        <h1 className="gta-font text-3xl font-bold text-[#FFD700] uppercase tracking-wider">
          Galeria
        </h1>
      </div>

      <div className="gta-border rounded-xl overflow-hidden gta-glow">
        <div className="p-6 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a]">
          <h2 className="gta-font text-2xl font-bold text-[#FFD700] uppercase tracking-wider">
            Projetos
          </h2>
        </div>

        <div className="p-8 bg-[#0a0a0a]/50 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center">
              <Image className="w-16 h-16 text-[#FFD700]/30 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Galeria vazia. Adicione imagens no painel Admin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="aspect-square rounded-lg overflow-hidden border border-[#FFD700]/20 hover:border-[#FFD700]/50 transition-colors">
                  <img
                    src={img.data}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
