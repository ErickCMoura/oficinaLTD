// ==========================================
// 1. SELEÇÃO DOS ELEMENTOS DOM E CANVAS
// ==========================================
const campoTitulo = document.getElementById("titulo");
const botaoAdicionar = document.getElementById("botaoAdicionar");
const listaTarefas = document.getElementById("listaTarefas");
const mensagem = document.getElementById("mensagem");
const botaoRemoverTodas = document.getElementById("botaoRemoverTodas");

const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ==========================================
// 2. SISTEMA DE PARTÍCULAS (FOGOS, VÔMITO E ESTRELAS)
// ==========================================
let particles = [];
let stars = []; // Array para as estrelas de fundo
let animacaoAtiva = false;
let tipoAnimacao = 'fogos'; 
let starsFading = false; // NOVO: Controla o momento em que as estrelas param e somem

// Função para desenhar uma estrela perfeita
function desenharEstrela(cx, cy, pontas, raioExterno, raioInterno, cor) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / pontas;

    ctx.beginPath();
    ctx.moveTo(cx, cy - raioExterno);
    for (let i = 0; i < pontas; i++) {
        x = cx + Math.cos(rot) * raioExterno;
        y = cy + Math.sin(rot) * raioExterno;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * raioInterno;
        y = cy + Math.sin(rot) * raioInterno;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - raioExterno);
    ctx.closePath();
    ctx.fillStyle = cor;
    ctx.fill();
}

function createParticles(x, y, tipo) {
    const particleCount = tipo === 'fogos' ? 80 : 5; 
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * (tipo === 'fogos' ? 15 : 5),
            vy: (Math.random() - 0.5) * (tipo === 'fogos' ? 15 : 5) - (tipo === 'vomito' ? 2 : 0),
            alpha: 1,
            color: Math.random() > 0.5 ? '#e50914' : '#ffcc00',
            size: Math.random() * 4 + 1,
            tipo: tipo
        });
    }
}

function renderParticles() {
    // Se não houver nada ativo e as listas estiverem vazias, para a animação para economizar processamento
    if (!animacaoAtiva && particles.length === 0 && stars.length === 0) return;
    
    requestAnimationFrame(renderParticles);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Renderiza e movimenta as Estrelas de fundo
    for (let i = 0; i < stars.length; i++) {
        let s = stars[i];
        
        if (starsFading) {
            // Se estiver na fase final, reduz a velocidade gradualmente (freio)
            s.vx *= 0.95; 
            s.vy *= 0.95; 
            // Começa a ficar transparente
            s.alpha -= 0.008; 
        } else {
            // Faz a estrela reaparecer se sair da tela no movimento normal
            if (s.y < -20) s.y = canvas.height + 20;
            if (s.x < -20) s.x = canvas.width + 20;
            if (s.x > canvas.width + 20) s.x = -20;
        }

        s.x += s.vx;
        s.y += s.vy;
        
        if (s.alpha > 0) {
            ctx.globalAlpha = s.alpha;
            desenharEstrela(s.x, s.y, 5, s.size, s.size / 2, s.color);
        } else {
            // Remove a estrela da array quando ela ficar 100% invisível
            stars.splice(i, 1);
            i--;
        }
    }

    // Renderiza Fogos ou Vômito
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravidade
        p.alpha -= 0.015;

        ctx.globalAlpha = p.alpha;
        
        if (p.tipo === 'fogos') {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.tipo === 'vomito') {
            ctx.font = "30px Arial";
            ctx.fillText("🤮", p.x, p.y);
        }

        if (p.alpha <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function dispararFogos() {
    animacaoAtiva = true;
    tipoAnimacao = 'fogos';
    
    // Cria as estrelas no fundo caso ainda não existam
    if (stars.length === 0) {
        starsFading = false;
        for (let i = 0; i < 60; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() * -2) - 0.5, // Flutuando para cima
                size: Math.random() * 10 + 5, // Tamanhos variados
                color: Math.random() > 0.5 ? '#e50914' : '#ffcc00', // Vermelho e Amarelo
                alpha: Math.random() * 0.6 + 0.2 // Opacidade
            });
        }
    }

    // Cria as explosões de fogos
    for(let i = 0; i < 5; i++) {
        setTimeout(() => {
            createParticles(Math.random() * canvas.width, Math.random() * (canvas.height * 0.6), 'fogos');
        }, i * 400);
    }
    
    renderParticles();
    
    // Após 4 segundos, os fogos acabam, as estrelas param e começam a sumir
    setTimeout(() => { 
        animacaoAtiva = false; 
        starsFading = true; // Aciona o sumiço das estrelas
    }, 4000);
}

function dispararVomito() {
    if (!animacaoAtiva) {
        animacaoAtiva = true;
        tipoAnimacao = 'vomito';
        renderParticles();
    }
    
    const rect = campoTitulo.getBoundingClientRect();
    createParticles(rect.left + Math.random() * rect.width, rect.top, 'vomito');
    
    clearTimeout(window.vomitoTimeout);
    window.vomitoTimeout = setTimeout(() => {
        animacaoAtiva = false;
    }, 1000);
}

// ==========================================
// 3. DETECÇÃO DE PALAVRAS (EASTER EGGS)
// ==========================================
const gatilhosLula = ['lula', '13', 'pt'];
const gatilhosBolsonaro = ['bolsonaro', '22', 'flavio', 'pl'];

function checarGatilhos(texto, arrayGatilhos) {
    const textoLimpo = texto.toLowerCase();
    return arrayGatilhos.some(palavra => textoLimpo.includes(palavra));
}

campoTitulo.addEventListener('input', (e) => {
    const texto = e.target.value;
    
    if (checarGatilhos(texto, gatilhosLula)) {
        if (!animacaoAtiva || tipoAnimacao !== 'fogos') dispararFogos();
    } 
    else if (checarGatilhos(texto, gatilhosBolsonaro)) {
        dispararVomito();
    }
});

// ==========================================
// 4. ANIMAÇÃO DE DESTRUIÇÃO (TIRO)
// ==========================================
function simularTiro(tituloDestruir) {
    return new Promise((resolve) => {
        const itemFalso = document.createElement("li");
        itemFalso.textContent = tituloDestruir;
        itemFalso.classList.add("alvo-tiro");
        listaTarefas.appendChild(itemFalso);

        const arma = document.createElement("div");
        arma.textContent = "🔫";
        arma.className = "arma-animacao";
        itemFalso.appendChild(arma);

        setTimeout(() => { arma.style.right = "20px"; }, 50);

        setTimeout(() => {
            const explosao = document.createElement("div");
            explosao.textContent = "💥";
            explosao.className = "tiro-explosao";
            itemFalso.appendChild(explosao);
            
            itemFalso.style.animation = "desintegrar 0.5s forwards";
            
            setTimeout(() => {
                itemFalso.remove();
                resolve();
            }, 500);
        }, 800);
    });
}


// ==========================================
// 5. LÓGICA DA APLICAÇÃO (API)
// ==========================================
async function carregarTarefas() {
    const resposta = await fetch("/api/tarefas");
    const tarefas = await resposta.json();

    listaTarefas.innerHTML = "";

    tarefas.forEach((tarefa) => {
        const item = document.createElement("li");
        const spanTexto = document.createElement("span");
        spanTexto.textContent = tarefa.titulo;

        const btnExcluir = document.createElement("button");
        btnExcluir.textContent = "Excluir";
        btnExcluir.className = "btn-excluir";
        btnExcluir.onclick = () => removerTarefa(tarefa.id);

        item.appendChild(spanTexto);
        item.appendChild(btnExcluir);
        listaTarefas.appendChild(item);
    });
}

async function removerTodasTarefas() {
    const resposta = await fetch("/api/tarefas", { method: "DELETE" });
    if (resposta.ok) {
        mensagem.textContent = "Todas as tarefas foram removidas!";
        setTimeout(() => mensagem.textContent = "", 3000);
        await carregarTarefas();
    }
}

async function removerTarefa(id) {
    const resposta = await fetch(`/api/tarefas/${id}`, { method: "DELETE" });
    if (resposta.ok) await carregarTarefas();
}

async function adicionarTarefa() {
    const titulo = campoTitulo.value;
    mensagem.textContent = "";

    if (titulo.trim() === "") {
        mensagem.textContent = "Digite uma tarefa.";
        campoTitulo.focus();
        return;
    }

    if (checarGatilhos(titulo, gatilhosBolsonaro)) {
        campoTitulo.value = ""; 
        await simularTiro(titulo); 
        mensagem.textContent = "Ameaça eliminada da lista.";
        setTimeout(() => mensagem.textContent = "", 2500);
        return; 
    }

    const resposta = await fetch("/api/tarefas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: titulo, id: Date.now() })
    });

    if (resposta.ok) {
        if (checarGatilhos(titulo, gatilhosLula)) dispararFogos();
        campoTitulo.value = "";
        campoTitulo.focus();
        await carregarTarefas();
    }
}

botaoAdicionar.addEventListener("click", adicionarTarefa);
botaoRemoverTodas.addEventListener("click", removerTodasTarefas);
campoTitulo.addEventListener("keydown", (event) => {
    if (event.key === "Enter") adicionarTarefa();
});

carregarTarefas();