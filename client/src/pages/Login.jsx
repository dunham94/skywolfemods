import { useState } from 'react'
import { User, Lock, LogIn } from 'lucide-react'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (username === 'dunhamleo.trab@gmail.com' && password === 'Leotrab@94') {
      onLogin()
    } else {
      setError('Usuário ou senha incorretos')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] mb-4">
            <Lock className="w-10 h-10 text-[#0a0a0a]" />
          </div>
          <h1 className="gta-font text-3xl font-bold text-[#FFD700] uppercase tracking-wider">
            Login Admin
          </h1>
          <p className="text-gray-500 mt-2">Acesse o painel de administração</p>
        </div>

        <form onSubmit={handleSubmit} className="gta-border rounded-xl overflow-hidden gta-glow">
          <div className="p-8 bg-[#0a0a0a]/50 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-[#FFD700]" />
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="w-full px-4 py-3 rounded-lg border border-[#FFD700]/30 bg-[#1a1a1a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FFD700]" />
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-4 py-3 rounded-lg border border-[#FFD700]/30 bg-[#1a1a1a] text-white placeholder-gray-500 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 gta-gradient text-[#0a0a0a] rounded-lg font-bold transition-all hover:opacity-90 disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login