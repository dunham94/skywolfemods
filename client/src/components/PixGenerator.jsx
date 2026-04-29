import { useEffect, useState, useRef } from 'react'
import { QrCode, Copy, Check, CreditCard, Upload, Clock } from 'lucide-react'
import { createComprovante } from '../lib/supabase'

function PixGenerator({ pixConfig, total, products = [], selectedIds = [] }) {
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadTime, setUploadTime] = useState('00:00:00')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [codigoPedido, setCodigoPedido] = useState('')

  useEffect(() => {
    if (uploadProgress > 0 && uploadProgress < 100) {
      const interval = setInterval(() => {
        setUploadTime(prev => {
          const parts = prev.split(':').map(Number)
          parts[2]++
          if (parts[2] >= 60) {
            parts[2] = 0
            parts[1]++
          }
          if (parts[1] >= 60) {
            parts[1] = 0
            parts[0]++
          }
          return parts.map(p => p.toString().padStart(2, '0')).join(':')
        })
        setUploadProgress(prev => Math.min(prev + 15, 100))
      }, 200)
      return () => clearInterval(interval)
    }
  }, [uploadProgress])

  const handleCopy = () => {
    if (pixConfig?.key) {
      navigator.clipboard.writeText(pixConfig.key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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
    setUploadProgress(1)

    // Create preview image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target.result)
      }
      reader.readAsDataURL(file)
    }

    // Start progress simulation
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 10
      })
    }, 100)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR')
  }

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const generateOrderCode = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.random().toString(36).slice(2, 7).toUpperCase()
    return `SKY-${year}${month}${day}-${random}`
  }

  if (!pixConfig) {
    return (
      <div className="gta-border rounded-xl p-6 bg-[#1a1a1a]">
        <p className="text-gray-400">Carregando configuração PIX...</p>
      </div>
    )
  }

  const hasQrCode = pixConfig.qrCodeUrl

  return (
    <div className="gta-border rounded-xl overflow-hidden gta-glow">
      <div className="p-6 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex items-center gap-3">
        <CreditCard className="w-6 h-6 text-[#00C851]" />
        <h2 className="gta-font text-2xl font-bold text-[#FFD700] uppercase tracking-wider">
          Pagamento via PIX
        </h2>
      </div>

      <div className="p-6 bg-[#0a0a0a]/50 space-y-4">
        <div className="flex justify-center mb-4">
          {hasQrCode ? (
            <div className="bg-white p-4 rounded-lg border-2 border-[#FFD700]/30">
              <img
                src={pixConfig.qrCodeUrl}
                alt="QR Code PIX"
                className="w-48 h-48 object-contain"
              />
            </div>
          ) : (
            <div className="w-48 h-48 bg-[#1a1a1a] rounded-lg flex items-center justify-center border border-[#FFD700]/20">
              <QrCode className="w-16 h-16 text-[#FFD700]/40" />
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="text-center mb-4">
            <p className="text-gray-400 mb-2">Valor a pagar:</p>
            <p className="text-3xl font-bold text-[#00C851] gta-font">{formatPrice(total)}</p>
          </div>
        )}

        {pixConfig.key && (
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#FFD700]/10">
            <p className="text-sm text-gray-400 mb-2">Chave PIX:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-[#0a0a0a] px-3 py-2 rounded border border-[#FFD700]/20 text-sm font-mono text-[#FFD700] break-all">
                {pixConfig.key}
              </code>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${copied ? 'bg-[#00C851]/20 text-[#00C851]' : 'gta-gradient text-[#0a0a0a] hover:opacity-90'}`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Import Comprovante Frame */}
        <div className="border border-[#FFD700]/20 rounded-lg p-4 bg-[#1a1a1a]">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-4 h-4 text-[#FFD700]" />
            <h3 className="gta-font text-sm font-bold text-[#FFD700] uppercase tracking-wider">
              Importe Seu Comprovante
            </h3>
          </div>

          {/* Preview Image */}
          {previewImage && (
            <div className="mb-3 flex justify-center">
              <img
                src={previewImage}
                alt="Preview"
                className="max-h-32 rounded-lg border border-[#00C851]/30"
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/pdf"
                  onChange={handleComprovanteUpload}
                  className="hidden"
                  id="comprovante-input-px"
                />
                <label
                  htmlFor="comprovante-input-px"
                  className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg border transition-colors cursor-pointer text-sm ${selectedFile ? 'border-[#00C851] bg-[#00C851]/20 text-[#00C851]' : 'border-[#FFD700]/30 bg-[#0a0a0a] text-[#FFD700] hover:bg-[#FFD700]/10'}`}
                >
                  <Upload className="w-4 h-4" />
                  {selectedFile ? 'Arquivo importado!' : 'Importar Comprovante (PNG/JPG/PDF)'}
                </label>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <>
                  <div className="w-20">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#FFD700]/30 bg-[#0a0a0a] text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-mono">{uploadTime}</span>
                    </div>
                  </div>
                  <div className="w-16">
                    <div className="h-2 bg-[#0a0a0a] rounded-lg border border-[#FFD700]/30 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-[#FFD700] mt-0.5">{uploadProgress}%</p>
                  </div>
                </>
              )}
            </div>

            {/* Nome do Cliente */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nome do Cliente</label>
              <input
                type="text"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Digite seu nome"
                className="w-full px-3 py-2 rounded-lg border border-[#FFD700]/30 bg-[#0a0a0a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD700] outline-none text-sm"
              />
            </div>

            {/* Telefone do Cliente */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Seu Telefone</label>
              <input
                type="tel"
                value={telefoneCliente}
                onChange={(e) => setTelefoneCliente(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 rounded-lg border border-[#FFD700]/30 bg-[#0a0a0a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD700] outline-none text-sm"
              />
            </div>

            {/* Botão Pagar */}
            <button
              onClick={async () => {
                if (!selectedFile) {
                  alert('Por favor, importe o comprovante primeiro!')
                  return
                }
                if (!nomeCliente.trim()) {
                  alert('Por favor, digite seu nome!')
                  return
                }
                if (!telefoneCliente.trim()) {
                  alert('Por favor, digite seu telefone!')
                  return
                }
                const telefoneValido = telefoneCliente.replace(/\D/g, '')
                if (telefoneValido.length < 10) {
                  alert('Telefone inválido! Digite o DDD + número')
                  return
                }
                if (!pixConfig?.key) {
                  alert('Chave PIX não configurada. Entre em contato com o administrador.')
                  return
                }

                setEnviando(true)

                // Save comprovante to server
                const inputEl = document.getElementById('comprovante-input-px')
                if (inputEl && inputEl.files && inputEl.files[0]) {
                  const file = inputEl.files[0]
                  const reader = new FileReader()
                  reader.onload = async (event) => {
                    console.log('Enviando comprovante para o servidor...')
                    try {
                      const now = new Date()
                      const dataHora = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
                      const pedido = generateOrderCode()

                      const produtosSelecionados = products.filter(p => selectedIds.includes(p.id)).map(p => p.name)
                      console.log('Produtos selecionados:', produtosSelecionados)

                      const novoComprovante = {
                        codigoPedido: pedido,
                        nome: nomeCliente.trim(),
                        telefone: telefoneCliente.trim(),
                        dataCompra: dataHora,
                        imagem: event.target.result,
                        valor: total,
                        produtos: selectedIds.length > 0 ? selectedIds.map(id => products.find(p => p.id === id)?.name || `ID: ${id}`) : [],
                        status: 'pendente'
                      }
                      console.log('Comprovante preparado:', novoComprovante)
                      await createComprovante(novoComprovante)
                      setCodigoPedido(pedido)
                      setShowModal(true)
                      setTimeout(() => {
                        setShowModal(false)
                        setSelectedFile(null)
                        setPreviewImage(null)
                        setNomeCliente('')
                        setTelefoneCliente('')
                        setCodigoPedido('')
                        setUploadProgress(0)
                        setUploadTime('00:00:00')
                        setEnviando(false)
                        // Reset file input
                        inputEl.value = ''
                      }, 3000)
                    } catch (error) {
                      console.error('Erro ao processar comprovante:', error)
                      alert(`Erro ao enviar comprovante: ${error?.message || 'tente novamente.'}`)
                      setEnviando(false)
                    }
                  }
                  reader.onerror = () => {
                    console.error('Erro ao ler arquivo')
                    setEnviando(false)
                  }
                  reader.readAsDataURL(file)
                } else {
                  alert('Erro ao carregar arquivo. Tente novamente.')
                  setEnviando(false)
                }
              }}
              disabled={enviando || !nomeCliente.trim() || !telefoneCliente.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 gta-gradient text-[#0a0a0a] rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {enviando ? 'Enviando...' : 'Pagar'}
            </button>

            <div className="mt-3 p-3 bg-[#00C851]/10 border border-[#00C851]/30 rounded-lg space-y-2">
              <p className="text-sm text-[#00C851] font-bold">
                🛡️ Garantia de Viabilidade Skywolfe Mods
              </p>
              <p className="text-sm text-[#00C851]">
                Nosso processo é simples, transparente e seguro para o seu bolso:
              </p>
              <p className="text-sm text-[#00C851]">
                <strong>🚀 Início do Projeto:</strong> Você realiza um investimento inicial de apenas 20% do valor total. Esse valor cobre toda a nossa fase de diagnóstico técnico e o início da produção.
              </p>
              <p className="text-sm text-[#00C851]">
                <strong>❌ Se não for possível realizar o serviço:</strong> Caso a gente identifique qualquer limitação técnica, devolvemos os 20% integralmente para você. O risco é todo nosso!
              </p>
              <p className="text-sm text-[#00C851]">
                <strong>✅ Se o projeto for um sucesso:</strong> Após a conclusão e a sua validação, você efetua o pagamento do saldo restante para a entrega final do serviço.
              </p>
            </div>
          </div>
        </div>

        {total > 0 ? (
          <p className="text-center text-sm text-gray-500">
            Escaneie o QR Code ou copie a chave PIX para realizar o pagamento
          </p>
        ) : (
          <p className="text-center text-sm text-gray-500">
            Configure a chave PIX no painel admin para receber pagamentos
          </p>
        )}
      </div>

      {/* Modal de Agradecimento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="gta-border rounded-xl p-12 gta-glow text-center">
            <h2 className="gta-font text-3xl font-bold text-white mb-4">
              Agradecemos pela sua compra!
            </h2>
            <p className="gta-font text-2xl text-[#FFD700]">
              Volte sempre!
            </p>
            {codigoPedido && (
              <div className="mt-6 rounded-lg border border-[#FFD700]/30 bg-[#0a0a0a] px-5 py-4">
                <p className="text-sm text-gray-400 mb-1">Codigo do pedido</p>
                <p className="gta-font text-2xl font-bold text-[#FFD700] tracking-wider">
                  {codigoPedido}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PixGenerator
