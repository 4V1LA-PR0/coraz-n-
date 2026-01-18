(() => {
  /* ================= DOM ================= */
  const enterBtn = document.getElementById("enterBtn");
  const welcome = document.getElementById("welcome");
  const heartSection = document.getElementById("heartSection");
  const canvas = document.getElementById("stage");
  const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;
  const nameInput = document.getElementById("nameInput");
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const music = document.getElementById("bgMusic");

  /* ================= CANVAS SIZE ================= */
  let W = canvas ? canvas.width : 900;
  let H = canvas ? canvas.height : 700;
  let CX = W / 2;
  let CY = H / 2;

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    W = Math.min(window.innerWidth - 40, 900);
    H = Math.min(window.innerHeight - 120, 700);
    CX = W / 2;
    CY = H / 2;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  /* ================= ESTRELLAS ================= */
  const points = [];
  const NUM_POINTS = 150;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function initPoints() {
    points.length = 0;
    for (let i = 0; i < NUM_POINTS; i++) {
      points.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 2 + 1,
        visible: Math.random() < 0.7,
        timer: rand(0, 20),
        period: rand(40, 90),
      });
    }
  }

  function drawPoints() {
    if (!ctx) return;
    points.forEach(p => {
      p.timer--;
      if (p.timer <= 0) {
        p.visible = !p.visible;
        p.timer = p.period;
      }
      if (p.visible) {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });
  }

  /* ================= CORAZÓN ================= */
  const heartPattern = [
    "      *****       *****      ",
    "   *********** ***********   ",
    " *************************** ",
    "*****************************",
    "*****************************",
    "*****************************",
    " *************************** ",
    "  *************************  ",
    "    *********************    ",
    "      *****************      ",
    "        *************        ",
    "          *********          ",
    "            *****            ",
    "             ***             ",
    "              *              "
  ];

  function nameHeart(name) {
    name = (name.repeat(200)).slice(0, 200);
    let idx = 0;
    return heartPattern.map(row =>
      row.split("").map(ch => ch === "*" ? name[idx++ % name.length] : " ").join("")
    );
  }

  let heartContent = "";
  let growPhase = 0;

  function drawHeart(color, fontSize) {
    if (!ctx) return;
    ctx.save();
    ctx.font = `${fontSize}px Consolas, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const lines = heartContent.split("\n");
    const lineH = fontSize * 0.85;
    let y = CY - (lines.length * lineH) / 2;

    ctx.fillStyle = color;
    lines.forEach(line => {
      ctx.fillText(line, CX, y);
      y += lineH;
    });

    ctx.restore();
  }

  function mix(a, b, t) {
    return Math.round(a + (b - a) * t);
  }

  function mixColor(c1, c2, t) {
    const a = c1.match(/\w\w/g).map(x => parseInt(x, 16));
    const b = c2.match(/\w\w/g).map(x => parseInt(x, 16));
    return `rgb(${mix(a[0], b[0], t)},${mix(a[1], b[1], t)},${mix(a[2], b[2], t)})`;
  }

  /* ================= ANIMACIÓN ================= */
  function frame() {
    ctx.clearRect(0, 0, W, H);
    drawPoints();

    growPhase += 0.05;
    const t = 0.5 + 0.5 * Math.sin(growPhase);
    const size = Math.min(W, H) / 30;
    const color = mixColor("#7a0b0b", "#ff3b3b", t);

    if (heartContent) {
      drawHeart(color, size);
    }

    requestAnimationFrame(frame);
  }

  initPoints();
  requestAnimationFrame(frame);

  /* ================= EVENTOS ================= */
  if (enterBtn) {
  enterBtn.addEventListener("click", () => {
    welcome.style.display = "none";     // 👈 quita "Para ti"
    enterBtn.style.display = "none";    // 👈 quita el botón
    heartSection.classList.remove("hidden");

    if (music) {
      music.volume = 0.4;
      music.play().catch(() => {});
    }
  });
}


  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const name = nameInput.value.trim();
      if (!name) return;

      const lines = nameHeart(name);
      heartContent = "";
      let i = 0, j = 0;

      const interval = setInterval(() => {
        if (i < lines.length) {
          if (j === 0) heartContent += "\n";
          if (j < lines[i].length) {
            heartContent += lines[i][j++];
          } else {
            i++;
            j = 0;
          }
        } else {
          clearInterval(interval);
        }
      }, 60);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      heartContent = "";
      growPhase = 0;
      initPoints();
      if (music) music.currentTime = 0;
    });
  }
})();

/* ================= MENÚ HAMBURGUESA ================= */
function toggleMenu() {
  const menu = document.getElementById("menu");
  const btn = document.querySelector(".menu-btn");
  if (!menu || !btn) return;

  const open = menu.style.display === "flex";
  menu.style.display = open ? "none" : "flex";
  btn.classList.toggle("active");
}

/* ================= COMETAS ================= */
const cometas = Array.from(document.querySelectorAll(".cometa"));

function lanzarCometa(c) {
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  c.style.transition = "none";
  c.style.transform = `translate(${x}px, ${y}px)`;
  c.style.opacity = 1;

  setTimeout(() => {
    c.style.transition = "transform 2s linear, opacity 2s linear";
    c.style.transform = `translate(${x + 300}px, ${y + 300}px)`;
    c.style.opacity = 0;
  }, 50);
}

setInterval(() => {
  cometas.forEach((c, i) => {
    setTimeout(() => lanzarCometa(c), i * 1200);
  });
}, 6000);

/* ================= MENSAJES PERSONALES ================= */
let mensajesPersonales = [];
let indiceMensaje = 0;

// Abrir modal desde menú
function abrirMensaje(){
  document.getElementById("mensajeModal").style.display = "flex";
  toggleMenu(); // Cierra el menú automáticamente
}

// Guardar mensajes
function guardarMensaje(){
  const txt = document.getElementById("mensajeInput").value.trim();
  if(!txt) return alert("Escribe algo 💖");

  mensajesPersonales = txt.split(",").map(f => f.trim()).filter(f => f !== "");
  indiceMensaje = 0;
  alert("Mensaje guardado 💖");
  document.getElementById("mensajeModal").style.display = "none";
}


  // Abrir modal para poner mensajes
const canvasHeart = document.getElementById("stage");
const fraseOverlay = document.getElementById("fraseOverlay");
let lado = true;

if(canvasHeart){
  canvasHeart.addEventListener("click", () => {
    if(mensajesPersonales.length > 0){
      fraseOverlay.textContent = mensajesPersonales[indiceMensaje];
      indiceMensaje++;
      if(indiceMensaje >= mensajesPersonales.length) indiceMensaje = 0;
    }

    fraseOverlay.classList.remove("left","right");
    fraseOverlay.classList.add("show", lado ? "left":"right");
    lado = !lado;

    setTimeout(()=> fraseOverlay.classList.remove("show"), 2600);
  });
}

/* ================= MÚSICA DE FONDO ================= */
function mostrarSelectorMusica() {
  document.getElementById('musicaModal').style.display = 'flex';
}

function cerrarMusicaModal() {
  document.getElementById('musicaModal').style.display = 'none';
}

function ponerMusica(ruta) {
  const bgMusic = document.getElementById('bgMusic');
  bgMusic.src = ruta;   // asigna la canción
  bgMusic.play().catch(err => console.log("Error: " + err)); // reproduccion
  bgMusic.loop = true;
  cerrarMusicaModal();
}


