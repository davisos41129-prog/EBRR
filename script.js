// SUPABASE CREDENTIALS
const SUPABASE_URL = "https://fsnvfqffyxwkflzgvlgp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbnZmcWZmeXh3a2Zsemd2bGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQxNjYyMzMsImV4cCI6MjEwOTc0MjIzM30.3owmOrB3PjPNYPtYv3zeDC-hq6BYsgo8y5nl63-NB84";

let supabaseClient = null;
if (window.supabase && SUPABASE_URL && !SUPABASE_URL.includes("SUA_URL")) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

let nickname = "";
let currentPassword = "";
let data = null;
let activeSections = { eb: 0, rr: 0, personalizada: 0 };
let timerSeconds = 300, timerInterval = null, timerRunning = false;
let toastTimeout;

const ebPointsTable = [
  { stage:"Instruções do Recrutamento", action:"Aplique o script de recrutamento.", score:"0,5", time:"—", min:"1", max:"1", application:"Obrigatória", instruction:"Teórica" },
  { stage:"Comandos falsos", action:"Aplique comandos falsos.", score:"0,2 (cada)", time:"—", min:"2", max:"4", application:"Obrigatória", instruction:"Prática" },
  { stage:"JJ's", action:"Realize o aquecimento com Jumping Jacks (JJ's).", score:"1,0", time:"—", min:"15", max:"25", application:"Obrigatória", instruction:"Prática" },
  { stage:"Primeiro Parkour", action:"Conduza o primeiro desafio de parkour.", score:"1,0", time:"35–40 segundos", min:"1", max:"1", application:"Obrigatória", instruction:"Prática" },
  { stage:"Segundo Parkour", action:"Conduza o segundo desafio de parkour.", score:"1,0", time:"35–40 segundos", min:"1", max:"1", application:"Obrigatória", instruction:"Prática" },
  { stage:"Terceiro Parkour", action:"Conduza o terceiro desafio de parkour.", score:"1,0", time:"30–35 segundos", min:"1", max:"1", application:"Obrigatória", instruction:"Prática" },
  { stage:"Comando volver", action:"Aplique os comandos volver.", score:"0,5", time:"—", min:"6", max:"12", application:"Obrigatória", instruction:"Prática" },
  { stage:"Avaliação Gramatical", action:"Aplique a avaliação gramatical.", score:"2,0", time:"—", min:"1", max:"1", application:"Obrigatória", instruction:"Escrita" },
  { stage:"Teste de conhecimento", action:"Aplique o teste de conhecimento.", score:"0,2 (cada)", time:"—", min:"1", max:"2", application:"Opcional", instruction:"Escrita" }
];

const defaultData = () => ({
  settings: { displayName: "", pronoun: "ele/dele", customPronoun: "", treatment: "" },
  favorites: [],
  customCategories: [],
  tables: { eb: ebPointsTable, rr: [] },
  sections: {
    eb: [{ name: "Recrutamento", subs: [
      { name: "Portão", phrases: ["Estarei encarregado de recrutá-los.", "Peço que permaneçam em silêncio até eu passar as instruções.", "No momento em que eu abrir o portão, permaneçam na linha amarela, porém não ultrapassem o detector."] },
      { name: "Scanner", phrases: ["Quem eu tocar, passe pelo detector e vá até as linhas brancas ao lado. Permaneçam na linha da frente."] },
      { name: "Formação", phrases: [
        "Irei passar algumas regras e observações sobre o recrutamento. Vocês devem seguir as regras igualmente, sem nenhuma exceção. Todas são importantes.",
        "1 - Sempre, repito, SEMPRE usem a primeira letra da frase maiúscula e, no final, SEMPRE ponham ponto final, exclamação ou interrogação. Foi abatido por isso? EU AVISEI!",
        "1.2 - Serão tolerados somente 3 erros gramaticais. Errou quatro vezes? Abatido.",
        "2 - Gosta de escrever? Não me importa. Sempre que quiser falar, peça PPF! (PPF significa Permissão para Falar).",
        "3 - Para facilitar a comunicação comigo e não causar confusão, vocês devem me chamar de {{TRATAMENTO}}.",
        "3.2 - {{IDENTIDADE}}",
        "3.3 - Sempre que eu fizer perguntas diretas para vocês (exemplo: ‘Alguma dúvida?’), me respondam com ‘Não/Sim, {{TRATAMENTO}}.’",
        "4 - Não obedeça a ninguém que não seja Cabo ou acima, a não ser que eu autorize. Muitos Recrutas atrapalham dando ordens falsas.",
        "5 - Serei totalmente imparcial com relação às regras. Quebrou alguma delas? Perderá pontos ou será abatido, dependendo da regra.",
        "Alguma dúvida?", "Ausência de resposta significa inatividade. Inatividade sem aviso prévio causa reprovação."
      ]},
      { name: "Comandos de formação", phrases: ["FILA ÚNICA!", "SENTIDO!", "PREPARAR PARA MARCHAR!", "MARCHANDO!", "AUTO!", "STS!"] },
      { name: "STS", phrases: ["Para realizar o STS, pelo lado direito você deve dar a volta na formação. Já pela esquerda, você somente entra na primeira linha."] },
      { name: "Script de recrutamento", phrases: [] },
      { name: "Parte dos JJs", phrases: ["Para realizar os JJ's, você sempre deve ativar a opção Auto_JJ's nas configurações e aguardar a ativação. Para fazer os JJ's, você deve enviar ‘UM!’, ‘DOIS!’, ‘TRÊS!’, assim por diante."] },
      { name: "Parkour 1", phrases: ["Regras:", "1 - Nesse parkour vocês terão 35 segundos.", "2 - Sem burlar.", "3 - Caiu? Volte da linha verde.", "Toquei? Linha verde.", "Ao meu disparo."] },
      { name: "Parkour 2", phrases: ["Mesmas regras.", "Toquei? Linha verde.", "Ao meu disparo."] },
      { name: "Parkour 3", phrases: ["Vocês terão 30 segundos para subir a torre.", "Escolham um lado.", "Ao meu disparo.", "Pode descer."] },
      { name: "Comandos Volver", phrases: ["Irei fazer os comandos volver.", "DIREITA VOLVER!", "ESQUERDA VOLVER!", "RETAGUARDA VOLVER!", "CENTRAL FACE!"] },
      { name: "JJ's e correção", phrases: ["Façam 15 JJ's.", "Correção:", "UM! DOIS! TRÊS! QUATRO! CINCO! SEIS! SETE! OITO! NOVE! DEZ! ONZE! DOZE! TREZE! CATORZE! QUINZE! DEZESSEIS! DEZOITO! DEZENOVE! VINTE! VINTE E UM! VINTE E DOIS! VINTE E TRÊS! VINTE E QUATRO! VINTE E CINCO!"] },
      { name: "Texto gramatical", phrases: ["Façam um texto gramatical de, no mínimo, 2 linhas.", "Tema:", "Terminou? Fique de continência."] }
    ]}],
    rr: [{ name: "Triagem", subs: [
      { name: "Portão", phrases: ["Estarei encarregado de conduzir vossa triagem.", "Peço que permaneçam em silêncio até eu passar as instruções.", "No momento em que eu abrir o portão, permaneçam na linha amarela, porém não ultrapassem o detector."] },
      { name: "Scanner", phrases: ["Quem eu tocar, passe pelo detector e vá até as linhas brancas ao lado. Permaneçam na linha da frente."] },
      { name: "Formação", phrases: [
        "Irei passar algumas regras e observações sobre a triagem. Vocês devem seguir as regras igualmente, sem nenhuma exceção. Todas são importantes.",
        "1 - Sempre utilize a gramática. Como assim? Sempre utilize letra maiúscula no início da frase e ponto final no fim.",
        "1.2 - Serão tolerados somente 3 erros gramaticais. Errou quatro vezes? Abatido.",
        "2 - Gosta de escrever? Não me importa. Sempre que quiser falar, peça PPF! (PPF significa Permissão para Falar).",
        "3 - Para facilitar a comunicação comigo e não causar confusão, vocês devem me chamar de {{TRATAMENTO}}.",
        "3.2 - {{IDENTIDADE}}",
        "3.3 - Sempre que eu fizer perguntas diretas para vocês (exemplo: ‘Alguma dúvida?’), me respondam com ‘Não/Sim, {{TRATAMENTO}}.’",
        "4 - Não obedeça a ninguém que não seja Insurgente Matriz ou acima, a não ser que eu autorize.",
        "5 - Serei totalmente imparcial com relação às regras. Quebrou alguma delas? Poderá ser reprovado dependendo da regra.",
        "Alguma dúvida?", "Ausência de resposta significa inatividade. Inatividade sem aviso prévio causa reprovação."
      ]},
      { name: "Comandos de formação", phrases: ["FILA ÚNICA!", "SENTIDO!", "PREPARAR PARA MARCHAR!", "MARCHANDO!", "AUTO!", "STS!"] },
      { name: "STS", phrases: ["Para realizar o STS, pelo lado direito você deve dar a volta na formação. Já pela esquerda, você somente entra na primeira linha."] },
      { name: "Script da triagem", phrases: [] },
      { name: "Script-JJs", phrases: ["Para realizar os JJ's, você sempre deve ativar a opção Auto_JJ's nas configurações e aguardar a ativação. Para fazer os JJ's, você deve enviar ‘UM!’, ‘DOIS!’, ‘TRÊS!’, assim por diante."] },
      { name: "Parkour 1", phrases: ["Regras:", "1 - Nesse parkour vocês terão 35 segundos.", "2 - Sem burlar.", "3 - Caiu? Volte da linha verde.", "Toquei? Linha verde.", "Ao meu disparo."] },
      { name: "Parkour 2", phrases: ["Mesmas regras.", "Toquei? Linha verde.", "Ao meu disparo."] },
      { name: "Parkour 3", phrases: ["Vocês terão 30 segundos para subir a torre.", "Escolham um lado.", "Ao meu disparo.", "Pode descer."] },
      { name: "Comandos Volver", phrases: ["Irei fazer os comandos volver.", "DIREITA VOLVER!", "ESQUERDA VOLVER!", "RETAGUARDA VOLVER!", "CENTRAL FACE!"] },
      { name: "JJ's e correção", phrases: ["Façam 15 JJ's.", "Correção:", "UM! DOIS! TRÊS! QUATRO! CINCO! SEIS! SETE! OITO! NOVE! DEZ! ONZE! DOZE! TREZE! CATORZE! QUINZE! DEZESSEIS! DEZOITO! DEZENOVE! VINTE! VINTE E UM! VINTE E DOIS! VINTE E TRÊS! VINTE E QUATRO! VINTE E CINCO!"] },
      { name: "Texto gramatical", phrases: ["Façam um texto gramatical de, no mínimo, 2 linhas.", "Tema:", "Terminou? Fique de continência."] }
    ]}]
  }
});

function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toastTimeout); toastTimeout = setTimeout(() => el.classList.remove("show"), 2600);
}

// Alternar abas de Login e Cadastro
const tabLogin = $("#tab-login");
const tabRegister = $("#tab-register");
const loginForm = $("#login-form");
const registerForm = $("#register-form");
const authSubtitle = $("#auth-subtitle");

if (tabLogin && tabRegister) {
  tabLogin.addEventListener("click", () => {
    tabLogin.className = "btn primary";
    tabRegister.className = "btn ghost";
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    authSubtitle.textContent = "Entre com seu nickname e senha para acessar seus scripts.";
  });

  tabRegister.addEventListener("click", () => {
    tabRegister.className = "btn primary";
    tabLogin.className = "btn ghost";
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    authSubtitle.textContent = "Crie sua conta gratuita para salvar seus scripts na nuvem.";
  });
}

async function registerUser(userNick, pass) {
  if (!supabaseClient) { alert("Erro de conexão com o Supabase."); return; }
  const key = userNick.trim().toLowerCase();
  toast("Verificando nickname...");

  const { data: existing } = await supabaseClient.from('scripthub_users').select('username').eq('username', key).maybeSingle();
  if (existing) { toast("Este nickname já está em uso!"); return; }

  const fresh = defaultData();
  const { error: insertErr } = await supabaseClient.from('scripthub_users').insert([{ username: key, password: pass, content: fresh, updated_at: new Date().toISOString() }]);
  if (insertErr) { toast("Erro ao criar conta."); return; }

  toast("Conta criada com sucesso!");
  openDashboard(userNick.trim(), pass, fresh);
}

async function loginUser(userNick, pass) {
  if (!supabaseClient) { alert("Erro de conexão com o Supabase."); return; }
  const key = userNick.trim().toLowerCase();
  toast("Entrando...");

  const { data: userRecord, error } = await supabaseClient.from('scripthub_users').select('password, content').eq('username', key).maybeSingle();
  if (error || !userRecord) { toast("Usuário não encontrado!"); return; }
  if (userRecord.password !== pass) { toast("Senha incorreta!"); return; }

  const fresh = defaultData();
  const parsed = userRecord.content || {};
  const loadedData = {
    ...fresh,
    settings: { ...fresh.settings, ...(parsed.settings || {}) },
    favorites: parsed.favorites || [],
    customCategories: parsed.customCategories || [],
    tables: { eb: parsed.tables?.eb || fresh.tables.eb, rr: parsed.tables?.rr || [] },
    sections: {
      eb: Array.isArray(parsed.sections?.eb) ? parsed.sections.eb : fresh.sections.eb,
      rr: Array.isArray(parsed.sections?.rr) ? parsed.sections.rr : fresh.sections.rr
    }
  };

  toast("Login efetuado!");
  openDashboard(userNick.trim(), pass, loadedData);
}

function openDashboard(cleanName, pass, loadedData) {
  nickname = cleanName; currentPassword = pass; data = loadedData;
  $("#login-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#side-nickname").textContent = data.settings.displayName || nickname;
  $("#avatar").textContent = (data.settings.displayName || nickname)[0].toUpperCase();
  renderAll(); navigate("inicio");
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await loginUser($("#login-nickname").value.trim(), $("#login-password").value);
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nick = $("#reg-nickname").value.trim();
    const pass = $("#reg-password").value;
    const confirm = $("#reg-confirm").value;
    if (nick.length < 3) { toast("Nickname muito curto."); return; }
    if (pass.length < 4) { toast("Senha muito curta."); return; }
    if (pass !== confirm) { toast("As senhas não coincidem."); return; }
    await registerUser(nick, pass);
  });
}

async function saveDataToSupabase() {
  if (!supabaseClient || !nickname) return;
  const key = nickname.trim().toLowerCase();
  try {
    await supabaseClient.from('scripthub_users').update({ content: data, updated_at: new Date().toISOString() }).eq('username', key);
  } catch (err) { console.error(err); }
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast("Copiado!"); }
  catch {
    const area = document.createElement("textarea"); area.value = text; document.body.append(area); area.select(); document.execCommand("copy"); area.remove(); toast("Copiado!");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

function navigate(page) {
  $$(".page").forEach(p => p.classList.toggle("active", p.id === "page-" + page));
  $$(".nav-item[data-page]").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  const names = { inicio:"Início", eb:"Exército Brasileiro", rr:"Regimento Rebelde", personalizada:"Personalizada", favoritos:"Favoritos", cronometro:"Cronômetro", configuracoes:"Configurações" };
  $("#page-title").textContent = names[page] || "SCRIPT HUB";
  $("#top-eyebrow").textContent = page === "inicio" ? "PAINEL DE CONTROLE" : "SCRIPT HUB / " + names[page].toUpperCase();
  if (page === "favoritos") renderFavorites();
  if (page === "configuracoes") renderSettings();
  if (page === "personalizada") { renderCustom(); renderCustomTables(); }
  if (page === "eb") { renderSection("eb"); renderPointsTables("eb"); }
  if (page === "rr") { renderSection("rr"); renderPointsTables("rr"); }
}

function renderAll() { 
  renderSection("eb"); renderSection("rr"); renderCustom(); renderFavorites(); renderSettings(); renderPointsTables("eb"); renderPointsTables("rr"); renderCustomTables(); 
}

// ==========================================
// TABELAS DE PONTUAÇÃO
// ==========================================

function tableMarkup(rows, scope, title) {
  const editable = scope.startsWith("custom:") || scope === "rr";
  const body = rows.map((r,i)=>`<tr>
    <td>${escapeHtml(r.stage||"")}</td>
    <td>${escapeHtml(r.action||"")}</td>
    <td>${escapeHtml(r.score||"")}</td>
    <td>${escapeHtml(r.time||"—")}</td>
    <td>${escapeHtml(r.min||"")}</td>
    <td>${escapeHtml(r.max||"")}</td>
    <td>${escapeHtml(r.application||"")}</td>
    <td>${escapeHtml(r.instruction||"")}</td>
    ${editable ? `<td><button class="mini-btn red" data-delete-table-row="${scope}:${i}">Excluir</button></td>` : ""}
  </tr>`).join("");

  return `<section class="points-card">
    <div class="content-head">
      <div>
        <p class="eyebrow">TABELA DE PONTOS</p>
        <h3>${escapeHtml(title)}</h3>
      </div>
      <div class="content-head-actions">
        <button class="mini-btn" data-copy-table="${scope}">Copiar tabela</button>
        ${editable ? `<button class="mini-btn" data-add-table-row="${scope}">＋ Adicionar etapa</button>` : ""}
      </div>
    </div>
    ${rows.length ? `<div class="table-scroll"><table class="points-table"><thead><tr><th>Etapa</th><th>Ação</th><th>Pontuação</th><th>Tempo</th><th>Rep. mín.</th><th>Rep. máx.</th><th>Aplicação</th><th>Instrução</th>${editable?"<th>Gerenciar</th>":""}</tr></thead><tbody>${body}</tbody></table></div>` : `<div class="empty">Nenhuma etapa cadastrada nesta tabela.</div>`}
  </section>`;
}

function renderPointsTables(section) {
  const root = $("#" + section + "-tables-content"); 
  if (!root) return;
  const title = section === "eb" ? "Exército Brasileiro — Recrutamento" : "Regimento Rebelde";
  const addButton = section === "rr" ? `<div class="content-head" style="margin-bottom:10px"><span class="muted small-text">Adicione as etapas da tabela do Regimento quando quiser.</span><button class="btn primary" data-add-table-row="rr">＋ Adicionar etapa</button></div>` : "";
  root.innerHTML = addButton + tableMarkup(data.tables?.[section] || [], section, title);
}

function renderCustomTables() {
  const root = $("#custom-tables-content"); 
  if (!root) return;
  const cats = data.customCategories || [];
  if (!cats.length) { root.innerHTML = ""; return; }
  const i = Math.min(activeSections.personalizada, cats.length - 1);
  const cat = cats[i]; 
  cat.tables = cat.tables || [];
  root.innerHTML = `<div class="content-head" style="margin-top:24px"><div><p class="eyebrow">ÁREA PERSONALIZADA</p><h3>Tabela de pontos — ${escapeHtml(cat.name)}</h3></div><button class="btn primary" data-add-table-row="custom:${i}">＋ Adicionar etapa</button></div>` + tableMarkup(cat.tables, "custom:" + i, cat.name);
}

function tableToText(rows, title) {
  return [title, "ETAPA | AÇÃO | PONTUAÇÃO | TEMPO | REPETIÇÕES MÍN. | REPETIÇÕES MÁX. | APLICAÇÃO | INSTRUÇÃO", ...rows.map(r => [r.stage, r.action, r.score, r.time, r.min, r.max, r.application, r.instruction].join(" | "))].join("\n");
}

function addTableRowModal(scope) {
  openModal("Adicionar etapa na tabela", `
    <label>Etapa</label><input id="t-stage" required placeholder="Ex.: Instruções iniciais">
    <label>Ação</label><input id="t-action" required placeholder="Ex.: Explicar regras">
    <label>Pontuação</label><input id="t-score" required placeholder="Ex.: 1,0">
    <label>Tempo</label><input id="t-time" placeholder="Ex.: 30 segundos ou —">
    <label>Repetições mínimas</label><input id="t-min" placeholder="Ex.: 1">
    <label>Repetições máximas</label><input id="t-max" placeholder="Ex.: 1">
    <label>Aplicação</label><input id="t-app" placeholder="Ex.: Obrigatória">
    <label>Instrução</label><input id="t-inst" placeholder="Ex.: Teórica / Prática">
  `, () => {
    const row = {
      stage: $("#t-stage").value.trim(),
      action: $("#t-action").value.trim(),
      score: $("#t-score").value.trim(),
      time: $("#t-time").value.trim() || "—",
      min: $("#t-min").value.trim() || "1",
      max: $("#t-max").value.trim() || "1",
      application: $("#t-app").value.trim() || "Obrigatória",
      instruction: $("#t-inst").value.trim() || "Prática"
    };
    if (!row.stage) return false;
    if (scope === "rr") {
      data.tables.rr = data.tables.rr || [];
      data.tables.rr.push(row);
    } else if (scope.startsWith("custom:")) {
      const idx = +scope.split(":")[1];
      data.customCategories[idx].tables = data.customCategories[idx].tables || [];
      data.customCategories[idx].tables.push(row);
    }
    saveDataToSupabase(); renderAll(); toast("Etapa adicionada à tabela!");
  });
}

// ==========================================
// FRASES, CATEGORIAS E SUBCATEGORIAS
// ==========================================

function formatPhrase(phrase, section) {
  const pronoun = data.settings.pronoun || "ele/dele";
  const customPronoun = (data.settings.customPronoun || "").trim();
  const treatment = (data.settings.treatment || "").trim() || (section === "rr" ? "Insurgente Matriz" : "Sargento");
  const pronounLabel = pronoun === "custom" ? (customPronoun || "elu/delu") : pronoun;
  let identity = "sou homem, então serão atribuídos a mim adjetivos masculinos.";
  let identityShort = "utilizem pronomes masculinos comigo.";
  if (pronoun === "ela/dela") {
    identity = "sou mulher, então serão atribuídos a mim adjetivos femininos.";
    identityShort = "utilizem pronomes femininos comigo.";
  } else if (pronoun === "elu/delu") {
    identity = "utilizem linguagem neutra comigo.";
    identityShort = "utilizem pronomes neutros comigo.";
  } else if (pronoun === "custom") {
    identity = customPronoun ? `utilizem o pronome ${customPronoun} comigo.` : "utilizem linguagem neutra comigo.";
    identityShort = customPronoun ? `utilizem ${customPronoun} comigo.` : "utilizem pronomes neutros comigo.";
  }

  return String(phrase)
    .replaceAll("{{TRATAMENTO}}", treatment)
    .replaceAll("{{IDENTIDADE}}", identity)
    .replaceAll("{{PRONOME}}", pronounLabel)
    .replaceAll("{{PRONOMES}}", identityShort);
}

function phraseCard(phrase, key, section = "custom") {
  const shownPhrase = formatPhrase(phrase, section);
  const fav = data.favorites.includes(key);

  return `<div class="phrase-card-wrap">
    <div class="phrase">
      <p>${escapeHtml(shownPhrase)}</p>
      <div class="phrase-actions">
        <button title="Copiar" data-copy="${encodeURIComponent(shownPhrase)}">▣</button>
        <button title="${fav?"Remover dos":"Adicionar aos"} favoritos" data-fav="${encodeURIComponent(key)}">${fav?"★":"☆"}</button>
      </div>
    </div>
    <div class="phrase-controls">
      <button class="mini-btn" data-edit-phrase="${key}">Editar</button>
      <button class="mini-btn red" data-delete-phrase="${key}">Excluir</button>
    </div>
  </div>`;
}

function renderSection(section, query="") {
  const root = $("#" + section + "-content");
  if (!root) return;
  const categories = data.sections[section] || [];
  if (!categories.length) { 
    root.innerHTML = `<div class="content-head"><button class="btn primary" data-add-category="${section}">＋ Nova categoria</button></div><div class="empty">Nenhuma categoria cadastrada.</div>`; 
    return; 
  }
  const selected = Math.min(activeSections[section], categories.length - 1);
  activeSections[section] = Math.max(0, selected);
  const category = categories[selected];

  root.innerHTML = `<div class="category-list">
    <div style="margin-bottom: 10px;"><button class="btn primary full" data-add-category="${section}">＋ Nova categoria</button></div>
    ${categories.map((c,i)=>`<button class="category-choice ${i===selected?"active":""}" data-category="${section}" data-index="${i}">${escapeHtml(c.name)} <small>${c.subs.reduce((n,s)=>n+s.phrases.length,0)}</small></button>`).join("")}
  </div>
  <div class="content-panel">
    <div class="content-head">
      <h3>${escapeHtml(category.name)}</h3>
      <div class="content-head-actions">
        <button class="mini-btn" data-add-sub="${section}:${selected}">＋ Subcategoria</button>
        <button class="mini-btn" data-edit-base-cat="${section}:${selected}">Editar</button>
        <button class="mini-btn red" data-delete-base-cat="${section}:${selected}">Excluir</button>
      </div>
    </div>
    <div class="sub-list">
      ${category.subs.map((sub,si)=>`<div class="sub-block"><div class="sub-head"><b>${escapeHtml(sub.name)}</b><div class="content-head-actions"><button class="mini-btn" data-copy-sub="${section}:${selected}:${si}">Copiar bloco</button><button class="mini-btn" data-add-phrase="${section}:${selected}:${si}">＋ Frase</button><button class="mini-btn" data-edit-sub-name="${section}:${selected}:${si}">Editar</button><button class="mini-btn red" data-delete-sub-name="${section}:${selected}:${si}">Excluir</button></div></div>
      ${sub.phrases.filter(p=>p.toLowerCase().includes(query.toLowerCase())).map((phrase,pi)=>phraseCard(phrase,`base:${section}:${selected}:${si}:${pi}`,section)).join("") || (query ? '<p class="muted small-text">Nenhuma frase encontrada.</p>' : '<p class="muted small-text">Ainda não há frases.</p>')}</div>`).join("")}
    </div>
  </div>`;
}

function renderCustom() {
  const root = $("#custom-content"); if (!root) return;
  const cats = data.customCategories;
  if (!cats.length) { root.innerHTML = '<div class="empty">Você ainda não criou categorias. Clique em “Nova categoria” para começar.</div>'; const tr = $("#custom-tables-content"); if (tr) tr.innerHTML = ""; return; }
  const selected = Math.min(activeSections.personalizada, cats.length - 1); activeSections.personalizada = Math.max(0, selected);
  const cat = cats[selected];

  root.innerHTML = `<div class="category-list">${cats.map((c,i)=>`<button class="category-choice ${i===selected?"active":""}" data-category="personalizada" data-index="${i}">${escapeHtml(c.name)} <small>${c.subs.reduce((n,s)=>n+s.phrases.length,0)}</small></button>`).join("")}</div>
  <div class="content-panel"><div class="content-head"><h3>${escapeHtml(cat.name)}</h3><div class="content-head-actions"><button class="mini-btn" data-add-sub="personalizada:${selected}">＋ Subcategoria</button><button class="mini-btn" data-edit-cat="${selected}">Editar</button><button class="mini-btn red" data-delete-cat="${selected}">Excluir</button></div></div>
  <div class="sub-list">${cat.subs.map((sub,si)=>`<div class="sub-block"><div class="sub-head"><b>${escapeHtml(sub.name)}</b><div class="content-head-actions"><button class="mini-btn" data-copy-sub="personalizada:${selected}:${si}">Copiar bloco</button><button class="mini-btn" data-add-phrase="personalizada:${selected}:${si}">＋ Frase</button><button class="mini-btn" data-edit-sub-name="personalizada:${selected}:${si}">Editar</button><button class="mini-btn red" data-delete-sub-name="personalizada:${selected}:${si}">Excluir</button></div></div>
  ${sub.phrases.map((p,pi)=>phraseCard(p,`custom:${selected}:${si}:${pi}`)).join("") || '<p class="muted small-text">Nenhuma frase cadastrada.</p>'}</div>`).join("")}</div></div>`;
  renderCustomTables();
}

function renderFavorites() {
  const root = $("#favorites-content"); if (!root) return;
  const items = [];
  data.favorites.forEach(key => {
    const bits = key.split(":");
    let phrase = "", where = "";
    if (bits[0] === "base") { const [,sec,ci,si,pi] = bits; phrase = data.sections[sec]?.[+ci]?.subs[+si]?.phrases[+pi] || ""; where = sec.toUpperCase(); }
    if (bits[0] === "custom") { const [,ci,si,pi] = bits; phrase = data.customCategories[+ci]?.subs[+si]?.phrases[+pi] || ""; where = "PERSONALIZADA"; }
    if (phrase) { const section = bits[0] === "base" ? bits[1] : "custom"; phrase = formatPhrase(phrase, section); items.push(`<div class="result-item"><div style="flex:1"><small>${where}</small><p>${escapeHtml(phrase)}</p></div><button class="mini-btn" data-copy="${encodeURIComponent(phrase)}">Copiar</button><button class="mini-btn" data-fav="${encodeURIComponent(key)}">★</button></div>`); }
  });
  root.innerHTML = items.join("") || '<div class="empty">Você ainda não favoritou nenhuma frase.</div>';
}

function renderSettings() {
  $("#display-name").value = data.settings.displayName || "";
  $("#pronoun").value = data.settings.pronoun || "ele/dele";
  $("#custom-pronoun").value = data.settings.customPronoun || "";
  if ($("#treatment")) $("#treatment").value = data.settings.treatment || "";
  updateCustomPronounVisibility();
  const shownName = data.settings.displayName || nickname;
  $("#side-nickname").textContent = shownName;
  $("#avatar").textContent = shownName.charAt(0).toUpperCase();
}

function openModal(title, fields, onSave) {
  $("#modal-title").textContent = title; $("#modal-fields").innerHTML = fields;
  $("#modal").classList.remove("hidden");
  $("#modal-form").onsubmit = e => { e.preventDefault(); const result = onSave(); if (result !== false) $("#modal").classList.add("hidden"); };
  const first = $("input,textarea", $("#modal-fields")); if (first) first.focus();
}

$("#modal-close").addEventListener("click", () => $("#modal").classList.add("hidden"));
$("#modal-cancel").addEventListener("click", () => $("#modal").classList.add("hidden"));

function addCategoryModal(sec) {
  openModal("Nova Categoria", `<label>Nome da Categoria</label><input id="modal-cat-name" required maxlength="40">`, () => {
    const name = $("#modal-cat-name").value.trim(); if (!name) return false;
    if (sec === "personalizada") {
      data.customCategories.push({ name, subs: [], tables: [] });
      activeSections.personalizada = data.customCategories.length - 1;
    } else {
      data.sections[sec].push({ name, subs: [] });
      activeSections[sec] = data.sections[sec].length - 1;
    }
    saveDataToSupabase(); renderAll(); toast("Categoria criada!");
  });
}

function addSubcategoryModal(sec, catIndex) {
  openModal("Nova Subcategoria", `<label>Nome da Subcategoria</label><input id="modal-sub-name" required maxlength="40">`, () => {
    const name = $("#modal-sub-name").value.trim(); if (!name) return false;
    if (sec === "personalizada") {
      data.customCategories[catIndex].subs.push({ name, phrases: [] });
    } else {
      data.sections[sec][catIndex].subs.push({ name, phrases: [] });
    }
    saveDataToSupabase(); renderAll(); toast("Subcategoria criada!");
  });
}

function addPhraseModal(sec, catIndex, subIndex) {
  openModal("Nova Frase", `<label>Texto da Frase</label><textarea id="modal-phrase-text" required></textarea>`, () => {
    const text = $("#modal-phrase-text").value.trim(); if (!text) return false;
    if (sec === "personalizada") {
      data.customCategories[catIndex].subs[subIndex].phrases.push(text);
    } else {
      data.sections[sec][catIndex].subs[subIndex].phrases.push(text);
    }
    saveDataToSupabase(); renderAll(); toast("Frase adicionada!");
  });
}

function toggleFavorite(key) {
  const index = data.favorites.indexOf(key); if (index >= 0) data.favorites.splice(index,1); else data.favorites.push(key);
  saveDataToSupabase(); renderAll();
}

function editPhraseByKey(key) {
  const bits = key.split(":");
  let currentText = "";
  if (bits[0] === "base") { const [,sec,ci,si,pi] = bits; currentText = data.sections[sec][+ci].subs[+si].phrases[+pi]; }
  else { const [,ci,si,pi] = bits; currentText = data.customCategories[+ci].subs[+si].phrases[+pi]; }

  openModal("Editar frase", `<label>Texto da frase</label><textarea id="modal-text" required>${escapeHtml(currentText)}</textarea>`, () => {
    const v = $("#modal-text").value.trim(); if (!v) return false;
    if (bits[0] === "base") { const [,sec,ci,si,pi] = bits; data.sections[sec][+ci].subs[+si].phrases[+pi] = v; }
    else { const [,ci,si,pi] = bits; data.customCategories[+ci].subs[+si].phrases[+pi] = v; }
    saveDataToSupabase(); renderAll(); toast("Frase atualizada!");
  });
}

function deletePhraseByKey(key) {
  if (!window.confirm("Excluir esta frase?")) return;
  const bits = key.split(":");
  if (bits[0] === "base") { const [,sec,ci,si,pi] = bits; data.sections[sec][+ci].subs[+si].phrases.splice(+pi, 1); }
  else { const [,ci,si,pi] = bits; data.customCategories[+ci].subs[+si].phrases.splice(+pi, 1); }
  saveDataToSupabase(); renderAll(); toast("Frase excluída!");
}

document.addEventListener("click", e => {
  const nav = e.target.closest("[data-page]"); if (nav) { e.preventDefault(); navigate(nav.dataset.page); return; }
  const copy = e.target.closest("[data-copy]"); if (copy) { copyText(decodeURIComponent(copy.dataset.copy)); return; }
  const fav = e.target.closest("[data-fav]"); if (fav) { toggleFavorite(decodeURIComponent(fav.dataset.fav)); return; }

  const editP = e.target.closest("[data-edit-phrase]"); if (editP) { editPhraseByKey(editP.dataset.editPhrase); return; }
  const delP = e.target.closest("[data-delete-phrase]"); if (delP) { deletePhraseByKey(delP.dataset.deletePhrase); return; }

  const addCat = e.target.closest("[data-add-category]"); if (addCat) { addCategoryModal(addCat.dataset.addCategory); return; }
  const addSub = e.target.closest("[data-add-sub]"); if (addSub) { const [sec, ci] = addSub.dataset.addSub.split(":"); addSubcategoryModal(sec, +ci); return; }
  const addPhrase = e.target.closest("[data-add-phrase]"); if (addPhrase) { const [sec, ci, si] = addPhrase.dataset.addPhrase.split(":"); addPhraseModal(sec, +ci, +si); return; }

  const addCustomCatBtn = $("#add-category");
  if (e.target === addCustomCatBtn) { addCategoryModal("personalizada"); return; }

  // Tabelas: Copiar, Adicionar Etapa, Excluir Etapa
  const copyTable = e.target.closest("[data-copy-table]");
  if (copyTable) {
    const scope = copyTable.dataset.copyTable;
    if (scope === "eb") copyText(tableToText(data.tables.eb, "Exército Brasileiro"));
    else if (scope === "rr") copyText(tableToText(data.tables.rr, "Regimento Rebelde"));
    else if (scope.startsWith("custom:")) {
      const idx = +scope.split(":")[1];
      copyText(tableToText(data.customCategories[idx].tables || [], data.customCategories[idx].name));
    }
    return;
  }

  const addTableRow = e.target.closest("[data-add-table-row]");
  if (addTableRow) { addTableRowModal(addTableRow.dataset.addTableRow); return; }

  const delTableRow = e.target.closest("[data-delete-table-row]");
  if (delTableRow) {
    if (!window.confirm("Excluir esta etapa da tabela?")) return;
    const parts = delTableRow.dataset.deleteTableRow.split(":");
    if (parts[0] === "rr") {
      data.tables.rr.splice(+parts[1], 1);
    } else if (parts[0] === "custom") {
      data.customCategories[+parts[1]].tables.splice(+parts[2], 1);
    }
    saveDataToSupabase(); renderAll(); toast("Etapa removida!");
    return;
  }

  // Resetar Falas Padrão
  const resetEb = e.target.closest("#reset-eb"); if (resetEb) { resetSectionToDefault("eb"); return; }
  const resetRr = e.target.closest("#reset-rr"); if (resetRr) { resetSectionToDefault("rr"); return; }

  const category = e.target.closest("[data-category]"); 
  if (category) { 
    activeSections[category.dataset.category] = +category.dataset.index; 
    category.dataset.category === "personalizada" ? renderCustom() : renderSection(category.dataset.category); 
    return; 
  }
});

function resetSectionToDefault(sec) {
  if (window.confirm(`Deseja restaurar todas as falas padrão do ${sec.toUpperCase()}?`)) {
    const fresh = defaultData();
    data.sections[sec] = fresh.sections[sec];
    saveDataToSupabase(); renderAll(); toast(`Falas do ${sec.toUpperCase()} restauradas!`);
  }
}

function updateCustomPronounVisibility() {
  const group = $("#custom-pronoun-group");
  if (group) group.classList.toggle("hidden", $("#pronoun").value !== "custom");
}

const pronounSelect = $("#pronoun");
if (pronounSelect) pronounSelect.addEventListener("change", updateCustomPronounVisibility);

const settingsForm = $("#settings-form");
if (settingsForm) {
  settingsForm.addEventListener("submit", e => { 
    e.preventDefault(); 
    data.settings = { ...data.settings, displayName: $("#display-name").value.trim(), pronoun: $("#pronoun").value, customPronoun: $("#custom-pronoun").value.trim(), treatment: $("#treatment")?.value.trim() || "" };
    saveDataToSupabase(); renderAll(); toast("Preferências salvas!"); 
  });
}

const logoutBtn = $("#logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => { 
    if (timerInterval) clearInterval(timerInterval); 
    timerInterval = null; timerRunning = false; nickname = ""; currentPassword = ""; 
    $("#app").classList.add("hidden"); $("#login-screen").classList.remove("hidden"); 
  });
}

// Cronômetro
function updateTimerDisplay(){const m=Math.floor(timerSeconds/60),s=timerSeconds%60;$("#timer-display").textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");}
function stopTimer(){if(timerInterval)clearInterval(timerInterval);timerInterval=null;timerRunning=false;}

const timerStart = $("#timer-start");
if (timerStart) {
  timerStart.addEventListener("click",()=>{
    if(timerRunning)return;
    if(timerSeconds<=0){timerSeconds=Math.max(0,Number($("#timer-minutes").value)*60+Number($("#timer-seconds").value));}
    if(timerSeconds<=0){toast("Defina um tempo maior que zero.");return;}
    timerRunning=true;$("#timer-message").textContent="Contagem em andamento...";$("#timer-display").classList.remove("timer-done");
    timerInterval=setInterval(()=>{
      timerSeconds--;updateTimerDisplay();
      if(timerSeconds<=0){stopTimer();$("#timer-message").textContent="Tempo encerrado!";$("#timer-display").classList.add("timer-done");toast("Tempo encerrado!");}
    },1000);
  });
}

const timerPause = $("#timer-pause");
if (timerPause) timerPause.addEventListener("click",()=>{stopTimer();$("#timer-message").textContent="Contagem pausada.";});

const timerReset = $("#timer-reset");
if (timerReset) timerReset.addEventListener("click",()=>{stopTimer();timerSeconds=Math.max(0,Number($("#timer-minutes").value)*60+Number($("#timer-seconds").value));updateTimerDisplay();$("#timer-display").classList.remove("timer-done");$("#timer-message").textContent="Cronômetro reiniciado.";});