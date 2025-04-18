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

  if (error) {
    alert("Erro ao criar conta: " + error.message);
  } else {
    alert("Conta criada com sucesso! Agora é só fazer login.");
  }
});