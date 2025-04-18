const supabaseUrl = "https://pgtasswjcngyxnvpqohm.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndGFzc3dqY25neXhudnBxb2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDEzMTQsImV4cCI6MjA2MDMxNzMxNH0.UFBWw-T1dFiRBIe8VYZilFdyxv-7uXS7suVPxMHa1aQ";
    const client = supabase.createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });

    let usuarioLogado = null;

    // Verifica se o usuário está logado ao abrir a página
    async function checarLogin() {
      const { data, error } = await client.auth.getSession();
      console.log("Usuário logado:", data.session?.user);
      const user = data.session?.user;

      if (!user) {
        alert("Você precisa estar logado.");
        window.location.href = "login.html";
      } else {
        usuarioLogado = user;
        buscarJogosDoUsuario(user.id);
      }
    }

    // Buscar os jogos do usuário
    async function buscarJogosDoUsuario(userId) {
      const { data, error } = await client
        .from("games")
        .select("*")
        .eq("user_id", userId);

      const lista = document.getElementById("lista-jogos");
      lista.innerHTML = "";

      if (error) {
        console.error("Erro ao buscar jogos:", error);
        return;
      }

      data.forEach(jogo => {
        const item = document.createElement("li");
        item.textContent = `${jogo.name} - ${jogo.time_to_finish} - Nota: ${jogo.score}`;
        lista.appendChild(item);
      });
    }

    // Cadastrar jogo
    document.getElementById('formulario').addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('jogo').value;
      const time_to_finish = document.getElementById('tempo').value;
      const score = document.getElementById('nota').value;

      if (!usuarioLogado) {
        alert("Você precisa estar logado.");
        return;
      }

      const { data, error } = await client
        .from('games')
        .insert([
          {
            name,
            time_to_finish,
            score,
            user_id: usuarioLogado.id
          }
        ]);

      if (error) {
        console.error('Erro ao inserir:', error);
        alert('Erro ao salvar o jogo.');
      } else {
        alert('Jogo salvo com sucesso!');
        document.getElementById('formulario').reset();
        buscarJogosDoUsuario(usuarioLogado.id); // Atualiza a lista
      }
    });

    // Logout
    document.getElementById('logout').addEventListener('click', async () => {
      await client.auth.signOut();
      window.location.href = "login.html";
    });

    // Inicia a verificação ao carregar
    checarLogin();