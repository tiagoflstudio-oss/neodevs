import {
  signIn,
  signUp,
  signOut,
  signInWithProvider
} from './auth.js'

const loginForm = document.getElementById('login-form')
const signupForm = document.getElementById('signup-form')
const messageEl = document.getElementById('message')

function showMessage(msg, isError = false) {
  messageEl.textContent = msg
  messageEl.style.color = isError ? 'red' : 'green'
}

document.getElementById('link-to-signup').addEventListener('click', () => {
  loginForm.style.display = 'none'
  signupForm.style.display = 'block'
  messageEl.textContent = ''
})

document.getElementById('link-to-login').addEventListener('click', () => {
  signupForm.style.display = 'none'
  loginForm.style.display = 'block'
  messageEl.textContent = ''
})

document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value.trim()
  const password = document.getElementById('login-password').value.trim()

  const { data, error } = await signIn(email, password)
  if (error) {
    showMessage(error.message, true)
  } else {
    showMessage('Login realizado com sucesso! Redirecionando...')
    // TODO: Redirecionar para dashboard ou página autenticada
  }
})

document.getElementById('btn-login-google').addEventListener('click', async () => {
  await signInWithProvider('google')
})

document.getElementById('btn-signup').addEventListener('click', async () => {
  const email = document.getElementById('signup-email').value.trim()
  const password = document.getElementById('signup-password').value.trim()
  const userType = document.getElementById('signup-type').value

  const { data, error } = await signUp(email, password, userType)
  if (error) {
    showMessage(error.message, true)
  } else {
    showMessage('Cadastro realizado! Por favor, verifique seu email para confirmar.')
    // TODO: Ocultar formulário ou redirecionar usuário
  }
})
