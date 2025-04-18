    const supabaseUrl = "https://pgtasswjcngyxnvpqohm.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndGFzc3dqY25neXhudnBxb2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDEzMTQsImV4cCI6MjA2MDMxNzMxNH0.UFBWw-T1dFiRBIe8VYZilFdyxv-7uXS7suVPxMHa1aQ";
    const API_KEY = 'd61db569296c4247ad1c85f44ec188c7';  
    const API_URL = 'https://api.rawg.io/api/games';
    
    let jogoSelecionado = null;
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
        item.classList.add("game-item"); // Adicionando uma classe para estilizar
    
        // Criação do elemento da imagem (capa)
        const imagem = document.createElement("img");
        imagem.src = jogo.image; // Usando a URL da capa
        imagem.alt = jogo.name;
        imagem.classList.add("game-image"); // Adicionando a classe para estilizar a imagem
    
        // Criando os detalhes do jogo
        const detalhes = document.createElement("div");
        detalhes.classList.add("game-details"); // Para organizar os detalhes do jogo
    
        const nome = document.createElement("h3");
        nome.textContent = jogo.name;
    
        const tempo = document.createElement("p");
        tempo.textContent = `Tempo para zerar: ${jogo.time_to_finish} horas`;
    
        const nota = document.createElement("p");
        nota.textContent = `Nota: ${jogo.score}`;
    
        // Adicionando tudo ao item do jogo
        detalhes.appendChild(nome);
        detalhes.appendChild(tempo);
        detalhes.appendChild(nota);
        item.appendChild(imagem);
        item.appendChild(detalhes);
    
        // Adicionando o item completo à lista
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
    
      // NOVO: pega imagem da capa se jogo foi selecionado
      let image = null;
      if (jogoSelecionado && jogoSelecionado.slug) {
        image = await buscarDetalhesDoJogo(jogoSelecionado.slug);
      }
    
      const { data, error } = await client
        .from('games')
        .insert([
          {
            name,
            time_to_finish,
            score,
            user_id: usuarioLogado.id,
            image // NOVO: salva a imagem da capa
          }
        ]);
    
      if (error) {
        console.error('Erro ao inserir:', error);
        alert('Erro ao salvar o jogo.');
      } else {
        alert('Jogo salvo com sucesso!');
        document.getElementById('formulario').reset();
        jogoSelecionado = null; // limpa seleção
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





document.getElementById('jogo').addEventListener('input', async function (e) {
  const nomeDoJogo = e.target.value.trim();
  const suggestionsBox = document.getElementById('suggestions');

  suggestionsBox.innerHTML = '';
  suggestionsBox.style.display = 'none';

  if (nomeDoJogo.length < 3) return;

  const jogos = await buscarJogos(nomeDoJogo);

  if (jogos.length > 0) {
    suggestionsBox.style.display = 'block';
    jogos.forEach(jogo => {
      const div = document.createElement('div');
      div.textContent = jogo.name;
      div.addEventListener('click', () => {
        document.getElementById('jogo').value = jogo.name;
        jogoSelecionado = jogo; // ← aqui guardamos o jogo completo
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'none';
      });
      suggestionsBox.appendChild(div);
    });
  }
});

async function buscarJogos(nomeDoJogo) {
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}&search=${encodeURIComponent(nomeDoJogo)}`);
    const data = await response.json();
    return data.results || []; // Retorna a lista de jogos ou um array vazio
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    return [];
  }
}
async function buscarDetalhesDoJogo(slug) {
  const response = await fetch(`https://api.rawg.io/api/games/${slug}?key=${API_KEY}`);
  const data = await response.json();
  return data.background_image;
}