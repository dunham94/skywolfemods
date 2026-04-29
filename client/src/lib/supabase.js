import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sncyrsvytbzeixnrbytb.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuY3lyc3Z5dGJ6ZWl4bnJieXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzQzMzIsImV4cCI6MjA5MjExMDMzMn0.lKrP4qUXANsg8MKyvRAr3RauLMXaS3hv35gZvUXoY8o'

// Detecta se a chave Supabase é válida (JWT real começa com 'eyJ')
const isValidSupabaseKey = supabaseKey && supabaseKey.startsWith('eyJ') && supabaseKey.length > 50

// Se a chave for inválida, ativa o modo local (localStorage)
export const isLocalMode = !isValidSupabaseKey

if (isLocalMode) {
  console.warn('[Modo Local] Supabase key inválida. Usando localStorage como fallback.')
}

export const supabase = isLocalMode
  ? null
  : createClient(supabaseUrl, supabaseKey)

// ==========================================
// LOCAL STORAGE HELPERS (Fallback)
// ==========================================

const LS_KEYS = {
  products: 'skywolfe_products',
  pix: 'skywolfe_pix',
  comprovantes: 'skywolfe_comprovantes',
  gallery: 'skywolfe_gallery'
}

const defaultProducts = [
  { id: 1, name: 'MLO', description: 'Criação de interior personalizado para o seu servidor (casas, empresas, delegacias, hospitais)', price: 100 },
  { id: 2, name: 'Cenário Externo', description: 'Construção de cenários externos personalizados (ilhas, favelas, bairros, pontos de interesse)', price: 200 },
  { id: 3, name: 'Edição de Cenário', description: 'Modificação e otimização de cenários já existentes no mapa', price: 80 },
  { id: 4, name: 'Livery de Carro', description: 'Pintura personalizada para veículos (viaturas, táxis, empresas, drift)', price: 50 },
  { id: 5, name: 'Edição de Carro', description: 'Modificação de handling, metas, sons e tuning de veículos', price: 100 },
  { id: 6, name: 'Novo Emprego', description: 'Sistema de emprego completo com missões, veículos, roupas e pagamento', price: 250 },
  { id: 7, name: 'Pintura de Roupas', description: 'Criação de roupas personalizadas para o servidor (uniformes, facções, marcas)', price: 60 }
]

const defaultPix = { id: 1, key: 'skypix@gmail.com', qr_code_url: '', phone: '5521998808081' }

function getFromLS(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultValue
  } catch {
    return defaultValue
  }
}

function setToLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function ensureDefaults() {
  if (!localStorage.getItem(LS_KEYS.products)) {
    setToLS(LS_KEYS.products, defaultProducts)
  }
  if (!localStorage.getItem(LS_KEYS.pix)) {
    setToLS(LS_KEYS.pix, defaultPix)
  }
  if (!localStorage.getItem(LS_KEYS.comprovantes)) {
    setToLS(LS_KEYS.comprovantes, [])
  }
  if (!localStorage.getItem(LS_KEYS.gallery)) {
    setToLS(LS_KEYS.gallery, [])
  }
}

if (isLocalMode) {
  ensureDefaults()
}

// ==========================================
// DATA MAPPERS
// ==========================================

const mapPixConfig = (row) => ({
  id: row?.id,
  key: row?.key || '',
  qrCodeUrl: row?.qr_code_url || '',
  phone: row?.phone || ''
})

const mapComprovante = (row) => ({
  id: row.id,
  codigoPedido: row.codigo_pedido || '',
  nome: row.nome,
  telefone: row.telefone || '',
  dataCompra: row.data_compra,
  imagem: row.imagem,
  valor: row.valor,
  produtos: row.produtos || [],
  status: row.status
})

const mapGalleryImage = (row) => ({
  id: row.id,
  name: row.name,
  data: row.image_data || row.data
})

// ==========================================
// PRODUCTS API
// ==========================================

export async function getProducts() {
  if (isLocalMode) {
    return getFromLS(LS_KEYS.products, defaultProducts)
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price')
      .order('id', { ascending: true })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('getProducts error:', err)
    return []
  }
}

export async function createProduct(product) {
  if (isLocalMode) {
    const products = getFromLS(LS_KEYS.products, defaultProducts)
    const newProduct = {
      id: Date.now(),
      name: product.name,
      description: product.description || '',
      price: Number(product.price) || 0
    }
    products.push(newProduct)
    setToLS(LS_KEYS.products, products)
    return newProduct
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name,
        description: product.description || '',
        price: Number(product.price) || 0
      })
      .select('id, name, description, price')
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('createProduct error:', err)
    throw err
  }
}

export async function updateProduct(id, updates) {
  if (isLocalMode) {
    const products = getFromLS(LS_KEYS.products, defaultProducts)
    const index = products.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Produto não encontrado')
    products[index] = {
      ...products[index],
      name: updates.name,
      description: updates.description || '',
      price: Number(updates.price) || 0
    }
    setToLS(LS_KEYS.products, products)
    return products[index]
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description || '',
        price: Number(updates.price) || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, name, description, price')
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('updateProduct error:', err)
    throw err
  }
}

export async function deleteProduct(id) {
  if (isLocalMode) {
    const products = getFromLS(LS_KEYS.products, defaultProducts)
    const filtered = products.filter(p => p.id !== id)
    setToLS(LS_KEYS.products, filtered)
    return
  }

  try {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  } catch (err) {
    console.error('deleteProduct error:', err)
    throw err
  }
}

// ==========================================
// PIX CONFIG API
// ==========================================

export async function getPixConfig() {
  if (isLocalMode) {
    const pix = getFromLS(LS_KEYS.pix, defaultPix)
    return mapPixConfig(pix)
  }

  try {
    const { data, error } = await supabase
      .from('pix_config')
      .select('id, key, qr_code_url, phone')
      .eq('id', 1)
      .maybeSingle()

    if (error) throw error
    return mapPixConfig(data)
  } catch (err) {
    console.error('getPixConfig error:', err)
    return { id: 1, key: '', qrCodeUrl: '', phone: '' }
  }
}

export async function savePixConfig(config) {
  if (isLocalMode) {
    const payload = {
      id: 1,
      key: config.key || '',
      qr_code_url: config.qrCodeUrl || '',
      phone: config.phone || ''
    }
    setToLS(LS_KEYS.pix, payload)
    return mapPixConfig(payload)
  }

  try {
    const payload = {
      id: 1,
      key: config.key || '',
      qr_code_url: config.qrCodeUrl || '',
      phone: config.phone || '',
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('pix_config')
      .upsert(payload)
      .select('id, key, qr_code_url, phone')
      .single()

    if (error) throw error
    return mapPixConfig(data)
  } catch (err) {
    console.error('savePixConfig error:', err)
    throw err
  }
}

// ==========================================
// COMPROVANTES API
// ==========================================

export async function getComprovantes() {
  if (isLocalMode) {
    const data = getFromLS(LS_KEYS.comprovantes, [])
    return data.map(mapComprovante)
  }

  try {
    const { data, error } = await supabase
      .from('comprovantes')
      .select('id, codigo_pedido, nome, telefone, data_compra, imagem, valor, produtos, status')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapComprovante)
  } catch (err) {
    console.error('getComprovantes error:', err)
    return []
  }
}

export async function createComprovante(comprovante) {
  if (isLocalMode) {
    const comprovantes = getFromLS(LS_KEYS.comprovantes, [])
    const novo = {
      id: Date.now(),
      codigo_pedido: comprovante.codigoPedido || '',
      nome: comprovante.nome,
      telefone: comprovante.telefone || '',
      data_compra: comprovante.dataCompra,
      imagem: comprovante.imagem,
      valor: Number(comprovante.valor) || 0,
      produtos: comprovante.produtos || [],
      status: comprovante.status || 'pendente'
    }
    comprovantes.unshift(novo)
    setToLS(LS_KEYS.comprovantes, comprovantes)
    return mapComprovante(novo)
  }

  try {
    const { data, error } = await supabase
      .from('comprovantes')
      .insert({
        codigo_pedido: comprovante.codigoPedido || '',
        nome: comprovante.nome,
        telefone: comprovante.telefone || '',
        data_compra: comprovante.dataCompra,
        imagem: comprovante.imagem,
        valor: Number(comprovante.valor) || 0,
        produtos: comprovante.produtos || [],
        status: comprovante.status || 'pendente'
      })
      .select('id, codigo_pedido, nome, telefone, data_compra, imagem, valor, produtos, status')
      .single()

    if (error) throw error
    return mapComprovante(data)
  } catch (err) {
    console.error('createComprovante error:', err)
    throw err
  }
}

export async function updateComprovante(id, updates) {
  if (isLocalMode) {
    const comprovantes = getFromLS(LS_KEYS.comprovantes, [])
    const index = comprovantes.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Comprovante não encontrado')
    const payload = { ...comprovantes[index] }
    if ('nome' in updates) payload.nome = updates.nome
    if ('codigoPedido' in updates) payload.codigo_pedido = updates.codigoPedido || ''
    if ('telefone' in updates) payload.telefone = updates.telefone || ''
    if ('dataCompra' in updates) payload.data_compra = updates.dataCompra
    if ('produtos' in updates) payload.produtos = updates.produtos || []
    if ('status' in updates) payload.status = updates.status
    comprovantes[index] = payload
    setToLS(LS_KEYS.comprovantes, comprovantes)
    return mapComprovante(payload)
  }

  try {
    const payload = {}

    if ('nome' in updates) payload.nome = updates.nome
    if ('codigoPedido' in updates) payload.codigo_pedido = updates.codigoPedido || ''
    if ('telefone' in updates) payload.telefone = updates.telefone || ''
    if ('dataCompra' in updates) payload.data_compra = updates.dataCompra
    if ('produtos' in updates) payload.produtos = updates.produtos || []
    if ('status' in updates) payload.status = updates.status
    payload.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('comprovantes')
      .update(payload)
      .eq('id', id)
      .select('id, codigo_pedido, nome, telefone, data_compra, imagem, valor, produtos, status')
      .single()

    if (error) throw error
    return mapComprovante(data)
  } catch (err) {
    console.error('updateComprovante error:', err)
    throw err
  }
}

export async function deleteComprovante(id) {
  if (isLocalMode) {
    const comprovantes = getFromLS(LS_KEYS.comprovantes, [])
    const filtered = comprovantes.filter(c => c.id !== id)
    setToLS(LS_KEYS.comprovantes, filtered)
    return
  }

  try {
    const { error } = await supabase.from('comprovantes').delete().eq('id', id)
    if (error) throw error
  } catch (err) {
    console.error('deleteComprovante error:', err)
    throw err
  }
}

// ==========================================
// GALLERY API
// ==========================================

export async function getGalleryImages() {
  if (isLocalMode) {
    const data = getFromLS(LS_KEYS.gallery, [])
    return data.map(mapGalleryImage)
  }

  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('id, name, image_data')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapGalleryImage)
  } catch (err) {
    console.error('getGalleryImages error:', err)
    return []
  }
}

export async function addGalleryImage(image) {
  if (isLocalMode) {
    const images = getFromLS(LS_KEYS.gallery, [])
    const novo = {
      id: Date.now(),
      name: image.name,
      image_data: image.data
    }
    images.unshift(novo)
    setToLS(LS_KEYS.gallery, images)
    return mapGalleryImage(novo)
  }

  try {
    const { data, error } = await supabase
      .from('gallery')
      .insert({
        name: image.name,
        image_data: image.data
      })
      .select('id, name, image_data')
      .single()

    if (error) throw error
    return mapGalleryImage(data)
  } catch (err) {
    console.error('addGalleryImage error:', err)
    throw err
  }
}

export async function updateGalleryImage(id, updates) {
  if (isLocalMode) {
    const images = getFromLS(LS_KEYS.gallery, [])
    const index = images.findIndex(img => img.id === id)
    if (index === -1) throw new Error('Imagem não encontrada')
    images[index].name = updates.name
    setToLS(LS_KEYS.gallery, images)
    return mapGalleryImage(images[index])
  }

  try {
    const { data, error } = await supabase
      .from('gallery')
      .update({
        name: updates.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, name, image_data')
      .single()

    if (error) throw error
    return mapGalleryImage(data)
  } catch (err) {
    console.error('updateGalleryImage error:', err)
    throw err
  }
}

export async function deleteGalleryImage(id) {
  if (isLocalMode) {
    const images = getFromLS(LS_KEYS.gallery, [])
    const filtered = images.filter(img => img.id !== id)
    setToLS(LS_KEYS.gallery, filtered)
    return
  }

  try {
    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (error) throw error
  } catch (err) {
    console.error('deleteGalleryImage error:', err)
    throw err
  }
}
