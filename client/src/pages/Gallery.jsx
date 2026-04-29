import { useState, useEffect } from 'react'
import { Image, X } from 'lucide-react'
import { getGalleryImages } from '../lib/supabase'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

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
                <div 
                  key={img.id} 
                  className="aspect-square rounded-lg overflow-hidden border border-[#FFD700]/20 hover:border-[#FFD700]/50 transition-colors cursor-pointer transform hover:scale-105 transition-transform"
                  onClick={() => setSelectedImage(img)}
                >
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

      {/* Modal for enlarged image */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(null)
              }}
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Enlarged image */}
            <img
              src={selectedImage.data}
              alt={selectedImage.name}
              className="w-[960px] h-[760px] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Image name/description */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-lg font-medium bg-black/50 inline-block px-4 py-2 rounded-lg">
                {selectedImage.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
