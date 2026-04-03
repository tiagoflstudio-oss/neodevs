// auth.js
import { supabase } from './supabaseClient.js'

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
  return { data, error }
}

// Login email + senha
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
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
