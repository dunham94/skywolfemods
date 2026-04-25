import { Check } from 'lucide-react'

function ProductTable({ products, selectedIds, onToggle }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  return (
    <div className="gta-border rounded-xl overflow-hidden gta-glow">
      <div className="p-6 border-b border-[#FFD700]/20 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a]">
        <h2 className="gta-font text-2xl font-bold text-[#FFD700] uppercase tracking-wider">
          Selecione os Mods
        </h2>
        <p className="text-gray-400 mt-2">Marque os itens que deseja incluir no orçamento</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1a1a1a]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase w-16">
                Selecionar
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase">
                Produto
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#FFD700] uppercase">
                Descrição
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-[#FFD700] uppercase">
                Preço
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FFD700]/10">
            {products.map((product) => {
              const isSelected = selectedIds.includes(product.id)
              return (
                <tr 
                  key={product.id}
                  onClick={() => onToggle(product.id)}
                  className={`cursor-pointer transition-all duration-300 ${isSelected ? 'bg-[#FFD700]/10' : 'hover:bg-[#FFD700]/5'}`}
                >
                  <td className="px-6 py-4">
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#FFD700] border-[#FFD700] shadow-lg shadow-[#FFD700]/30' : 'border-[#FFD700]/40'}`}>
                      {isSelected && <Check className="w-4 h-4 text-[#0a0a0a]" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${isSelected ? 'text-[#FFD700]' : 'text-white'}`}>
                      {product.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {product.description}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#FFD700]">
                    {formatPrice(product.price)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ProductTable
