import { useState, useEffect, useRef } from 'react'
import { Save, Plus, Trash2, Edit2, X, QrCode, Phone, CreditCard, LayoutDashboard, Upload, FileText, Clock, Eye, Download, Image as ImageIcon, Check, WifiOff } from 'lucide-react'
import {
  createProduct,
  createComprovante,
  deleteComprovante,
  deleteGalleryImage,
  deleteProduct,
  getComprovantes,
  getGalleryImages,
  getPixConfig,
  getProducts,
  savePixConfig,
  addGalleryImage,
  updateComprovante,
  updateGalleryImage,
  updateProduct,
  isLocalMode
} from '../lib/supabase'

function Admin() {
  const [products, setProducts] = useState([])
  const [pixConfig, setPixConfig] = useState({ key: '', qrCodeUrl: '', phone: '' })
  const [comprovantes, setComprovantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const fileInputRef = useRef(null)
  const comprovanteInputRef = useRef(null)
  
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadTime, setUploadTime] = useState('00:00:00')
  const [selectedFile, setSelectedFile] = useState(null)
  const [editingComprovante, setEditingComprovante] = useState(null)
  const [viewingComprovante, setViewingComprovante] = useState(null)
  
  const [images, setImages] = useState([])
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const [uploadingImages, setUploadingImages] = useState(0)
  const [editingImage, setEditingImage] = useState(null)
  const [viewingImage, setViewingImage] = useState(null)
  const [uploadNotification, setUploadNotification] = useState('')
  const imageInputRef = useRef(null)

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (saving) {
      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0')
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
        const seconds = String(elapsed % 60).padStart(2, '0')
        setUploadTime(`${hours}:${minutes}:${seconds}`)
        
        setUploadProgress(prev => {
          if (prev < 100) return prev + 10
          return 100
        })
      }, 200)
      return () => clearInterval(interval)
    } else {
      setUploadProgress(0)
      setUploadTime('00:00:00')
    }
  }, [saving])

  const fetchData = async () => {
    const results = await Promise.allSettled([
      getProducts(),
      getPixConfig(),
      getComprovantes(),
      getGalleryImages()
    ])

    const [productsRes, pixRes, comprovantesRes, galleryRes] = results

    if (productsRes.status === 'fulfilled') {
      setProducts(productsRes.value)
    } else {
      console.error('Erro ao carregar produtos:', productsRes.reason)
      alert('Erro ao carregar produtos do Supabase')
    }

    if (pixRes.status === 'fulfilled') {
      setPixConfig(pixRes.value)
    } else {
      console.error('Erro ao carregar config PIX:', pixRes.reason)
      alert('Erro ao carregar configuração PIX do Supabase')
    }

    if (comprovantesRes.status === 'fulfilled') {
      setComprovantes(comprovantesRes.value)
    } else {
      console.error('Erro ao carregar comprovantes:', comprovantesRes.reason)
      alert('Erro ao carregar comprovantes do Supabase')
    }

    if (galleryRes.status === 'fulfilled') {
      setImages(galleryRes.value)
    } else {
      console.error('Erro ao carregar galeria:', galleryRes.reason)
      alert('Erro ao carregar galeria do Supabase')
    }

    setLoading(false)
  }

  const handleUpdateProduct = async (id, updates) => {
    try {
      const updatedProduct = await updateProduct(id, updates)
      setProducts(products.map(p => p.id === id ? updatedProduct : p))
      setEditingProduct(null)
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      alert('Erro ao salvar produto')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) return
    try {
      await deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
    } catch (error) {
      console.error('Erro ao remover produto:', error)
      alert('Erro ao remover produto')
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Preencha pelo menos nome e preço')
      return
    }
    try {
      const createdProduct = await createProduct(newProduct)
      setProducts([...products, createdProduct])
      setNewProduct({ name: '', description: '', price: '' })
      setShowAddForm(false)
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
      alert('Erro ao adicionar produto')
    }
  }

  const handleUpdatePix = async () => {
    setSaving(true)
    try {
      const savedConfig = await savePixConfig(pixConfig)
      setPixConfig(savedConfig)
      alert(isLocalMode ? 'Configuracao PIX salva localmente!' : 'Configuracao PIX salva no Supabase!')
    } catch (error) {
      console.error('Erro ao salvar PIX:', error)
      alert('Erro ao salvar configuração PIX')
    } finally {
      setSaving(false)
    }
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        alert('Apenas arquivos PNG ou JPG são permitidos')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setPixConfig({ ...pixConfig, qrCodeUrl: event.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleComprovanteUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/pdf']
    if (!validTypes.includes(file.type)) {
      alert('Apenas arquivos PNG, JPG ou PDF são permitidos')
      return
    }

    setSelectedFile(file.name)
    setSaving(true)

    try {
      const imageData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const now = new Date()
      const dataHora = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      const novoComprovante = {
        codigoPedido: '',
        nome: file.name,
        telefone: '',
        dataCompra: dataHora,
        imagem: imageData,
        valor: 0,
        produtos: [],
        status: 'pendente'
      }

      const saved = await createComprovante(novoComprovante)
      setComprovantes(prev => [saved, ...prev])
      setSelectedFile(null)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao importar comprovante no Supabase')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteComprovante = async (id) => {
    if (!confirm('Tem certeza que deseja remover este comprovante?')) return
    try {
      await deleteComprovante(id)
      setComprovantes(comprovantes.filter(c => c.id !== id))
    } catch (error) {
      console.error('Erro ao remover comprovante:', error)
    }
  }

  const handleUpdateComprovante = async (id, updates) => {
    try {
      const updatedComprovante = await updateComprovante(id, updates)
      setComprovantes(comprovantes.map(c => c.id === id ? updatedComprovante : c))
      setEditingComprovante(null)
    } catch (error) {
      console.error('Erro ao atualizar comprovante:', error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDate = (date) => {
    if (!date) return ''
    return date
  }

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    let uploadedCount = 0
    let failedCount = 0
    const totalFiles = files.length
    setUploadingImages(totalFiles)

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i]
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4']
      if (!validTypes.includes(file.type)) {
        alert(`Arquivo ${file.name}: Apenas imagens (PNG, JPG, GIF, WebP) ou vídeos MP4 são permitidos`)
        continue
      }

      const tempId = `temp-${Date.now()}-${i}`
      let imageData = ''

      try {
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (event) => resolve(event.target.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        // Optimistic update: adiciona imediatamente na tabela
        const tempImage = { id: tempId, name: file.name, data: imageData }
        setImages(prev => [tempImage, ...prev])

        const newImage = await addGalleryImage({
          name: file.name,
          data: imageData
        })

        // Substitui o temp pelo real do Supabase
        setImages(prev => prev.map(img => img.id === tempId ? newImage : img))
        uploadedCount++
      } catch (error) {
        console.error('Erro ao carregar imagem:', file.name, error)
        // Remove a imagem temporária se falhou
        setImages(prev => prev.filter(img => img.id !== tempId))
        failedCount++
      }

      const progress = Math.round(((uploadedCount + failedCount) / totalFiles) * 100)
      setImageUploadProgress(progress)
    }

    if (uploadedCount > 0) {
      setUploadNotification(`✓ ${uploadedCount} imagem${uploadedCount > 1 ? 'ns' : ''} carregada${uploadedCount > 1 ? 's' : ''} com sucesso!`)
      setTimeout(() => setUploadNotification(''), 3000)
    }
    if (failedCount > 0) {
      alert(`Falha ao enviar ${failedCount} imagem${failedCount > 1 ? 'ns' : ''} para o Supabase. Verifique o console para mais detalhes.`)
    }
    setImageUploadProgress(0)
    setUploadingImages(0)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const handleUpdateImage = async (id, newName) => {
    try {
      const updatedImage = await updateGalleryImage(id, { name: newName })
      setImages(images.map(img => img.id === id ? { ...img, name: updatedImage.name } : img))
      setEditingImage(null)
    } catch (error) {
      console.error('Erro ao atualizar imagem:', error)
      alert('Erro ao atualizar nome da imagem')
    }
  }

  const handleDeleteImage = async (id) => {
    if (!confirm('Tem certeza que deseja remover esta imagem?')) return
    try {
      await deleteGalleryImage(id)
      setImages(images.filter(img => img.id !== id))
    } catch (error) {
      console.error('Erro ao remover imagem:', error)
      alert('Erro ao remover imagem')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {isLocalMode && (
        <div className="gta-border rounded-xl overflow-hidden border-yellow-500/50 bg-yellow-500/10">
          <div className="p-4 flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-bold text-yellow-500">Modo Local Ativo</p>
              <p className="text-sm text-yellow-400/80">
                Os dados estao sendo salvos no navegador (localStorage). Configure uma chave Supabase valida no arquivo .env para sincronizar com a nuvem.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard className="w-8 h-8 text-[#FFD700]" />
        <h1 className="gta-font text-3xl font-bold text-[#FFD700] uppercase tracking-wider">
          Painel Admin
        </h1>
      </div>

      <div className="gta-border rounded-xl overflow-hidden gta-glow">
        <div className="p-6 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-[#00C851]" />
          <h2 className="gta-font text-2xl font-bold text-[#FFD700] uppercase tracking-wider">
            Configuração PIX
          </h2>
        </div>

        <div className="p-6 space-y-4 bg-[#0a0a0a]/50">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chave PIX</label>
              <input
                type="text"
                value={pixConfig.key}
                onChange={(e) => setPixConfig({...pixConfig, key: e.target.value})}
                placeholder="email@exemplo.com ou CPF/CNPJ"
                className="w-full px-4 py-2 rounded-lg border border-[#FFD700]/30 bg-[#1a1a1a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#FFD700]" />
                QR Code PIX
              </label>
              <div className="space-y-2">
                {pixConfig.qrCodeUrl && (
                  <div className="flex justify-center mb-2">
                    <img 
                      src={pixConfig.qrCodeUrl} 
                      alt="QR Code PIX" 
                      className="w-32 h-32 object-contain bg-white p-2 rounded-lg"
                    />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg border border-[#FFD700]/30 bg-[#1a1a1a] text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {pixConfig.qrCodeUrl ? 'Alterar Imagem (PNG/JPG)' : 'Importar Imagem (PNG/JPG)'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FFD700]" />
                WhatsApp (com DDD)
              </label>
              <input
                type="text"
                value={pixConfig.phone}
                onChange={(e) => setPixConfig({...pixConfig, phone: e.target.value})}
                placeholder="5511999999999"
                className="w-full px-4 py-2 rounded-lg border border-[#FFD700]/30 bg-[#1a1a1a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUpdatePix}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 gta-gradient text-[#0a0a0a] rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Configuração PIX'}
            </button>
          </div>
        </div>
      </div>

      <div className="gta-border rounded-xl overflow-hidden gta-glow">
        <div className="p-6 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex justify-between items-center">
          <h2 className="gta-font text-2xl font-bold text-[#FFD700] uppercase tracking-wider">
            Comprovantes Importados
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Data e Hora da Compra</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Produtos</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Comprovante</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#FFD700] uppercase tracking-wider w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFD700]/10 bg-[#0a0a0a]/50">
              {comprovantes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Nenhum comprovante importado ainda
                  </td>
                </tr>
              ) : (
                comprovantes.map((comp) => (
                  <tr key={comp.id} className="hover:bg-[#FFD700]/5 transition-colors">
                    <td className="px-6 py-4">
                      {editingComprovante?.id === comp.id ? (
                        <input
                          type="text"
                          value={editingComprovante.nome}
                          onChange={(e) => setEditingComprovante({...editingComprovante, nome: e.target.value})}
                          className="w-full px-2 py-1 rounded border border-[#FFD700]/30 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#FFD700] outline-none"
                        />
                      ) : (
                        <span className="font-medium text-gray-200">{comp.nome}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingComprovante?.id === comp.id ? (
                        <input
                          type="text"
                          value={editingComprovante.codigoPedido || ''}
                          onChange={(e) => setEditingComprovante({...editingComprovante, codigoPedido: e.target.value})}
                          className="w-full px-2 py-1 rounded border border-[#FFD700]/30 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#FFD700] outline-none"
                        />
                      ) : (
                        <span className="font-mono text-sm text-[#FFD700]">{comp.codigoPedido || 'Sem codigo'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingComprovante?.id === comp.id ? (
                        <input
                          type="text"
                          value={editingComprovante.telefone || ''}
                          onChange={(e) => setEditingComprovante({...editingComprovante, telefone: e.target.value})}
                          className="w-full px-2 py-1 rounded border border-[#FFD700]/30 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#FFD700] outline-none"
                        />
                      ) : (
                        <span className="text-gray-400">{comp.telefone || 'Nao informado'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingComprovante?.id === comp.id ? (
                        <input
                          type="text"
                          value={editingComprovante.dataCompra}
                          onChange={(e) => setEditingComprovante({...editingComprovante, dataCompra: e.target.value})}
                          className="w-full px-2 py-1 rounded border border-[#FFD700]/30 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#FFD700] outline-none"
                        />
                      ) : (
                        <span className="text-gray-400">{formatDate(comp.dataCompra)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingComprovante?.id === comp.id ? (
                        <input
                          type="text"
                          value={editingComprovante.produtos?.join(', ') || ''}
                          onChange={(e) => setEditingComprovante({...editingComprovante, produtos: e.target.value.split(', ')})}
                          className="w-full px-2 py-1 rounded border border-[#FFD700]/30 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#FFD700] outline-none"
                        />
                      ) : (
                        <div className="gta-border rounded-lg p-2 bg-[#1a1a1a]/50 border-[#FFD700]/20 max-h-32 overflow-y-auto">
                          {comp.produtos && comp.produtos.length > 0 ? (
                            <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1">
                              {comp.produtos.map((produto, idx) => (
                                <li key={idx}>{produto}</li>
                              ))}
                            </ol>
                          ) : (
                            <span className="text-gray-500 text-sm">Nenhum</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {comp.imagem ? (
                        <button
                          onClick={() => setViewingComprovante(comp)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30"
                          title="Visualizar comprovante"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm">Sem imagem</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {editingComprovante?.id === comp.id ? (
                          <button
                            onClick={() => handleUpdateComprovante(comp.id, {
                              codigoPedido: editingComprovante.codigoPedido || '',
                              nome: editingComprovante.nome,
                              telefone: editingComprovante.telefone || '',
                              dataCompra: editingComprovante.dataCompra,
                              produtos: editingComprovante.produtos || []
                            })}
                            className="p-2 bg-[#00C851]/20 text-[#00C851] rounded-lg hover:bg-[#00C851]/30 transition-colors border border-[#00C851]/30"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingComprovante({...comp})}
                            className="p-2 bg-[#FFD700]/20 text-[#FFD700] rounded-lg hover:bg-[#FFD700]/30 transition-colors border border-[#FFD700]/30"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComprovante(comp.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="gta-border rounded-xl overflow-hidden gta-glow">
        <div className="p-6 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex justify-between items-center">
          <h2 className="gta-font text-2xl font-bold text-[#FFD700] uppercase tracking-wider">
            Gerenciar Produtos
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 gta-gradient text-[#0a0a0a] rounded-lg font-bold transition-all hover:opacity-90"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? 'Cancelar' : 'Adicionar Produto'}
          </button>
        </div>

        {showAddForm && (
          <div className="p-6 bg-[#1a1a1a] border-b border-[#FFD700]/20">
            <h3 className="gta-font text-lg font-semibold text-[#FFD700] mb-4">Novo Produto</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Nome do produto"
                className="px-4 py-2 rounded-lg border border-[#FFD700]/30 bg-[#0a0a0a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD700] outline-none"
              />
              <input
                type="text"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Descrição"
                className="px-4 py-2 rounded-lg border border-[#FFD700]/30 bg-[#0a0a0a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD700] outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="Preço em Reais"
                  step="0.01"
                  className="flex-1 px-4 py-2 rounded-lg border border-[#FFD700]/30 bg-[#0a0a0a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD700] outline-none"
                />
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 gta-gradient text-[#0a0a0a] rounded-lg font-bold transition-all hover:opacity-90"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Preço</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-[#FFD700] uppercase tracking-wider w-32">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFD700]/10 bg-[#0a0a0a]/50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#FFD700]/5 transition-colors">
                  <td className="px-6 py-4">
                    {editingProduct?.id === product.id ? (
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        className="w-full px-2 py-1 rounded border border-[#FFD700]/30 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#FFD700] outline-none"
                      />
                    ) : (
                      <span className="font-medium text-gray-200">{product.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingProduct?.id === product.id ? (
                      <input
                        type="text"
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                        className="w-full px-2 py-1 rounded border border-[#FFD700]/30 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#FFD700] outline-none"
                      />
                    ) : (
                      <span className="text-gray-400">{product.description}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingProduct?.id === product.id ? (
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                        step="0.01"
                        className="w-32 px-2 py-1 rounded border border-[#FFD700]/30 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#FFD700] outline-none text-right"
                      />
                    ) : (
                      <span className="font-semibold text-[#FFD700]">{formatPrice(product.price)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {editingProduct?.id === product.id ? (
                        <button
                          onClick={() => handleUpdateProduct(product.id, {
                            name: editingProduct.name,
                            description: editingProduct.description,
                            price: editingProduct.price
                          })}
                          className="p-2 bg-[#00C851]/20 text-[#00C851] rounded-lg hover:bg-[#00C851]/30 transition-colors border border-[#00C851]/30"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingProduct({...product})}
                          className="p-2 bg-[#FFD700]/20 text-[#FFD700] rounded-lg hover:bg-[#FFD700]/30 transition-colors border border-[#FFD700]/30"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="gta-border rounded-xl overflow-hidden gta-glow">
        <div className="p-6 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-[#FF6B9D]" />
          <h2 className="gta-font text-2xl font-bold text-[#FFD700] uppercase tracking-wider">
            Gerenciador de Imagens
          </h2>
        </div>

        <div className="p-6 space-y-6 bg-[#0a0a0a]/50">
          <div className="gta-border rounded-lg p-6 bg-[#1a1a1a]/50 border-[#FF6B9D]/30">
            <h3 className="text-lg font-semibold text-[#FFD700] mb-4">Upload de Arquivos</h3>
            
            <div className="flex gap-4 mb-4">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                multiple
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,video/mp4"
                className="hidden"
              />
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-[#FF6B9D]/20 text-[#FF6B9D] rounded-lg hover:bg-[#FF6B9D]/30 transition-colors border border-[#FF6B9D]/30 font-semibold"
              >
                <Upload className="w-5 h-5" />
                Selecionar Arquivos
              </button>

              {uploadingImages > 0 && (
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Carregando {uploadingImages} arquivo{uploadingImages > 1 ? 's' : ''}...</span>
                    <span className="text-[#FFD700]">{imageUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#0a0a0a] rounded-full h-2 border border-[#FF6B9D]/30">
                    <div
                      className="bg-gradient-to-r from-[#FF6B9D] to-[#FFD700] h-full rounded-full transition-all duration-300"
                      style={{ width: `${imageUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {uploadNotification && (
              <div className="flex items-center gap-2 p-3 bg-[#00C851]/20 border border-[#00C851]/30 rounded-lg text-[#00C851]">
                <Check className="w-5 h-5" />
                {uploadNotification}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Nome da Imagem</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-[#FFD700] uppercase tracking-wider">Visualizar</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-[#FFD700] uppercase tracking-wider w-32">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFD700]/10 bg-[#0a0a0a]/50">
                {images.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      Nenhuma imagem enviada ainda
                    </td>
                  </tr>
                ) : (
                  images.map((img) => (
                    <tr key={img.id} className="hover:bg-[#FFD700]/5 transition-colors">
                      <td className="px-6 py-4">
                        {editingImage?.id === img.id ? (
                          <input
                            type="text"
                            value={editingImage.name}
                            onChange={(e) => setEditingImage({...editingImage, name: e.target.value})}
                            className="w-full px-2 py-1 rounded border border-[#FF6B9D]/30 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#FF6B9D] outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-gray-200 break-all">{img.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setViewingImage(img)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/30 mx-auto"
                          title="Visualizar imagem"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {editingImage?.id === img.id ? (
                            <button
                              onClick={() => handleUpdateImage(img.id, editingImage.name)}
                              className="p-2 bg-[#00C851]/20 text-[#00C851] rounded-lg hover:bg-[#00C851]/30 transition-colors border border-[#00C851]/30"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingImage({...img})}
                              className="p-2 bg-[#FFD700]/20 text-[#FFD700] rounded-lg hover:bg-[#FFD700]/30 transition-colors border border-[#FFD700]/30"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewingComprovante && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-xl border border-[#FFD700]/30 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 p-4 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#FFD700]">Comprovante: {viewingComprovante.nome}</h3>
              <button
                onClick={() => setViewingComprovante(null)}
                className="p-1 hover:bg-[#FFD700]/20 rounded transition-colors"
              >
                <X className="w-5 h-5 text-[#FFD700]" />
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <img
                src={viewingComprovante.imagem}
                alt={viewingComprovante.nome}
                className="max-w-full max-h-[70vh] object-contain rounded-lg border border-[#FFD700]/20"
              />
            </div>
          </div>
        </div>
      )}

      {viewingImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-xl border border-[#FFD700]/30 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 p-4 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#FFD700]">Imagem: {viewingImage.name}</h3>
              <button
                onClick={() => setViewingImage(null)}
                className="p-1 hover:bg-[#FFD700]/20 rounded transition-colors"
              >
                <X className="w-5 h-5 text-[#FFD700]" />
              </button>
            </div>
            <div className="p-6 flex justify-center">
              <img
                src={viewingImage.data}
                alt={viewingImage.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg border border-[#FFD700]/20"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
