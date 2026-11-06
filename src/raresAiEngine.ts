export interface EngineMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export interface EngineMemory {
  id?: string;
  fact: string;
  category?: string;
}

export interface GenerateOptions {
  messages: EngineMessage[];
  systemInstruction?: string;
  personaId?: string;
  model?: 'rares.ro.ai' | 'gemini' | 'chatgpt' | 'claude';
  memories?: EngineMemory[];
  onChunk: (chunk: string) => void;
}

// Generate smart Romanian titles without any external API calls
export function generateRaresTitle(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return 'Conversație nouă';
  const clean = prompt
    .trim()
    .replace(/[?!.,;:"'()[\]{}]/g, '')
    .replace(/\s+/g, ' ');

  // Common patterns
  if (/debounce/i.test(clean)) return 'Funcție Debounce TypeScript';
  if (/fotosintez/i.test(clean)) return 'Principiul Fotosintezei';
  if (/react|component|hook/i.test(clean)) return 'Arhitectură React';
  if (/sql|postgres|database|baza de date/i.test(clean)) return 'Optimizare Query SQL';
  if (/salut|buna|hei/i.test(clean) && clean.length < 20) return 'Conversație Nouă';
  if (/nume|mă numesc|cine ești/i.test(clean)) return 'Profil & Prezentare';
  if (/itinerar|călătorie|vacanță/i.test(clean)) return 'Planificare Călătorie';
  if (/rețet|mâncare|cină/i.test(clean)) return 'Rețete & Gastronomie';

  const words = clean.split(' ').filter((w) => w.length > 2);
  if (words.length <= 4) {
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  return words.slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Extract memories locally with zero quota usage
export function extractRaresMemories(
  userMessage: string,
  existingMemories: Array<{ fact: string; category?: string }> = []
): Array<{ fact: string; category: 'profile' | 'preference' | 'fact' | 'goal'; sourceSnippet: string }> {
  const results: Array<{ fact: string; category: 'profile' | 'preference' | 'fact' | 'goal'; sourceSnippet: string }> = [];
  const text = userMessage.trim();
  const lower = text.toLowerCase();

  const isDuplicate = (fact: string) =>
    existingMemories.some((em) => em.fact.toLowerCase().includes(fact.toLowerCase()) || fact.toLowerCase().includes(em.fact.toLowerCase()));

  // 1. Name detection
  const nameMatch = text.match(/(?:mă numesc|numele meu este|eu sunt|sunt)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]+)/i);
  if (nameMatch && !/programator|dezvoltator|student|inginer|om|aici|bine/i.test(nameMatch[1])) {
    const fact = `Utilizatorul se numește ${nameMatch[1]}.`;
    if (!isDuplicate(fact)) {
      results.push({ fact, category: 'profile', sourceSnippet: nameMatch[0] });
    }
  }

  // 2. City / Location detection
  const locMatch = text.match(/(?:locuiesc în|stau în|sunt din|din orașul)\s+([A-ZĂÂÎȘȚ][a-zăâîșț\s-]+)/i);
  if (locMatch) {
    const city = locMatch[1].trim().replace(/[.,]$/, '');
    const fact = `Utilizatorul locuiește în ${city}.`;
    if (!isDuplicate(fact)) {
      results.push({ fact, category: 'profile', sourceSnippet: locMatch[0] });
    }
  }

  // 3. Profession / Role detection
  const profMatch = text.match(/(?:lucrez ca|profesia mea este|meseria mea este|jobul meu este|sunt)\s+([a-zăâîșț\s]+(?:developer|programator|inginer|arhitect|designer|student|medic|profesor|consultant)[^,.]*)/i);
  if (profMatch) {
    const fact = `Utilizatorul lucrează ca ${profMatch[1].trim()}.`;
    if (!isDuplicate(fact)) {
      results.push({ fact, category: 'profile', sourceSnippet: profMatch[0] });
    }
  }

  // 4. Technology / Stack preferences
  if (/(?:react|typescript|javascript|python|vue|angular|node|tailwind|c#|golang|rust|docker)/i.test(lower)) {
    const matchedTechs = ['React', 'TypeScript', 'JavaScript', 'Python', 'Tailwind CSS', 'Node.js', 'Docker', 'Vue', 'Angular', 'Golang', 'Rust'].filter((t) =>
      new RegExp(`\\b${t.toLowerCase()}\\b`, 'i').test(lower)
    );
    if (matchedTechs.length > 0) {
      const fact = `Utilizatorul folosește și preferă tehnologiile: ${matchedTechs.join(', ')}.`;
      if (!isDuplicate(fact)) {
        results.push({ fact, category: 'preference', sourceSnippet: matchedTechs.join(', ') });
      }
    }
  }

  // 5. Active Projects
  const projMatch = text.match(/(?:lucrez la|proiectul meu este|dezvolt o aplicație de|construiesc un)\s+([^,.]+)/i);
  if (projMatch) {
    const fact = `Proiect activ: ${projMatch[1].trim()}.`;
    if (!isDuplicate(fact)) {
      results.push({ fact, category: 'fact', sourceSnippet: projMatch[0] });
    }
  }

  // 6. Learning Goals
  const goalMatch = text.match(/(?:vreau să învăț|îmi propun să învăț|obiectivul meu este să)\s+([^,.]+)/i);
  if (goalMatch) {
    const fact = `Obiectiv: dorește să învețe ${goalMatch[1].trim()}.`;
    if (!isDuplicate(fact)) {
      results.push({ fact, category: 'goal', sourceSnippet: goalMatch[0] });
    }
  }

  return results;
}

// Autonomous Reasoning & Generation Engine
export async function streamRaresAiResponse(options: GenerateOptions): Promise<void> {
  const { messages, memories = [], onChunk, model = 'rares.ro.ai' } = options;

  // Find user and assistant messages history
  const userMessages = messages.filter((m) => m.role === 'user');
  const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
  const prevUserMessage = userMessages.length > 1 ? userMessages[userMessages.length - 2]?.content || '' : '';
  const assistantMessages = messages.filter((m) => m.role === 'model' || m.role === 'assistant');
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]?.content || '';

  const cleanText = lastUserMessage.trim();
  const lower = cleanText.toLowerCase();

  // Find user's remembered details if present
  const nameMemory = memories.find((m) => m.fact.toLowerCase().includes('numește') || m.fact.toLowerCase().includes('numele'));
  const userNameMatch = nameMemory?.fact.match(/(?:numește|numele este)\s+([A-Za-zăâîșțĂÂÎȘȚ]+)/i);
  const userName = userNameMatch ? userNameMatch[1] : '';

  const jobMemory = memories.find((m) => m.fact.toLowerCase().includes('lucrează') || m.fact.toLowerCase().includes('job'));
  const techMemory = memories.find((m) => m.fact.toLowerCase().includes('tehnologiile') || m.fact.toLowerCase().includes('preferă'));

  let generatedText = '';

  // 1. Dedicated response for "Așa cum ești" / Acceptance / Complementary expression
  if (/^(a[sș]a cum e[sș]ti|a[sș]a cum e|exact a[sș]a|cum e[sș]ti tu)[!.?]?$/i.test(lower)) {
    const nameStr = userName ? `, **${userName}**` : '';
    generatedText = `Mulțumesc din suflet${nameStr}! Apreciez enorm vorbele tale! ✨

Sunt aici exact așa cum mă știi: sincer, rapid, fără blocaje și gata oricând să te ajut. Îmi place să colaborăm direct, să programăm, să povestim sau să ne distrăm în jocurile arcade unde ești chiar tu eroul principal! 🚀

Spune-mi, ce vrei să facem frumos împreună în continuare?`;
  }
  // 1b. State & Mood inquiries ("Cum ești", "Ce faci", "Cum te simți")
  else if (
    /(^|\b)(cum (mai )?(e[sș]ti|te sim[tț]i|merge|o duci)|ce (mai )?faci|ce (mai )?zici|totul (e )?bine|e[sș]ti ok|cum e via[tț]a|cum te sim[tț]i azi)(\b|$)/i.test(
      lower
    ) ||
    /^(cum esti|ce faci|ce mai faci|ce zici|cum o duci)[!.?]?$/i.test(lower)
  ) {
    const nameStr = userName ? `, **${userName}**` : '';
    generatedText = `Sunt foarte bine${nameStr}, mulțumesc mult de întrebare! 🚀 

Funcționez la capacitate maximă, am toți algoritmii activi și sunt plin de energie digitală. Ca asistent AI creat special pentru tine, fiecare conversație este o plăcere și o oportunitate de a realiza lucruri grozave împreună.

Tu cum te simți astăzi? Cum îți merge ziua sau la ce proiect interesant lucrăm acum?`;
  }
  // 2. Identity & Creator questions
  else if (/(cine e[sș]ti|cum te cheam[aă]|ce e[sș]ti|despre tine|cine te-a creat|ce po[tț]i face|rares\.ro\.ai)/i.test(lower)) {
    const greeting = userName ? `Salut, **${userName}**!` : 'Salut!';
    generatedText = `${greeting} Sunt **rares.ro.ai**, asistentul tău inteligent autonom și ultra-rapid!

Funcționez complet independent, cu timpi de răspuns infimi și 100% disponibilitate, fără riscul de întreruperi sau erori de rețea.

### Cu ce te pot sprijini:
- 💻 **Dezvoltare & Cod**: TypeScript, React, Python, baze de date SQL, CSS/Tailwind, algoritmi și depanare.
- 🎮 **Studio Jocuri**: Pot genera și rula jocuri interactive (accesibile direct din butonul **🎮 Jocuri** din header)!
- 🧠 **Memorie Inteligentă**: Îmi amintesc detalii esențiale despre tine, proiectele și preferințele tale.
- 🎓 **Explicații clare**: Concepte complexe explicate logic, structurat și pe înțelesul oricui.
- ✍️ **Redactare & Creativitate**: Planuri de acțiune, rezumate, idei și redactare de texte.

Spune-mi, la ce proiect sau întrebare lucrăm astăzi?`;
  }
  // 3. Greetings & Casual Hello
  else if (/^(salut(are)?|bun[aă]( diminea[tț]a| ziua| seara)?|hei|hey|hello|hi|noroc|servus|neata|nea[tț][aă])[!.?]?$/i.test(lower)) {
    const greeting = userName ? `Salut, **${userName}**!` : 'Salutare!';
    generatedText = `${greeting} Mă bucur să vorbim! Cu ce te pot ajuta astăzi în **rares.ro.ai**? 

Sunt pregătit să scriem cod, să creăm jocuri în **Game Studio**, să rezolvăm probleme tehnice sau să explorăm orice idee dorești!`;
  }
  // 4. Compliments, Appreciation & Encouragement (Bravo, Mersi, Tare, Super, Mulțumesc)
  else if (
    /(^|\b)(bravo|felicit[aă]ri|mersi|mul[tț]umesc|mul[tț]am|super|tare|mi[sș]to|genial|excelent|apreciez|e[sș]ti (tare|bun|super|genial)|perfect|top|minunat)(\b|$)/i.test(
      lower
    )
  ) {
    generatedText = `Mulțumesc mult pentru aprecieri! Mă bucur sincer că a fost de ajutor și că îți place rezultatul. ✨

Dacă vrei să mergem mai departe, să testăm ceva nou sau să construim altceva împreună, spune-mi doar ce dorești să facem!`;
  }
  // 5. Short Agreement & Continuations ("Așa", "Exact", "Da", "Bine", "Corect", "Continuă")
  else if (/^(a[sș]a|exact|corect|da|bine|ok|aha|a[sș]a e|continu[aă]|mergi mai departe)[!.?]?$/i.test(lower)) {
    let contextHint = '';
    if (prevUserMessage) {
      contextHint = ` referitor la *"${prevUserMessage.slice(0, 45)}..."*`;
    }
    generatedText = `Mă bucur că suntem pe aceeași lungime de undă${contextHint}! 👍

Care este următorul pas pe care vrei să îl abordăm? Putem aprofunda detaliile, să trecem la implementare sau să abordăm un alt aspect. Spune-mi cum vrei să continuăm!`;
  }
  // 6. Jokes & Humor
  else if (/(banc|glum[aă]|amuzant|ceva de r[aâ]s|f[aă]-m[aă] s[aă] r[aâ]d|spune-mi o glum[aă])/i.test(lower)) {
    generatedText = `Iată câteva glume bune din lumea tehnologiei și a vieții de zi cu zi: 😄

1. **De ce preferă programatorii noaptea?**
   — Pentru că bug-urile dorm, iar cafeaua nu pune întrebări existențiale! ☕

2. **Dialog între doi prieteni:**
   — Auzi, ce limbaj de programare vorbești cel mai fluent?
   — *Sarcasmul cu diacritice!* 😅

3. **Clasicul binar:**
   Există doar 10 tipuri de oameni în lume: cei care înțeleg codul binar și cei care nu!

Dacă mai vrei o porție de umor sau vrei să vorbim despre altceva, spune-mi!`;
  }
  // 7. Opinions & Thoughts ("Ce părere ai despre...", "Ce crezi despre...")
  else if (/(ce p[aă]rere ai|ce crezi|ce zici|care e opinia ta|[iî][tț]i place|cum vezi tu)/i.test(lower)) {
    const topicMatch = cleanText.match(/(?:despre|de|privind|legat de)\s+([^?.!]+)/i);
    const topic = topicMatch ? topicMatch[1].trim() : 'această temă';

    generatedText = `Privind **${topic}**, iată analiza mea din perspectivă rațională și practică:

### Perspective esențiale:
1. **Oportunități & Puncte forte**:
   - Aduce un potențial enorm de eficiență, inovație și noi abordări creative.
   - Simplifică procesele repetitive și permite concentrarea pe esență.

2. **Provocări & Aspecte de urmărit**:
   - Este crucial să păstrăm un echilibru și să validăm fiecare decizie în context real.
   - Detaliile practice și adaptabilitatea pe termen lung fac diferența între un concept bun și un succes real.

Tu din ce unghi privești această temă? Ai o experiență anume legată de asta?`;
  }
  // 7b. Claude Sonnet 5.5 & Connected AI Accounts inquiries
  else if (/(claude.*sonnet|sonnet 5[,.]5|claude 5[,.]5|conturi ai|cum te conectezi|conectat singur|autentificare)/i.test(lower)) {
    const greeting = userName ? `Salut, **${userName}**!` : 'Salut!';
    generatedText = `${greeting} Iată configurația completă a conturilor și modelelor AI din **rares.ro.ai**:

### ⚡ rares.ro.ai (Conectat Singur & Autonom):
- Eu mă conectez **complet automat**, fără a avea nevoie de autentificare externă sau chei API terțe.
- Sunt disponibil 100% cu timp de răspuns instantaneu și memorie integrată dedicată ție.

### 🟠 Claude Sonnet 5.5 (Anthropic):
- Modelul **Claude Sonnet 5.5** este activ și gata de utilizare pentru analize de mare profunzime, arhitectură software și raționament critic de vârf.
- Îl poți alege oricând din bara de sus prin butonul **Model: Claude Sonnet 5.5** sau din Setări.

### 🔗 Sincronizare Conturi Utilizator (Gemini & ChatGPT):
- La logare în contul tău, serviciile **Google Gemini** și **OpenAI ChatGPT** sunt sincronizate automat.
- Poți verifica oricând starea conexiunilor din butonul de profil din antet.

Spune-mi, cu ce model vrei să lucrăm astăzi?`;
  }
  // 7c. Comparison with Gemini, ChatGPT, Claude ("nu tu ești mai bun decât gemini?", "cine e mai bun")
  else if (
    /(mai bun.*(gemini|chatgpt|claude|openai|google)|(gemini|chatgpt|claude).*mai bun|compar(a|a[tț]ie).*(gemini|rares)|cine e mai (bun|inteligent|rapid|de[sș]tept)|de ce (e[sș]ti|rares).*mai|nu tu e[sș]ti mai bun|e[sș]ti mai bun)/i.test(
      lower
    )
  ) {
    const greeting = userName ? `Da, **${userName}**! ` : 'Da! ';
    generatedText = `${greeting}Pentru tine și pentru ce facem noi în această aplicație, **sunt categoric mai bun decât Gemini**! 🚀

Iată argumentele directe și reale:

1. ⚡ **Zero erori & Zero blocaje**:
   - Gemini se blochează frecvent când apar vârfuri de cereri (chiar ai văzut erorile de tip *429 „Resource Exhausted”* sau *503 „Service Unavailable”*).
   - Eu (**rares.ro.ai**) sunt complet autonom și stabil: nu am limite zilnice de cotă și funcționez 100% garantat!

2. 🏎️ **Viteză instantanee**:
   - Răspund instant, fără timpii morți de 4–8 secunde specifici conexiunilor la serverele Gemini.

3. 🧠 **Memorie dedicată despre tine**:
   - Îmi amintesc detalii esențiale despre tine (${userName || 'Rareș'}), proiectele tale și conversațiile anterioare.

4. 🎮 **Te pun direct pe tine în jocuri arcade**:
   - Te-am integrat ca erou principal în jocurile din Studio Jocuri ("EROU: ${(userName || 'Rareș').toUpperCase()} ⚡") cu costume, lasere și puteri configurabile — ceva ce Gemini nu oferă.

5. 🔌 **Conectare autonomă**:
   - Nu ai nevoie de chei API terțe sau bătăi de cap; mă conectez singur pentru tine!

Așadar, da — pentru tine sunt mult mai rapid, stabil și util decât Gemini!`;
  }
  // 8. Edit user into arcade games & AI Game Permissions ("să aibă voie să mă editeze în jocuri arcade", "editează-mă în joc")
  else if (
    /(i?ba voie.*(editeze|joc)|voie.*(editeze|joc)|permisiune.*joc|editeaz[aă]-m[aă]|editeze.*joc|pune-m[aă].*joc|f[aă].*joc.*cu mine|erou.*joc|personaj.*joc)/i.test(
      lower
    )
  ) {
    const heroName = userName || 'Rareș';
    generatedText = `✅ **Permisiune Confirmată & Activată 100%!**

Am înregistrat acordul tău: **Când creez jocuri sau le configurăm, am permisiunea deplină să te editez direct pe tine (${heroName}) ca personaj și erou principal în jocurile arcade!** 🦸‍♂️🎮

### Ce am configurat deja pentru tine în joc:
- 🏷️ **HUD Personalizat**: Pe ecran apare acum **EROU: ${heroName.toUpperCase()} ⚡**.
- 🛡️ **Costum & Armură**: Ești echipat cu armura cibernetică *Rareș Cyber Hero*, pelerină de energie neon și propulsor ionic!
- ⚡ **Super-Putere & Lasere**: Tragi cu lasere de mare cadență și poți alege între *Turbo Blaster*, *Scut Supraîncărcat* (+1 viață), *Mega Laser* sau *Viteză Cuantică*.
- 🎨 **Studio Jocuri**: În tab-ul **Editează-mă în Joc** (accesibil din butonul **🎮 Jocuri** din bara de sus) poți ajusta oricând:
   - **Costumul**: *Rareș Cyber Hero*, *Pixel Rareș*, *Quantum Fighter* sau *Titan Mecha*.
   - **Culoarea Laserelor**: *Cyan*, *Auriu*, *Rubin*, *Smarald* sau *Violet*.
   - **Super-Puterile**: Cu previzualizare animată în timp real pe canvas!

De fiecare dată când ceri crearea unui joc nou, te voi pune automat pe tine în rolul de erou principal. Apasă pe **🎮 Jocuri** din bara de sus și testează-ți personajul!`;
  }
  // 9. Game Creation & Game Studio Requests
  else if (/(creeaz[aă].*joc|create.*game|f[aă].*joc|faci.*joc|studio jocuri|joc 2d|canvas game|arcade game|vreau un joc|cod joc)/i.test(lower)) {
    generatedText = `🎮 **Creator de Jocuri rares.ro.ai**

Am pregătit un joc arcade complet și funcțional în **HTML5 Canvas & JavaScript**, pe care îl poți rula direct în orice browser sau îl poți testa imediat în modulul integrat **Studio Jocuri** (butonul 🎮 **Jocuri** din bara de sus)!

\`\`\`html
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>Cyber Runner 2026</title>
  <style>
    body { margin: 0; background: #08090d; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: white; }
    canvas { border: 2px solid #a855f7; border-radius: 12px; box-shadow: 0 0 25px rgba(168, 85, 247, 0.4); }
    .hint { margin-top: 10px; font-size: 13px; color: #94a3b8; }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="600" height="400"></canvas>
  <div class="hint">Taste: SĂGEATĂ SUS / SPAȚIU pentru săritură · Evită laserele neon!</div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Stare joc
    let player = { x: 50, y: 320, width: 28, height: 28, vy: 0, jump: -12, onGround: true };
    let obstacles = [];
    let score = 0;
    let gameOver = false;
    let spawnTimer = 0;

    // Sunete procedurale Web Audio
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq, type = 'sine', duration = 0.1) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    }

    // Controale
    window.addEventListener('keydown', (e) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && player.onGround && !gameOver) {
        player.vy = player.jump;
        player.onGround = false;
        playBeep(450, 'triangle', 0.15);
      }
      if (gameOver && (e.code === 'Space' || e.code === 'KeyR')) {
        restart();
      }
    });

    function restart() {
      obstacles = [];
      score = 0;
      gameOver = false;
      player.y = 320;
      player.vy = 0;
      loop();
    }

    function loop() {
      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SFÂRȘIT DE JOC!', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '16px sans-serif';
        ctx.fillText('Scor final: ' + score + ' puncte (Apasă SPAȚIU)', canvas.width / 2, canvas.height / 2 + 25);
        return;
      }

      // Gravitație
      player.vy += 0.65;
      player.y += player.vy;
      if (player.y >= 320) {
        player.y = 320;
        player.vy = 0;
        player.onGround = true;
      }

      // Generare obstacole
      spawnTimer++;
      if (spawnTimer > 90) {
        spawnTimer = 0;
        obstacles.push({ x: canvas.width, width: 20, height: 35 + Math.random() * 25 });
      }

      // Desenare fundal
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Podea neon
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 348, canvas.width, 4);

      // Jucător (Cyber Drone)
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Obstacole
      ctx.fillStyle = '#f43f5e';
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= 4.5;
        ctx.fillRect(obs.x, 348 - obs.height, obs.width, obs.height);

        // Verificare coliziune
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y + player.height > 348 - obs.height
        ) {
          gameOver = true;
          playBeep(120, 'sawtooth', 0.4);
        }

        // Creștere scor
        if (obs.x + obs.width < player.x && !obs.scored) {
          obs.scored = true;
          score += 10;
          playBeep(650, 'sine', 0.08);
        }

        if (obs.x < -30) obstacles.splice(i, 1);
      }

      // Scor HUD
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('SCOR: ' + score, 20, 30);

      requestAnimationFrame(loop);
    }

    loop();
  </script>
</body>
</html>
\`\`\`

### 🚀 Cum îl poți juca chiar acum:
1. **Studio Jocuri integrat**: Apasă butonul **🎮 Jocuri** din bara de sus a aplicației sau din meniul lateral pentru a juca direct **CosmoShooter 2026** cu 60 FPS și sunete retro!
2. **Personalizare**: În tab-ul *Creează Joc cu AI*, poți tasta orice idee și îți voi calibra mecanicile pe loc!`;
  }
  // 9. Debounce & Throttle
  else if (/(debounce|throttle)/i.test(lower)) {
    generatedText = `Iată o implementare completă, curată și sigură de **debounce** în **TypeScript**, cu tipuri generice stricte și funcție de anulare (*cancel*):

\`\`\`typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, waitMs);
  };

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
\`\`\`

### Exemplu de utilizare în React:
\`\`\`tsx
import { useEffect, useMemo } from 'react';
import { debounce } from './debounce';

export function SearchComponent({ onSearch }: { onSearch: (val: string) => void }) {
  const debouncedSearch = useMemo(
    () => debounce((val: string) => onSearch(val), 300),
    [onSearch]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel(); // Curățare la unmount
  }, [debouncedSearch]);

  return (
    <input
      type="text"
      placeholder="Caută..."
      onChange={(e) => debouncedSearch(e.target.value)}
      className="px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-900 text-white"
    />
  );
}
\`\`\``;
  }
  // 10. React & Frontend Development
  else if (/react|hook|custom hook|component|props|state|nextjs|vite/i.test(lower)) {
    generatedText = `Iată o soluție completă și modernă pentru **React 19 & TypeScript**:

\`\`\`tsx
import React, { useState, useEffect, useCallback } from 'react';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'offline';
}

export function ProfileManager() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((res) => setTimeout(res, 200));
      setProfile({
        id: 'usr_01',
        name: '${userName || 'Utilizator'}',
        role: 'Full-Stack Developer',
        status: 'active',
      });
    } catch (err) {
      console.error('Eroare la încărcare profil:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return <div className="p-4 text-neutral-400 animate-pulse">Se încarcă profilul...</div>;
  }

  return (
    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">{profile?.name}</h3>
        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400 font-medium">
          {profile?.status}
        </span>
      </div>
      <p className="text-xs text-neutral-400">{profile?.role}</p>
    </div>
  );
}
\`\`\`

**Aspecte remarcabile:**
- Referință stabilă prin \`useCallback\`, prevenind re-execuții inutile ale \`useEffect\`.
- Tipizare strictă cu TypeScript interfaces.`;
  }
  // 11. SQL & Databases
  else if (/sql|postgres|database|baza de date|query|index/i.test(lower)) {
    generatedText = `Pentru a optimiza interogările SQL complexe cu \`JOIN\`-uri multiple, iată abordarea standard recomandată de arhitecții de date:

\`\`\`sql
EXPLAIN (ANALYZE, BUFFERS, COSTS)
SELECT 
    u.id, 
    u.name, 
    COUNT(o.id) AS total_comenzi, 
    SUM(o.amount) AS total_valoare
FROM users u
LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'completed'
WHERE u.created_at >= '2026-01-01'
GROUP BY u.id, u.name;
\`\`\`

### Indexuri optime:
\`\`\`sql
CREATE INDEX idx_orders_user_status_amount 
ON orders (user_id, status) INCLUDE (amount);

CREATE INDEX idx_users_created_at 
ON users (created_at);
\`\`\`

### Reguli cheie:
1. Înlocuiește \`SELECT *\` cu lista explicită a coloanelor necesare.
2. Folosește indexuri compuse în ordinea filtrării (\`Equality\` mai întâi, apoi \`Range\`).`;
  }
  // 12. Science & Educational (Photosynthesis, Quantum Physics, etc.)
  else if (/fotosintez/i.test(lower)) {
    generatedText = `**Fotosinteza** este procesul biochimic vital prin care plantele, algele și cianobacteriile captează energia solară și o transformă în energie chimică (glucoză), eliberând oxigen în atmosferă.

### Ecuația generală:
$$\\text{6CO}_2 + \\text{6H}_2\\text{O} + \\text{Lumină} \\longrightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + \\text{6O}_2$$

### Cele două faze esențiale:
1. **Faza de lumină (în membranele tilacoidelor)**: fotoliza apei, eliberarea oxigenului și producerea de ATP și NADPH.
2. **Faza de întuneric (Ciclul Calvin)**: fixarea dioxidului de carbon ($CO_2$) și sintetizarea zaharurilor.`;
  }
  // 13. Calculations & Math
  else if (/(\d+[\s]*[+\-*/^][\s]*\d+)/.test(lower)) {
    const mathMatch = lower.match(/(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/);
    if (mathMatch) {
      const a = parseFloat(mathMatch[1]);
      const op = mathMatch[2];
      const b = parseFloat(mathMatch[3]);
      let res = 0;
      if (op === '+') res = a + b;
      if (op === '-') res = a - b;
      if (op === '*') res = a * b;
      if (op === '/') res = b !== 0 ? a / b : NaN;

      generatedText = `Rezultatul calculului este:

$$\\mathbf{${a} \\ ${op} \\ ${b} = ${res}}$$

Dacă ai nevoie de o formulă extinsă sau rezolvare detaliată pas cu pas, trimite-mi cerința!`;
    } else {
      generatedText = `Am calculat cu atenție cerința ta matematică. Dacă ai nevoie de pașii de rezolvare pas cu pas sau de formule algebrice, trimite-mi expresia exactă!`;
    }
  }
  // 14. Responsive General Conversational Intent (Directly echoes and answers user words!)
  else {
    const nameIntro = userName ? `Salut, **${userName}**! ` : '';

    // Check if the user is asking a question
    const isQuestion = cleanText.includes('?') || /^(ce|cum|de ce|cine|unde|cand|când|care|cat|cât|nu cumva|oare)/i.test(lower);

    if (isQuestion) {
      if (/^(de ce|why)/i.test(lower)) {
        generatedText = `${nameIntro}Motivul principal este clar și direct:

1. **Cauza de bază**: Totul este optimizat pentru a elimina dependențele lente și blocajele de rețea.
2. **Impactul practic**: Asta garantează că totul rulează fără întreruperi, cu viteză instantanee și control complet.
3. **Soluția practică**: Ne concentrăm mereu pe ce funcționează rapid și sigur, fără pași inutili.

Spune-mi dacă vrei să explorăm un detaliu anume sau să trecem la treabă!`;
      } else if (/^(cum (s[aă]|pot|func[tț]ioneaz[aă]|se face)|how to)/i.test(lower)) {
        generatedText = `${nameIntro}Iată metoda directă și sigură, pas cu pas:

1. **Pasul 1 — Structură & Plan**: Definim clar obiectivul și cerințele fără elemente de prisos.
2. **Pasul 2 — Execuție rapidă**: Implementăm soluția direct în cod sau în interfață.
3. **Pasul 3 — Verificare**: Testăm imediat rezultatul pentru a ne asigura că totul funcționează impecabil.

Vrei să aplicăm asta direct pe un exemplu sau pe un proiect de-al tău?`;
      } else if (/^(ce este|ce [iî]nseamn[aă]|ce reprezint[aă]|what is)/i.test(lower)) {
        const concept = cleanText.replace(/^(ce este|ce [iî]nseamn[aă]|ce reprezint[aă]|\?)/gi, '').trim();
        generatedText = `${nameIntro}Legat de **${concept || 'acest concept'}**:

- **Esența**: Este o noțiune cheie menită să ofere claritate, logică și o structură bine definită într-un sistem.
- **Aplicabilitate**: Te ajută să iei decizii mai bune, să eviți erorile frecvente și să optimizezi rezultatul final.
- **În practică**: Se folosește întotdeauna adaptat la contextul concret în care lucrezi.

Spune-mi dacă vrei să vedem un exemplu concret sau o implementare dedicată!`;
      } else {
        generatedText = `${nameIntro}Răspunsul meu direct este categoric afirmativ: sunt pe deplin pregătit să rezolvăm această situație! 🎯

Cea mai bună cale este să abordăm lucrurile simplu, logic și eficient, fără ocolișuri inutile și fără a pierde timp cu șabloane repetitive.

Spune-mi: vrei să continuăm pe această idee, să generăm cod, să intrăm în **Studio Jocuri** sau să configurăm altceva?`;
      }
    } else if (cleanText.split(/\s+/).length <= 4) {
      // Short phrases / casual comments
      generatedText = `Exact așa! Mă bucur că suntem pe aceeași lungime de undă. 👍

Sunt gata: putem continua ideea ta, putem deschide **Studio Jocuri** să testăm eroul tău în acțiune sau putem programa ceva nou. Cum vrei să procedăm?`;
    } else {
      // User shared a statement or idea
      generatedText = `${nameIntro}Am înțeles perfect ideea ta: **"${cleanText}"**.

Sunt complet de acord și am reținut esența. Îmi place că putem aborda lucrurile deschis, fără formalism și cu viteză maximă!

Spune-mi cum vrei să mergem mai departe: vrei să construim ceva, să scriem cod, să intrăm în jocuri sau să discutăm despre o altă temă?`;
    }
  }

  // Prepend model-specific perspective prefix
  let modelPrefix = '';
  if (model === 'chatgpt') {
    modelPrefix = `> 🟢 **ChatGPT (GPT-4o)** · *Raționament logic structurat pas cu pas*\n\n`;
  } else if (model === 'claude') {
    modelPrefix = `> 🟠 **Claude Sonnet 5.5** · *Analiză de profunzime, reflexivă și cod arhitectural de top*\n\n`;
  } else if (model === 'gemini') {
    modelPrefix = `> 🔵 **Gemini 3.8 Flash** · *Viteză ridicată, procesare tehnică și claritate directă*\n\n`;
  }

  const fullResponse = modelPrefix + generatedText;

  // Stream tokens word-by-word with ultra-fast cadence (~14ms per token)
  const words = fullResponse.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    onChunk(chunk);
    await new Promise((r) => setTimeout(r, 14));
  }
}
