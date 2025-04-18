    const supabaseUrl = "https://pgtasswjcngyxnvpqohm.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndGFzc3dqY25neXhudnBxb2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDEzMTQsImV4cCI6MjA2MDMxNzMxNH0.UFBWw-T1dFiRBIe8VYZilFdyxv-7uXS7suVPxMHa1aQ";
    const API_KEY = 'd61db569296c4247ad1c85f44ec188c7';  
    const API_URL = 'https://api.rawg.io/api/games';

    let jogosDoUsuario = [];
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
    .eq("user_id", userId)
    .limit(20);

  if (error) {
    console.error("Erro ao buscar jogos:", error);
    return;
  }

  jogosDoUsuario = data; // salva os dados
  exibirJogos(jogosDoUsuario); // mostra todos os jogos inicialmente
}

// Função fora da função async
async function exibirJogos(listaJogos) {
  const lista = document.getElementById("lista-jogos");
  lista.innerHTML = "";

  const contador = document.getElementById("contador-jogos");
  contador.textContent = `🎮 Você tem ${listaJogos.length} jogo${listaJogos.length === 1 ? '' : 's'} cadastrado${listaJogos.length === 1 ? '' : 's'}`;

  // Itera pelos jogos do usuário
  for (const jogo of listaJogos) {
    const item = document.createElement("li");
    item.classList.add("game-item");

    const imagem = document.createElement("img");
    imagem.src = jogo.image;
    imagem.alt = jogo.name;
    imagem.classList.add("game-image");

    const detalhes = document.createElement("div");
    detalhes.classList.add("game-details");

    const nome = document.createElement("h3");
    nome.textContent = jogo.name;

    const tempo = document.createElement("p");
    tempo.textContent = `Tempo para zerar: ${jogo.time_to_finish} horas`;

    // Nota do usuário
    const nota = document.createElement("p");
    nota.textContent = `Sua nota: ${Math.round(jogo.score)}`; // Arredonda para inteiro

    // Criar elemento separado para a média de notas
    const notaMedia = document.createElement("p");
    notaMedia.textContent = "Calculando média...";

    // Buscar média de todos os usuários para esse jogo (mesmo nome)
    try {
      const { data, error } = await client
        .from("games")
        .select("score")
        .eq("name", jogo.name);

      if (error || !data || data.length === 0) {
        notaMedia.textContent = "Média indisponível";
      } else {
        const soma = data.reduce((acc, j) => acc + j.score, 0);
        const media = Math.round(soma / data.length); // Arredonda para inteiro
        notaMedia.textContent = `Nota média: ${media}`;
      }
    } catch (err) {
      notaMedia.textContent = "Erro ao calcular média";
    }

    // Botão de editar
    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.classList.add("edit-button");

    botaoEditar.addEventListener("click", () => {
      const inputTempo = document.createElement("input");
      inputTempo.type = "number";
      inputTempo.value = jogo.time_to_finish;

      const inputNota = document.createElement("input");
      inputNota.type = "number";
      inputNota.value = jogo.score;

      const botaoSalvar = document.createElement("button");
      botaoSalvar.textContent = "Salvar";

      botaoSalvar.addEventListener("click", async () => {
        const novoTempo = parseFloat(inputTempo.value);
        const novaNota = parseFloat(inputNota.value);

        const { error } = await client
          .from("games")
          .update({
            time_to_finish: novoTempo,
            score: novaNota
          })
          .eq("id", jogo.id);

        if (error) {
          console.error("Erro ao atualizar jogo:", error);
          alert("Erro ao atualizar. Tente novamente.");
        } else {
          jogo.time_to_finish = novoTempo;
          jogo.score = novaNota;
          exibirJogos(jogosDoUsuario); // Reexibe com dados atualizados
        }
      });

      detalhes.innerHTML = "";
      detalhes.appendChild(nome);
      detalhes.appendChild(inputTempo);
      detalhes.appendChild(inputNota);
      detalhes.appendChild(botaoSalvar);
    });

    // Botão de excluir
    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.classList.add("delete-button");

    botaoExcluir.addEventListener("click", async () => {
      const confirmacao = confirm(`Tem certeza que deseja excluir "${jogo.name}"?`);
      if (!confirmacao) return;

      const { error } = await client
        .from("games")
        .delete()
        .eq("id", jogo.id);

      if (error) {
        alert("Erro ao excluir. Tente novamente.");
        return;
      }

      // Atualiza a lista localmente
      jogosDoUsuario = jogosDoUsuario.filter(j => j.id !== jogo.id);
      exibirJogos(jogosDoUsuario);
    });

    // Adiciona tudo ao item de lista
    detalhes.appendChild(nome);
    detalhes.appendChild(tempo);
    detalhes.appendChild(nota);
    detalhes.appendChild(notaMedia); // Média de notas
    detalhes.appendChild(botaoEditar);
    detalhes.appendChild(botaoExcluir);

    item.appendChild(imagem);
    item.appendChild(detalhes);
    lista.appendChild(item);
  }
}




// Filtro da busca — só adiciona uma vez
document.getElementById("busca-jogo").addEventListener("input", function () {
  const termo = this.value.toLowerCase();
  const jogosFiltrados = jogosDoUsuario.filter(jogo =>
    jogo.name.toLowerCase().includes(termo)
  );
  exibirJogos(jogosFiltrados);
});

    

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