(() => {
  "use strict";

  const calendar = "https://calendar.app.google/n99psBFktwYyoAWi9";
  let lang = "es";
  try {
    const params = new URLSearchParams(window.location.search);
    lang = params.get("lang") || localStorage.getItem("gb-portfolio-lang") || "es";
  } catch (_) {}
  if (lang !== "en") lang = "es";
  document.documentElement.lang = lang;

  const ui = {
    es: {
      back: "← Portfolio",
      cv: "CV ↗",
      live: "Ver live ↗",
      demo: "Pedir demo ↗",
      publicTag: "Público y verificable",
      privateTag: "IP protegida",
      designTag: "Diseño responsable",
      humanTag: "Human review",
      status: "Estado",
      role: "Mi rol",
      stack: "Stack",
      scope: "Alcance",
      challenge: "01 / EL RETO",
      system: "02 / EL SISTEMA",
      systemLead: "Cada etapa reduce incertidumbre y mantiene el criterio visible.",
      response: "03 / LA RESPUESTA",
      proof: "04 / QUÉ DEMUESTRA",
      proofH: "Prueba suficiente. Claims responsables.",
      proofP: "No confundo capacidad demostrada con métrica no documentada.",
      evidence: "Evidencia y rigor",
      cta: "¿Quieres ver cómo pienso el sistema completo?",
      agenda: "Agendar conversación ↗",
      other: "Explorar otros casos →",
      mainSignal: "SEÑAL PRINCIPAL"
    },
    en: {
      back: "← Portfolio",
      cv: "CV ↗",
      live: "View live ↗",
      demo: "Request demo ↗",
      publicTag: "Public & verifiable",
      privateTag: "Protected IP",
      designTag: "Responsible design",
      humanTag: "Human review",
      status: "Status",
      role: "My role",
      stack: "Stack",
      scope: "Scope",
      challenge: "01 / THE CHALLENGE",
      system: "02 / THE SYSTEM",
      systemLead: "Each step reduces uncertainty and keeps criteria visible.",
      response: "03 / THE RESPONSE",
      proof: "04 / WHAT IT PROVES",
      proofH: "Enough proof. Responsible claims.",
      proofP: "I don't confuse demonstrated capability with undocumented metrics.",
      evidence: "Evidence and rigor",
      cta: "Want to see how I think the full system?",
      agenda: "Book a conversation ↗",
      other: "Explore other cases →",
      mainSignal: "MAIN SIGNAL"
    }
  }[lang];

  const cases = {
    bodytone: {
      es: {
        index: "01", status: "CASO PÚBLICO · EN PRODUCCIÓN", public: true,
        eyebrow: "ZENDESK · CX OPS · AUTOMATION · ANALYTICS",
        title: "Bodytone Support Operating System", accent: "Operating System",
        summary: "Diseñé la cara pública del soporte y la conecté con enrutado, seguimiento, automatización, resultados, estadísticas y dashboards.",
        role: "Service design · CX Ops · Datos · Automatización",
        stack: "Zendesk · Formularios · Workflows · Reporting",
        scope: "Help Center + operación end to end",
        challengeTitle: "Una incidencia empieza siendo humana. El sistema debe hacerla accionable.",
        challenge: "Compras, devoluciones, mantenimiento e incidencias necesitan recorridos distintos con una experiencia coherente.",
        problems: [
          ["Fricción", "Solicitudes incompletas y canales confusos."],
          ["Riesgo", "Conversaciones repetidas y baja trazabilidad."],
          ["Objetivo", "Conectar experiencia, resolución y aprendizaje."]
        ],
        flow: [
          ["Intención", "La persona identifica lo que necesita."],
          ["Enrutado", "El formulario recoge el contexto correcto."],
          ["Zendesk", "El equipo trabaja con estados y reglas."],
          ["Seguimiento", "La resolución mantiene trazabilidad."],
          ["Aprendizaje", "La actividad alimenta mejora continua."]
        ],
        responseTitle: "Una entrada simple para una operación completa.",
        response: "El Help Center público es la primera capa: solicitudes estructuradas, enrutado, seguimiento y datos para decidir.",
        decisions: [
          ["Necesidad primero", "La navegación habla de lo que la persona quiere resolver."],
          ["Autoservicio + humano", "Conocimiento con salida clara a solicitud."],
          ["Escucha en el sistema", "Feedback y estados cierran el ciclo."],
          ["Datos para decidir", "La actividad se convierte en indicadores."]
        ],
        proof: [["8", "tipos públicos de solicitud"], ["LIVE", "centro de ayuda operativo"], ["E2E", "de la intención al aprendizaje"]],
        rigor: "El sistema es público y verificable. No atribuyo métricas sin medición documentada.",
        external: "https://bodytonehelp.zendesk.com/hc/es", externalLabel: "Ver sistema real ↗"
      },
      en: {
        index: "01", status: "PUBLIC CASE · IN PRODUCTION", public: true,
        eyebrow: "ZENDESK · CX OPS · AUTOMATION · ANALYTICS",
        title: "Bodytone Support Operating System", accent: "Operating System",
        summary: "I designed the public support face and connected it to routing, tracking, automation, outcomes, stats and dashboards.",
        role: "Service design · CX Ops · Data · Automation",
        stack: "Zendesk · Forms · Workflows · Reporting",
        scope: "Help Center + end-to-end operations",
        challengeTitle: "An issue starts human. The system must make it actionable.",
        challenge: "Purchases, returns, maintenance and incidents need different journeys with one coherent experience.",
        problems: [
          ["Friction", "Incomplete requests and unclear channels."],
          ["Risk", "Repeated conversations and weak traceability."],
          ["Goal", "Connect experience, resolution and learning."]
        ],
        flow: [
          ["Intent", "The person identifies what they need."],
          ["Routing", "The form captures the right context."],
          ["Zendesk", "The team works with states and rules."],
          ["Tracking", "Resolution keeps traceability."],
          ["Learning", "Activity feeds continuous improvement."]
        ],
        responseTitle: "A simple entry for a complete operation.",
        response: "The public Help Center is the first layer: structured requests, routing, tracking and data to decide.",
        decisions: [
          ["Need first", "Navigation speaks to what the person wants to solve."],
          ["Self-serve + human", "Knowledge with a clear path to request help."],
          ["Listening in-system", "Feedback and states close the loop."],
          ["Data to decide", "Activity becomes indicators."]
        ],
        proof: [["8", "public request types"], ["LIVE", "operating help center"], ["E2E", "from intent to learning"]],
        rigor: "The system is public and verifiable. I don't claim metrics without documented measurement.",
        external: "https://bodytonehelp.zendesk.com/hc/es", externalLabel: "View live system ↗"
      }
    },
    calculadora: {
      es: {
        index: "02", status: "CASO PROTEGIDO · DEMO BAJO SOLICITUD", public: false,
        eyebrow: "PRICING · PRODUCT · LOGISTICS",
        title: "Calculadora de gimnasios con 200+ algoritmos", accent: "200+ algoritmos",
        summary: "Convierte equipamiento, plano y logística nacional o internacional en una propuesta lista para enviar.",
        role: "Producto · Lógica · UX · Desarrollo",
        stack: "Apps Script · Rules engine · Pricing · PDF",
        scope: "De brief comercial a propuesta",
        challengeTitle: "Presupuestar un gimnasio no es sumar máquinas.",
        challenge: "Cada proyecto cambia con modelo, tarifa, destino, transporte y limitaciones del plano.",
        problems: [
          ["Producto", "Precio por SKU o modelo y compatibilidades."],
          ["Espacio", "Accesos, dimensiones y particularidades del plano."],
          ["Logística", "Transporte, instalación y tarifas." ]
        ],
        flow: [
          ["Brief", "Recoge el escenario comercial."],
          ["Producto", "SKU, modelo y compatibilidades."],
          ["200+ reglas", "Coordina variables y excepciones."],
          ["Logística", "Calcula transporte e instalación."],
          ["Propuesta", "Salida lista para revisar y enviar."]
        ],
        responseTitle: "La interfaz simplifica. El motor absorbe la complejidad.",
        response: "El flujo coordina producto, restricciones y logística hasta una propuesta estructurada.",
        decisions: [
          ["Investigar antes de calcular", "El escenario se entiende antes del precio."],
          ["Una lógica comercial", "Producto, espacio y logística como sistema."],
          ["Excepciones controladas", "Menos improvisación y error."],
          ["Resultado accionable", "Una propuesta, no un número suelto."]
        ],
        proof: [["200+", "reglas coordinadas"], ["SKU", "precio por modelo"], ["PDF", "propuesta lista"]],
        rigor: "Demo sin publicar tarifas, fórmulas ni datos internos.",
        external: calendar, externalLabel: "Solicitar demo ↗"
      },
      en: {
        index: "02", status: "PROTECTED CASE · DEMO ON REQUEST", public: false,
        eyebrow: "PRICING · PRODUCT · LOGISTICS",
        title: "Gym calculator with 200+ algorithms", accent: "200+ algorithms",
        summary: "Turns equipment, floorplan and national/international logistics into a ready-to-send proposal.",
        role: "Product · Logic · UX · Development",
        stack: "Apps Script · Rules engine · Pricing · PDF",
        scope: "From commercial brief to proposal",
        challengeTitle: "Quoting a gym is not summing machines.",
        challenge: "Each project changes with model, rate, destination, transport and floorplan constraints.",
        problems: [
          ["Product", "Price by SKU/model and compatibility."],
          ["Space", "Access, dimensions and floorplan specifics."],
          ["Logistics", "Transport, install and rates."]
        ],
        flow: [
          ["Brief", "Captures the commercial scenario."],
          ["Product", "SKU, model and compatibility."],
          ["200+ rules", "Coordinates variables and exceptions."],
          ["Logistics", "Calculates transport and install."],
          ["Proposal", "Output ready to review and send."]
        ],
        responseTitle: "The UI simplifies. The engine absorbs complexity.",
        response: "The flow coordinates product, constraints and logistics into a structured proposal.",
        decisions: [
          ["Research before price", "Understand the scenario first."],
          ["One commercial logic", "Product, space and logistics as one system."],
          ["Controlled exceptions", "Less improvisation and error."],
          ["Actionable output", "A proposal, not a raw number."]
        ],
        proof: [["200+", "coordinated rules"], ["SKU", "price by model"], ["PDF", "ready proposal"]],
        rigor: "Demo without publishing rates, formulas or internal data.",
        external: calendar, externalLabel: "Request demo ↗"
      }
    },
    linkedin: {
      es: {
        index: "03", status: "CASO PROTEGIDO · DEMO BAJO SOLICITUD", public: false,
        eyebrow: "RESEARCH · LINKEDIN · MATCHING",
        title: "Buscador inteligente de perfiles LinkedIn", accent: "perfiles LinkedIn",
        summary: "Parte de nombre y apellidos, contrasta señales y devuelve la coincidencia más probable para validación humana.",
        role: "Producto · UX · Desarrollo",
        stack: "Search · Matching · Scoring · Web app",
        scope: "Entrada mínima + decisión explicable",
        challengeTitle: "Encontrar no es adivinar.",
        challenge: "Un nombre puede ser muchas personas. El valor está en ordenar señales y mantener revisión humana.",
        problems: [
          ["Entrada", "Nombre y apellidos como punto de partida."],
          ["Sistema", "Búsqueda, señales y priorización."],
          ["Salida", "URL probable con contexto para decidir."]
        ],
        flow: [
          ["Nombre", "Entrada breve."],
          ["Búsqueda", "Candidatos posibles."],
          ["Matching", "Señales contrastadas."],
          ["Contexto", "Explica la prioridad."],
          ["Validación", "Decisión humana final."]
        ],
        responseTitle: "Un resultado explicable, no una caja negra.",
        response: "Entrada mínima y coincidencia priorizada con contexto para revisar.",
        decisions: [
          ["Entrada simple", "Un formulario breve inicia la investigación."],
          ["Señales múltiples", "No una única suposición."],
          ["Explicable", "Para revisar, no aceptar a ciegas."],
          ["HITL", "La persona decide al final."]
        ],
        proof: [["01", "entrada mínima"], ["N", "señales"], ["HITL", "validación humana"]],
        rigor: "Demo con datos de ejemplo. Sin publicar fuentes ni lógica interna.",
        external: calendar, externalLabel: "Solicitar demo ↗"
      },
      en: {
        index: "03", status: "PROTECTED CASE · DEMO ON REQUEST", public: false,
        eyebrow: "RESEARCH · LINKEDIN · MATCHING",
        title: "Smart LinkedIn profile finder", accent: "LinkedIn",
        summary: "Starts from name and surname, contrasts signals and returns the most likely match for human validation.",
        role: "Product · UX · Development",
        stack: "Search · Matching · Scoring · Web app",
        scope: "Minimal input + explainable decision",
        challengeTitle: "Finding is not guessing.",
        challenge: "One name can be many people. Value is ranking signals and keeping human review.",
        problems: [
          ["Input", "Name and surname as starting point."],
          ["System", "Search, signals and ranking."],
          ["Output", "Likely URL with context to decide."]
        ],
        flow: [
          ["Name", "Short input."],
          ["Search", "Possible candidates."],
          ["Matching", "Contrasted signals."],
          ["Context", "Explains priority."],
          ["Validation", "Final human decision."]
        ],
        responseTitle: "An explainable result, not a black box.",
        response: "Minimal input and ranked match with context to review.",
        decisions: [
          ["Simple input", "A short form starts research."],
          ["Multiple signals", "Not a single guess."],
          ["Explainable", "To review, not accept blindly."],
          ["HITL", "A person decides at the end."]
        ],
        proof: [["01", "minimal input"], ["N", "signals"], ["HITL", "human validation"]],
        rigor: "Demo with sample data. Sources and internal logic stay private.",
        external: calendar, externalLabel: "Request demo ↗"
      }
    },
    outreach: {
      es: {
        index: "04", status: "CASO PROTEGIDO · DEMO BAJO SOLICITUD", public: false,
        eyebrow: "OUTREACH · DATABASE · GENAI",
        title: "Outreach personalizado y automatizado", accent: "personalizado",
        summary: "Transforma una base de datos en campañas segmentadas, adapta mensajes y registra actividad para mejorar.",
        role: "Producto · Automatización · Desarrollo",
        stack: "Database · GenAI · Email · Reporting",
        scope: "Preparación, revisión y seguimiento",
        challengeTitle: "Automatizar sin sonar automático.",
        challenge: "Enviar más no crea mejores conversaciones. Hay que segmentar, personalizar y mantener control.",
        problems: [
          ["Segmentación", "Sector, empresa y puesto."],
          ["Personalización", "Mensaje al contexto, no plantilla genérica."],
          ["Aprendizaje", "Estados y estadísticas."]
        ],
        flow: [
          ["Base de datos", "Ordena variables."],
          ["Segmento", "Agrupa por contexto."],
          ["Mensaje", "Borrador personalizado."],
          ["Revisión", "Control humano."],
          ["Seguimiento", "Actividad y mejora."]
        ],
        responseTitle: "Escala en el proceso. Criterio en el mensaje.",
        response: "Preparación, borrador, revisión y seguimiento en una misma lógica.",
        decisions: [
          ["Datos como contexto", "Segmentación real."],
          ["IA como borrador", "Persona valida tono y oportunidad."],
          ["Flujo completo", "Estados compartidos."],
          ["Medición", "Volumen y calidad del proceso."]
        ],
        proof: [["DB", "contexto"], ["1:1", "personalización"], ["HITL", "control humano"]],
        rigor: "Demo con datos de ejemplo. Sin bases reales ni credenciales.",
        external: calendar, externalLabel: "Solicitar demo ↗"
      },
      en: {
        index: "04", status: "PROTECTED CASE · DEMO ON REQUEST", public: false,
        eyebrow: "OUTREACH · DATABASE · GENAI",
        title: "Personalized automated outreach", accent: "personalized",
        summary: "Turns a database into segmented campaigns, adapts messages and tracks activity to improve.",
        role: "Product · Automation · Development",
        stack: "Database · GenAI · Email · Reporting",
        scope: "Prep, review and follow-up",
        challengeTitle: "Automate without sounding automatic.",
        challenge: "Sending more does not create better conversations. Segment, personalize and keep control.",
        problems: [
          ["Segmentation", "Industry, company and role."],
          ["Personalization", "Context-aware, not generic templates."],
          ["Learning", "States and stats."]
        ],
        flow: [
          ["Database", "Orders variables."],
          ["Segment", "Groups by context."],
          ["Message", "Personalized draft."],
          ["Review", "Human control."],
          ["Follow-up", "Activity and improvement."]
        ],
        responseTitle: "Scale in process. Judgement in message.",
        response: "Prep, draft, review and follow-up in one logic.",
        decisions: [
          ["Data as context", "Real segmentation."],
          ["AI as draft", "Person validates tone and timing."],
          ["Full flow", "Shared states."],
          ["Measurement", "Volume and process quality."]
        ],
        proof: [["DB", "context"], ["1:1", "personalization"], ["HITL", "human control"]],
        rigor: "Demo with sample data. No real databases or credentials.",
        external: calendar, externalLabel: "Request demo ↗"
      }
    }
  };

  const root = document.querySelector("#case-root");
  const key = document.body.dataset.case;
  const pack = cases[key];
  const data = pack ? pack[lang] || pack.es : null;
  if (!root || !data) return;

  const portfolioHref = `./index.html?lang=${lang}#sistemas`;
  const cvHref = lang === "en" ? "./Gracian_Baena_CV_2026_EN.pdf" : "./Gracian_Baena_CV_2026_ES.pdf";
  const accentedTitle = data.title.replace(data.accent, `<em>${data.accent}</em>`);

  root.innerHTML = `
    <header class="case-header">
      <a class="brand" href="https://gracianb.github.io/GracianB/" aria-label="Gracián Baena — hub">
        <span class="brand-mark">GB</span>
        <span class="brand-text"><b>GRACIÁN BAENA</b><small>${lang === "en" ? "EXPERIENCE · CS" : "EXPERIENCIA · CS"}</small></span>
      </a>
      <nav aria-label="Case nav">
        <a href="${portfolioHref}">${ui.back}</a>
        <a href="${cvHref}" target="_blank" rel="noreferrer">${ui.cv}</a>
        <a class="header-cta" href="${data.external}" target="_blank" rel="noreferrer">${data.public ? ui.live : ui.demo}</a>
      </nav>
    </header>
    <main class="case-main">
      <section class="case-hero">
        <div class="case-hero-copy">
          <p class="eyebrow">${data.index} / ${data.eyebrow}</p>
          <h1>${accentedTitle}</h1>
          <p>${data.summary}</p>
          <div class="case-tags">
            <span>${data.public ? ui.publicTag : ui.privateTag}</span>
            <span>${ui.designTag}</span>
            <span>${ui.humanTag}</span>
          </div>
          <div class="case-hero-actions">
            <a class="button primary" href="${data.external}" target="_blank" rel="noreferrer">${data.externalLabel}</a>
            <a class="button ghost" href="${portfolioHref}">${ui.other}</a>
          </div>
        </div>
        <aside class="case-hero-aside">
          <header><span>CASE FILE / ${data.index}</span><b>${data.public ? "PUBLIC" : "PRIVATE"}</b></header>
          <dl>
            <div><dt>${ui.status}</dt><dd>${data.status}</dd></div>
            <div><dt>${ui.role}</dt><dd>${data.role}</dd></div>
            <div><dt>${ui.stack}</dt><dd>${data.stack}</dd></div>
            <div><dt>${ui.scope}</dt><dd>${data.scope}</dd></div>
          </dl>
        </aside>
      </section>

      <section class="case-section light">
        <div class="case-section-heading">
          <div><p class="eyebrow">${ui.challenge}</p><h2>${data.challengeTitle}</h2></div>
          <p>${data.challenge}</p>
        </div>
        <div class="case-problem-grid">
          ${data.problems.map((p, i) => `<article><span>0${i + 1}</span><h3>${p[0]}</h3><p>${p[1]}</p></article>`).join("")}
        </div>
      </section>

      <section class="case-section dark">
        <div class="case-section-heading">
          <div><p class="eyebrow">${ui.system}</p><h2>${lang === "en" ? "From human signal<br>to actionable outcome." : "De señal humana<br>a resultado accionable."}</h2></div>
          <p>${ui.systemLead}</p>
        </div>
        <div class="case-flow">
          ${data.flow.map((s, i) => `<article><span>0${i + 1}</span><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join("")}
        </div>
      </section>

      <section class="case-section light">
        <div class="case-section-heading">
          <div><p class="eyebrow">${ui.response}</p><h2>${data.responseTitle}</h2></div>
          <p>${data.response}</p>
        </div>
        <div class="case-decision-grid">
          ${data.decisions.map((d, i) => `<article><span>0${i + 1}</span><h3>${d[0]}</h3><p>${d[1]}</p></article>`).join("")}
        </div>
      </section>

      <section class="case-section light">
        <div class="case-section-heading">
          <div><p class="eyebrow">${ui.proof}</p><h2>${ui.proofH}</h2></div>
          <p>${ui.proofP}</p>
        </div>
        <div class="case-results">
          <div class="case-results-metric">
            <small>${ui.mainSignal}</small>
            <strong>${data.proof[0][0]}</strong>
            <span>${data.proof[0][1]}</span>
          </div>
          <div class="case-results-copy">
            <h3>${ui.evidence}</h3>
            <ul>
              ${data.proof.slice(1).map((item, i) => `<li><b>0${i + 2}</b><span><strong>${item[0]}</strong> · ${item[1]}</span></li>`).join("")}
              <li><b>✓</b><span>${data.rigor}</span></li>
            </ul>
          </div>
        </div>
      </section>

      <aside class="case-boundary">
        <span>${data.public ? "PUBLIC / VERIFIED" : "PRIVATE / CONTROLLED"}</span>
        <p>${data.rigor}</p>
        <a href="${data.external}" target="_blank" rel="noreferrer">${data.externalLabel}</a>
      </aside>

      <footer class="case-footer">
        <h2>${ui.cta}</h2>
        <div>
          <a class="button primary" href="${calendar}" target="_blank" rel="noreferrer">${ui.agenda}</a>
          <a class="button ghost" href="${portfolioHref}">${ui.other}</a>
        </div>
      </footer>
    </main>`;
})();