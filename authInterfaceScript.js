import {
  signIn,
  signUp,
  signOut
} from './auth.js'

const loginForm = document.getElementById('login-form')
const signupForm = document.getElementById('signup-form')
const messageEl = document.getElementById('message')
let currentTipo = 'dev'

function setTipo(tipo) {
  currentTipo = tipo
  document.getElementById('tipo-dev').style.border = tipo === 'dev' ? '2px solid #7c3aed' : '2px solid rgba(255,255,255,0.2)'
  document.getElementById('tipo-dev').style.background = tipo === 'dev' ? 'rgba(124,58,237,0.2)' : 'transparent'
  document.getElementById('tipo-cliente').style.border = tipo === 'cliente' ? '2px solid #7c3aed' : '2px solid rgba(255,255,255,0.2)'
  document.getElementById('tipo-cliente').style.background = tipo === 'cliente' ? 'rgba(124,58,237,0.2)' : 'transparent'
  document.getElementById('signup-type').value = tipo
}

document.getElementById('tipo-dev').addEventListener('click', () => setTipo('dev'))
document.getElementById('tipo-cliente').addEventListener('click', () => setTipo('cliente'))

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

  if (!email || !password) {
    showMessage('Preencha email e senha', true)
    return
  }

  const { data, error } = await signIn(email, password)
  if (error) {
    showMessage('Email ou senha incorretos', true)
  } else {
    showMessage('Login realizado com sucesso!')
    setTimeout(() => window.location.href = 'app.html', 1000)
  }
})

document.getElementById('btn-signup').addEventListener('click', async () => {
  const email = document.getElementById('signup-email').value.trim()
  const password = document.getElementById('signup-password').value.trim()
  const userType = currentTipo

  if (!email || !password) {
    showMessage('Preencha email e senha', true)
    return
  }
  if (password.length < 6) {
    showMessage('Senha deve ter pelo menos 6 caracteres', true)
    return
  }

  const { data, error } = await signUp(email, password, userType)
  if (error) {
    showMessage('Erro ao criar conta. Tente outro email.', true)
  } else {
    showMessage('Cadastro realizado! Por favor, verifique seu email para confirmar.')
  }
})