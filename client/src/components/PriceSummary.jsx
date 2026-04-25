import { ShoppingCart, DollarSign } from 'lucide-react'

function PriceSummary({ products, selectedIds }) {
  const selectedProducts = products.filter(p => selectedIds.includes(p.id))
  const total = selectedProducts.reduce((sum, p) => sum + p.price, 0)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="gta-border rounded-xl overflow-hidden gta-glow">
      <div className="p-6 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] flex items-center gap-3">
        <ShoppingCart className="w-6 h-6 text-[#FFD700]" />
        <h2 className="gta-font text-2xl font-bold text-[#FFD700] uppercase tracking-wider">
          Resumo do Orçamento
        </h2>
      </div>

      <div className="p-6 bg-[#0a0a0a]/50">
        {selectedProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">Nenhum produto selecionado</p>
            <p className="text-sm mt-1">Marque os itens na tabela acima para ver o resumo</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {selectedProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center py-2 border-b border-[#FFD700]/10 last:border-0">
                  <span className="text-gray-300">{product.name}</span>
                  <span className="font-semibold text-[#FFD700]">{formatPrice(product.price)}</span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[#FFD700]/30 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total do Orçamento:</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#FFD700]" />
                  <span className="text-2xl font-bold text-[#FFD700] gta-font">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PriceSummary
