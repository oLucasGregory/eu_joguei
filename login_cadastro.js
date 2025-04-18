const supabaseUrl = "https://pgtasswjcngyxnvpqohm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndGFzc3dqY25neXhudnBxb2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDEzMTQsImV4cCI6MjA2MDMxNzMxNH0.UFBWw-T1dFiRBIe8VYZilFdyxv-7uXS7suVPxMHa1aQ";
const client = supabase.createClient(supabaseUrl, supabaseKey);

// LOGIN
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Erro ao fazer login: " + error.message);
  } else {
    alert("Login feito com sucesso!");
    window.location.href = "index.html"; // redireciona após login
  }
});

// CADASTRO
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  const { data, error } = await client.auth.signUp({
    email,
    password
  });

  
});


//Limitar senhas
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 20;

document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("signup-email").value.trim();
  const senha = document.getElementById("signup-password").value;
  const messageDiv = document.getElementById("signup-message");

  // Função para exibir a mensagem
  let mensagemTimeout; // variável pra guardar o timeout atual

const mostrarMensagem = (texto, tipo) => {
  const messageDiv = document.getElementById("signup-message");

  // Limpa timeout anterior (se houver)
  clearTimeout(mensagemTimeout);

  messageDiv.textContent = texto;
  messageDiv.className = `message-box ${tipo}`;
  messageDiv.style.display = "block";

  // Esconde depois de 4 segundos
  mensagemTimeout = setTimeout(() => {
    messageDiv.style.opacity = "0";
    setTimeout(() => {
      messageDiv.style.display = "none";
      messageDiv.style.opacity = "1"; // reseta pro próximo uso
    }, 300); // espera o fade-out antes de sumir
  }, 4000);
};

  if (senha.length < MIN_PASSWORD_LENGTH) {
    mostrarMensagem(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`, "error");
    return;
  }

  if (senha.length > MAX_PASSWORD_LENGTH) {
    mostrarMensagem(`A senha não pode ter mais que ${MAX_PASSWORD_LENGTH} caracteres.`, "error");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha
  });

  if (error) {
    mostrarMensagem(`Erro: ${error.message}`, "error");
  } else {
    mostrarMensagem("Cadastro realizado com sucesso! Verifique seu e-mail.", "success");
  }
});