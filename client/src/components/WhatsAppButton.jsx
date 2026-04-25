import { useState } from 'react'
import { MessageCircle, User, Send } from 'lucide-react'

function WhatsAppButton({ products, selectedIds, phone }) {
  const [clientName, setClientName] = useState('')

  const selectedProducts = products.filter(p => selectedIds.includes(p.id))
  const hasSelection = selectedProducts.length > 0

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

const generateMessage = () => {
    const productList = selectedProducts
      .map(p => `*${p.name}* - ${formatPrice(p.price)}`)
      .join('\n')

    const name = clientName.trim() || 'Cliente'

    return `Olá, tudo bem? 👋

Gostei bastante dos produtos e gostaria de solicitar um orçamento, ou entender melhor as condições de negociação, para os seguintes itens que selecionei:

${productList}

Aguardo seu retorno para alinharmos os próximos passos.
_${name}_`
  }

const getWhatsAppUrl = () => {
    if (!phone || !hasSelection) return '#'
    const cleanPhone = phone.replace(/\D/g, '')
    const message = generateMessage()
    const encodedMessage = encodeURIComponent(message)
    return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodedMessage}`
  }

  return (
    <div className="gta-border rounded-xl overflow-hidden gta-glow">
      <div className="p-6 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-[#00C851]" />
        <h2 className="gta-font text-2xl font-bold text-[#FFD700] uppercase tracking-wider">
          Falar no WhatsApp
        </h2>
      </div>

      <div className="p-6 space-y-4 bg-[#0a0a0a]/50">
        {/* Client Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-[#FFD700]" />
            Seu Nome
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Digite seu nome completo"
            className="w-full px-4 py-3 rounded-lg border border-[#FFD700]/30 bg-[#1a1a1a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Message Preview */}
        {hasSelection && (
          <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#FFD700]/10">
            <p className="text-sm font-medium text-[#FFD700] mb-2">Prévia da mensagem:</p>
            <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#FFD700]/10 text-sm text-gray-300 whitespace-pre-line font-mono max-h-40 overflow-y-auto">
              {generateMessage()}
            </div>
          </div>
        )}

        {/* WhatsApp Button */}
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold text-lg transition-all ${hasSelection ? 'gta-gradient text-[#0a0a0a] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' : 'bg-[#1a1a1a] text-gray-500 border border-[#FFD700]/20 cursor-not-allowed'}`}
          onClick={(e) => {
            if (!hasSelection) {
              e.preventDefault()
              alert('Selecione pelo menos um produto para enviar o orçamento!')
            }
            if (!phone) {
              e.preventDefault()
              alert('Configuração do WhatsApp não encontrada!')
            }
          }}
        >
          <Send className="w-5 h-5" />
          {hasSelection ? 'Enviar Orçamento pelo WhatsApp' : 'Selecione produtos primeiro'}
        </a>

        {!hasSelection && (
          <p className="text-center text-sm text-gray-500">
            Marque os produtos na tabela acima para habilitar o envio
          </p>
        )}
      </div>
    </div>
  )
}

export default WhatsAppButton
