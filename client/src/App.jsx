import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Gallery from './pages/Gallery'

console.log('App started')

export default function App() {
  const [page, setPage] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('adminLoggedIn') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('adminLoggedIn', isLoggedIn)
  }, [isLoggedIn])

  const handleLogin = () => {
    setIsLoggedIn(true)
    setPage('admin')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPage('home')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-[#0a0a0a] border-b border-[#FFD700]/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between" style={{ minHeight: '185px' }}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-1">
                <img 
                  src="./logo.png" 
                  alt="Logo" 
                  className="w-[135px] h-[170px] object-contain rounded-lg"
                />
              </div>
              <div className="rounded-lg px-3 py-1">
                <h1 className="gta-font text-2xl font-bold text-white uppercase">
                  Skywolfe Mods
                </h1>
                <p className="text-xs text-[#FFD700]/60 tracking-widest uppercase">
                  Orçamento de Mods
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage('home')}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${page === 'home' ? 'gta-gradient text-[#0a0a0a]' : 'text-[#FFD700] hover:bg-[#FFD700]/10 border border-[#FFD700]/30'}`}
              >
                Orçamento
              </button>
              <button
                onClick={() => setPage('gallery')}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${page === 'gallery' ? 'gta-gradient text-[#0a0a0a]' : 'text-[#FFD700] hover:bg-[#FFD700]/10 border border-[#FFD700]/30'}`}
              >
                Galeria
              </button>
            </div>
            <button
              onClick={() => isLoggedIn ? setPage('admin') : setPage('login')}
              className={`rounded-lg font-bold transition-all shadow-lg ${page === 'admin' || page === 'login' ? 'gta-gradient text-[#0a0a0a] shadow-[#FFD700]/50 border border-[#FFD700]/50' : 'bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/40 border-2 border-[#FFD700] hover:shadow-[0_0_20px_rgba(255,215,0,0.6)]'}`}
              style={{ width: '140px', height: '41px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isLoggedIn ? 'Painel Admin' : 'Admin'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {page === 'home' && <Home />}
        {page === 'gallery' && <Gallery />}
        {page === 'login' && <Login onLogin={handleLogin} />}
        {page === 'admin' && isLoggedIn && <Admin />}
      </main>

      <footer className="mt-16 border-t border-[#FFD700]/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
          <p className="text-gray-500 text-sm">
            Skywolfe Mods - Desenvolvimento de mods para GTA V Roleplay
          </p>
          {isLoggedIn && page === 'admin' && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm"
            >
              Sair
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}
