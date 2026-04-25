import { useEffect, useState } from 'react'
import ProductTable from '../components/ProductTable'
import PriceSummary from '../components/PriceSummary'
import PixGenerator from '../components/PixGenerator'
import WhatsAppButton from '../components/WhatsAppButton'
import { getPixConfig, getProducts } from '../lib/supabase'

function Home() {
  const [products, setProducts] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [pixConfig, setPixConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, pixData] = await Promise.all([
          getProducts(),
          getPixConfig()
        ])

        setProducts(productsData)
        setPixConfig(pixData)
      } catch (err) {
        console.error('Erro ao carregar dados do Supabase:', err)
        setError('Nao foi possivel carregar os dados do Supabase.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleToggleProduct = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    )
  }

  const selectedTotal = products
    .filter(p => selectedIds.includes(p.id))
    .reduce((sum, p) => sum + p.price, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="gta-border rounded-xl p-6 bg-[#1a1a1a] text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <ProductTable
        products={products}
        selectedIds={selectedIds}
        onToggle={handleToggleProduct}
      />

      <PriceSummary
        products={products}
        selectedIds={selectedIds}
      />

      <div className="grid md:grid-cols-2 gap-8">
        <PixGenerator
          pixConfig={pixConfig}
          total={selectedTotal}
          products={products}
          selectedIds={selectedIds}
        />
        <WhatsAppButton
          products={products}
          selectedIds={selectedIds}
          phone={pixConfig?.phone}
        />
      </div>
    </div>
  )
}

export default Home
