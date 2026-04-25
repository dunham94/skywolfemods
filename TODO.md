# TODO - Fix Admin Panel Supabase Error

## Diagnóstico
- A chave Supabase hardcoded (`sb_publishable_kI4M15b1ymAWAXXa0g89Yg_eUn8xY8S`) não é válida (chaves reais começam com `eyJ...`)
- Admin.jsx dispara 4 alerts seguidos quando as chamadas ao Supabase falham
- Não há fallback para quando o Supabase está offline

## Plano de Correção

### Passo 1: Atualizar `client/src/lib/supabase.js`
- [ ] Detectar automaticamente se a chave Supabase é inválida
- [ ] Implementar fallback para localStorage quando Supabase offline
- [ ] Garantir todas as operações CRUD no modo local
- [ ] Manter compatibilidade com .env válido no futuro

### Passo 2: Atualizar `client/src/pages/Admin.jsx`
- [ ] Substituir 4 alerts por estado de erro amigável na tela
- [ ] Adicionar aviso visual "Modo Local Ativo" quando offline
- [ ] Melhorar UX para carregar sem conexão

### Passo 3: Validar
- [ ] Painel admin abre sem erros de alert
- [ ] Produtos, PIX, comprovantes e galeria funcionam no modo local

