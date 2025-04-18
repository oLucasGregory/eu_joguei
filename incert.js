// Configurações iniciais
const supabaseUrl = "https://pgtasswjcngyxnvpqohm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndGFzc3dqY25neXhudnBxb2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDEzMTQsImV4cCI6MjA2MDMxNzMxNH0.UFBWw-T1dFiRBIe8VYZilFdyxv-7uXS7suVPxMHa1aQ";
const API_KEY = 'd61db569296c4247ad1c85f44ec188c7';  
const API_URL = 'https://api.rawg.io/api/games';

let jogosDoUsuario = [];
let jogoSelecionado = null;
let usuarioLogado = null;

const client = supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// Verifica se o usuário está logado
async function checarLogin() {
  const { data } = await client.auth.getSession();
  const user = data.session?.user;

  if (!user) {
    alert("Você precisa estar logado.");
    window.location.href = "login.html";
  } else {
    usuarioLogado = user;
    buscarJogosDoUsuario(user.id);
  }
}

// Buscar jogos do usuário
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

  jogosDoUsuario = data;
  exibirJogos(jogosDoUsuario);
}

// Exibir jogos na tela
async function exibirJogos(listaJogos) {
  const lista = document.getElementById("lista-jogos");
  const contador = document.getElementById("contador-jogos");

  lista.innerHTML = "";
  contador.textContent = `🎮 Você tem ${listaJogos.length} jogo${listaJogos.length === 1 ? '' : 's'} cadastrado${listaJogos.length === 1 ? '' : 's'}`;

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

    const nota = document.createElement("p");
    nota.textContent = `Sua nota: ${Math.round(jogo.score)}`;

    const notaMedia = document.createElement("p");
    notaMedia.textContent = "Calculando média...";

    // Buscar média baseada no slug
    try {
      const { data, error } = await client
        .from("games")
        .select("score")
        .eq("slug", jogo.slug);

      if (error || !data || data.length === 0) {
        notaMedia.textContent = "Média indisponível";
      } else {
        const soma = data.reduce((acc, j) => acc + j.score, 0);
        const media = Math.round(soma / data.length);
        notaMedia.textContent = `Nota média: ${media}`;
      }
    } catch (err) {
      notaMedia.textContent = "Erro ao calcular média";
    }

    // Botões
    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.classList.add("edit-button");
    botaoEditar.addEventListener("click", () => abrirEdicao(jogo, detalhes));

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.classList.add("delete-button");
    botaoExcluir.addEventListener("click", () => excluirJogo(jogo.id));

    detalhes.append(nome, tempo, nota, notaMedia, botaoEditar, botaoExcluir);
    item.append(imagem, detalhes);
    lista.appendChild(item);
  }
}

function abrirEdicao(jogo, detalhes) {
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
      .update({ time_to_finish: novoTempo, score: novaNota })
      .eq("id", jogo.id)
      .eq("user_id", usuarioLogado.id); // garante que só atualiza se for o dono
  
    if (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar. Verifique as permissões.");
    } else {
      jogo.time_to_finish = novoTempo;
      jogo.score = novaNota;
      exibirJogos(jogosDoUsuario);
    }
  });
  

  detalhes.innerHTML = "";
  detalhes.append(jogo.name, inputTempo, inputNota, botaoSalvar);
}

async function excluirJogo(id) {
  const confirmacao = confirm("Tem certeza que deseja excluir este jogo?");
  if (!confirmacao) return;

  const { error } = await client
    .from("games")
    .delete()
    .eq("id", id)
    .eq("user_id", usuarioLogado.id); // Certifica que o usuário só pode excluir seus próprios jogos

  if (error) {
    alert("Erro ao excluir. Tente novamente.");
  } else {
    jogosDoUsuario = jogosDoUsuario.filter(j => j.id !== id);
    exibirJogos(jogosDoUsuario);
  }
}

// Busca com autocomplete
const inputBusca = document.getElementById("jogo");
inputBusca.addEventListener("input", async function (e) {
  const nomeDoJogo = e.target.value.trim();
  const suggestionsBox = document.getElementById("suggestions");

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
        inputBusca.value = jogo.name;
        jogoSelecionado = jogo;
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
    return data.results || [];
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

// Cadastro de jogo
const formulario = document.getElementById('formulario');
formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('jogo').value;
  const time_to_finish = document.getElementById('tempo').value;
  const score = document.getElementById('nota').value;

  if (!usuarioLogado) {
    alert("Você precisa estar logado.");
    return;
  }

  let image = null;
  let slug = null;
  if (jogoSelecionado && jogoSelecionado.slug) {
    image = await buscarDetalhesDoJogo(jogoSelecionado.slug);
    slug = jogoSelecionado.slug;
  }

  const { error } = await client
    .from('games')
    .insert([{ name, slug, time_to_finish, score, user_id: usuarioLogado.id, image }]);

  if (error) {
    alert('Erro ao salvar o jogo.');
  } else {
    alert('Jogo salvo com sucesso!');
    formulario.reset();
    jogoSelecionado = null;
    buscarJogosDoUsuario(usuarioLogado.id);
  }
});

// Filtro de busca local
const filtroInput = document.getElementById("busca-jogo");
filtroInput.addEventListener("input", function () {
  const termo = this.value.toLowerCase();
  const jogosFiltrados = jogosDoUsuario.filter(jogo => jogo.name.toLowerCase().includes(termo));
  exibirJogos(jogosFiltrados);
});

// Logout
const botaoLogout = document.getElementById('logout');
botaoLogout.addEventListener('click', async () => {
  await client.auth.signOut();
  window.location.href = "login.html";
});

// Inicia a verificação
checarLogin();
