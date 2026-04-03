export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const SUPABASE_URL = 'https://wipwvjuikcmsmpvqedis.supabase.co'
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpcHd2anVpa2Ntc21wdnFlZGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDM5NjgsImV4cCI6MjA5MDU3OTk2OH0.eG-vZp3w8qeJySAcGtDjB2Gkl_HQyR2Ri9va2QdPnFw'

  const { id, email, nome, tipo, avatar } = req.body

  try {
    // Verificar se usuário já existe
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?id=eq.${id}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    
    const existingUser = await checkResponse.json()
    
    if (existingUser.length > 0) {
      // Usuário já existe, apenas atualizar
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/usuarios?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ email, nome, tipo, avatar })
      })
      
      return res.status(updateResponse.ok ? 200 : 500).json({ success: updateResponse.ok })
    } else {
      // Criar novo usuário
      const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id,
          email,
          nome,
          tipo,
          avatar,
          criado_em: new Date().toISOString()
        })
      })
      
      return res.status(createResponse.ok ? 200 : 500).json({ success: createResponse.ok })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}