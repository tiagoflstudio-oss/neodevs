// auth.js
import { supabase } from './supabaseClient.js'

// Sincronizar usuário Supabase com tabela usuarios
async function syncUserToUsuarios(user, userType) {
  try {
    const response = await fetch('/api/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        nome: user.email.split('@')[0],
        tipo: userType,
        avatar: userType === 'dev' ? '🧑‍💻' : '🏢'
      })
    })
    return response.ok
  } catch (e) {
    console.log('Erro ao sincronizar usuário:', e)
    return false
  }
}

// Cadastro com tipo (dev/cliente)
export async function signUp(email, password, userType) {
  const { data, error } = await supabase.auth.signUp(
    {
      email,
      password,
    },
    {
      data: { user_type: userType },
      redirectTo: window.location.origin + '/confirmacao', // opcional
    }
  )
  
  // Sincronizar com tabela usuarios após cadastro
  if (data?.user && !error) {
    await syncUserToUsuarios(data.user, userType)
  }
  
  return { data, error }
}

// Login email + senha
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  
  // Sincronizar com tabela usuarios após login
  if (data?.user && !error) {
    const userType = data.user.user_metadata?.user_type || 'dev'
    await syncUserToUsuarios(data.user, userType)
  }
  
  return { data, error }
}

// Logout
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return error
}

// Reset de senha
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/nova-senha',  // opcional
  })
  return { data, error }
}

// Login social (Google, GitHub)
export async function signInWithProvider(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider })
  return { data, error }
}