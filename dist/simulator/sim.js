/* Ship It — engine and interface.
   Data lives in sim-data.js. Nothing here is persisted off-device. */

(function () {
  'use strict';

  const $ = sel => document.querySelector(sel);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const fmt = {
    gmv: v => '₹' + v.toFixed(1) + 'Cr',
    mau: v => v.toFixed(2) + 'M',
    nps: v => Math.round(v),
    crash: v => v.toFixed(2) + '%',
    runway: v => v.toFixed(1) + ' mo'
  };

  let S, history, pendingChain;

  /* ---------------------------------------------------------- state */

  function newRun() {
    S = JSON.parse(JSON.stringify(START));
    S.idx = 0;
    history = [];
    pendingChain = null;
  }

  function apply(state, fx, mult) {
    const m = mult == null ? 1 : mult;
    for (const k of ['gmv', 'mau', 'nps', 'crash', 'runway', 'debt', 'morale', 'risk']) {
      if (fx[k] != null) state[k] += fx[k] * m;
    }
    state.gmv = Math.max(0, state.gmv);
    state.mau = Math.max(0, state.mau);
    state.nps = clamp(state.nps, -100, 100);
    state.crash = clamp(state.crash, 0, 100);
    state.runway = Math.max(0, state.runway);
    state.debt = clamp(state.debt, 0, 100);
    state.morale = clamp(state.morale, 0, 100);
    state.risk = clamp(state.risk, 0, 100);
  }

  /* ------------------------------------------- state-dependent ranking

     An option's quality is its raw effects weighted by how much the
     current state can absorb them, plus the discounted cost of any
     dependency chain it would arm. Debt is cheap at 20 and ruinous at
     70, so the ordering of the same five options genuinely moves as the
     run progresses. This is what the post-choice ranking reports. */

  function foresight(opt, state, idx) {
    if (!opt.sets || !opt.sets.length) return 0;
    const probe = JSON.parse(JSON.stringify(state));
    apply(probe, opt.fx || {});
    opt.sets.forEach(f => { probe.flags[f] = true; });
    let total = 0;
    for (const c of CHAINS) {
      if (c.at <= idx) continue;
      let fires = false;
      try { fires = c.when(probe); } catch (e) { fires = false; }
      if (!fires) continue;
      const f = c.fx || {};
      // Discount by distance: a Q3 detonation should bite a Q1 choice,
      // but not dominate it.
      const d = 1 / (1 + (c.at - idx) * 0.35);
      total += ((f.gmv || 0) * 1.0
        + (f.nps || 0) * 0.22
        - (f.debt || 0) * 0.16
        + (f.morale || 0) * 0.11
        - (f.risk || 0) * 0.14
        - (f.crash || 0) * 4) * d;
    }
    return total;
  }

  function quality(opt, state, idx) {
    const fx = opt.fx || {};
    // Weights swing by roughly an order of magnitude across the run. This is
    // what lets the same option be the strongest play in Q1 and the worst in
    // Q3: debt is nearly free at 18 and ruinous at 80, and GMV stops mattering
    // once you are comfortable but dominates everything when you are behind
    // target with a short runway.
    const gap = clamp((TARGET.gmv - state.gmv) / TARGET.gmv, 0, 1);
    const urgency = 1 + gap * 2.2 + Math.max(0, 9 - state.runway) / 4.5;
    const debtW = 0.06 + Math.pow(state.debt / 100, 2) * 0.95;
    const moraleW = 0.05 + Math.pow((100 - state.morale) / 100, 2) * 0.55;
    const riskW = 0.05 + Math.pow(state.risk / 100, 2) * 0.85;
    const runW = 0.5 + Math.max(0, 9 - state.runway) / 4;
    return (fx.gmv || 0) * urgency
      + (fx.mau || 0) * 12
      + (fx.nps || 0) * 0.22
      - (fx.crash || 0) * 4
      + (fx.runway || 0) * runW
      - (fx.debt || 0) * debtW
      + (fx.morale || 0) * moraleW
      - (fx.risk || 0) * riskW
      + foresight(opt, state, idx);
  }

  const RANKS = ['worst', 'bad', 'good', 'better', 'best'];

  function rankAll(dec, state, idx) {
    const scored = dec.options.map((o, i) => ({ i: i, q: quality(o, state, idx) }));
    const order = scored.slice().sort((a, b) => a.q - b.q);
    const out = [];
    order.forEach((s, pos) => { out[s.i] = pos; });
    return out; // index -> 0..4, 4 being best
  }

  /* ---------------------------------------------------------- screens */

  const root = $('#screen');
  const metricBar = $('#metrics');

  function show(node) {
    root.replaceChildren(node);
    root.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function degrade() {
    const d = S ? S.debt : 0;
    const tier = d >= 70 ? 'sev3' : d >= 50 ? 'sev2' : d >= 32 ? 'sev1' : 'ok';
    document.documentElement.dataset.integrity = tier;
  }

  function renderMetrics(deltas) {
    metricBar.replaceChildren();
    if (!S) { metricBar.hidden = true; return; }
    metricBar.hidden = false;
    const defs = [
      ['GMV', fmt.gmv(S.gmv), deltas && deltas.gmv],
      ['MAU', fmt.mau(S.mau), deltas && deltas.mau],
      ['NPS', fmt.nps(S.nps), deltas && deltas.nps],
      ['CRASH', fmt.crash(S.crash), deltas && deltas.crash, true],
      ['RUNWAY', fmt.runway(S.runway), deltas && deltas.runway]
    ];
    defs.forEach(([k, v, d, inverse]) => {
      const cell = el('div', 'metric');
      cell.append(el('span', 'm-key', k), el('span', 'm-val', String(v)));
      if (d) {
        const good = inverse ? d < 0 : d > 0;
        const chip = el('span', 'm-d ' + (good ? 'up' : 'down'),
          (d > 0 ? '+' : '') + (Math.abs(d) < 1 ? d.toFixed(2) : d.toFixed(1)));
        cell.append(chip);
      }
      metricBar.append(cell);
    });
    degrade();
  }

  /* 01 Cold open — deliberately almost empty. */
  function coldOpen() {
    renderMetrics();
    metricBar.hidden = true;
    const w = el('section', 'cold');
    w.append(
      el('p', 'ghost', '48 unread messages in #prod-triage'),
      el('h1', null, 'You are the new PM of Kirana.'),
      el('p', 'sub', '2.1M monthly users.'),
      el('p', 'sub dim', 'Your predecessor left on Tuesday. Nobody will say why.')
    );
    const go = el('button', 'primary', 'Take the job');
    go.addEventListener('click', () => { newRun(); briefing(); });
    w.append(go);
    show(w);
  }

  /* 02 Quarter briefing */
  function briefing() {
    const dec = DECISIONS[S.idx];
    const q = QUARTERS.find(x => x.id === dec.q);
    renderMetrics();
    const w = el('section', 'brief');
    w.append(el('p', 'eyebrow', q.name + ' · ' + q.theme));
    w.append(el('h2', null, q.brief));
    const grid = el('div', 'targets');
    [['GMV target', fmt.gmv(TARGET.gmv)], ['MAU target', fmt.mau(TARGET.mau)],
     ['Decisions this quarter', String(DECISIONS.filter(d => d.q === q.id).length)]]
      .forEach(([k, v]) => {
        const c = el('div', 'target');
        c.append(el('span', 'm-key', k), el('span', 'm-val', v));
        grid.append(c);
      });
    w.append(grid);
    const go = el('button', 'primary', 'Open the room');
    go.addEventListener('click', meeting);
    w.append(go);
    show(w);
  }

  /* 03 The meeting */
  function meeting() {
    const dec = DECISIONS[S.idx];
    renderMetrics();
    const w = el('section', 'meet');
    const head = el('div', 'meet-head');
    head.append(
      el('span', 'eyebrow', 'Decision ' + (S.idx + 1) + ' of ' + DECISIONS.length),
      el('h2', null, dec.title)
    );
    w.append(head);

    const chat = el('div', 'chat');
    dec.scene.forEach(m => {
      const row = el('div', 'msg ' + m.tone);
      const top = el('div', 'msg-top');
      top.append(el('b', null, m.who), el('span', 'role', m.role));
      row.append(top, el('p', null, m.text));
      chat.append(row);
    });
    w.append(chat);

    const list = el('div', 'options');
    dec.options.forEach((o, i) => {
      const card = el('button', 'opt');
      card.append(el('span', 'opt-label', o.label), el('span', 'opt-detail', o.detail));
      card.addEventListener('click', () => choose(i));
      list.append(card);
    });
    w.append(el('p', 'eyebrow dim', 'Five paths. No rollbacks.'), list);
    show(w);
  }

  /* 04 Consequence */
  function choose(i) {
    const dec = DECISIONS[S.idx];
    const opt = dec.options[i];
    const ranks = rankAll(dec, S, S.idx);
    const before = JSON.parse(JSON.stringify(S));

    apply(S, opt.fx || {});
    (opt.sets || []).forEach(f => { S.flags[f] = true; });

    // Resolve any chain armed for this decision index.
    let chain = null;
    for (const c of CHAINS) {
      if (c.at !== S.idx) continue;
      let fires = false;
      try { fires = c.when(S); } catch (e) { fires = false; }
      if (fires) { chain = c; apply(S, c.fx || {}); break; }
    }

    history.push({ idx: S.idx, pick: i, rank: ranks[i], title: dec.title,
                   label: opt.label, chain: chain ? chain.id : null });

    const deltas = {};
    ['gmv', 'mau', 'nps', 'crash', 'runway'].forEach(k => {
      const d = S[k] - before[k];
      if (Math.abs(d) > 0.001) deltas[k] = d;
    });
    consequence(dec, opt, ranks[i], deltas, chain, before);
  }

  function consequence(dec, opt, rank, deltas, chain, before) {
    renderMetrics(deltas);
    const w = el('section', 'conseq');
    w.append(el('p', 'eyebrow', 'Decision ' + (S.idx + 1) + ' · committed'));
    w.append(el('h2', null, opt.label));
    w.append(el('p', 'detail', opt.detail));

    if (chain) {
      const box = el('div', 'detonation');
      box.append(el('p', 'det-head', chain.headline), el('p', null, chain.body));
      w.append(box);
    }

    // Symptoms, never numbers. Hidden state speaks through consequences.
    const sym = symptoms(before, S);
    if (sym.length) {
      const s = el('div', 'symptoms');
      sym.forEach(t => s.append(el('p', null, t)));
      w.append(s);
    }

    const rk = el('div', 'rank');
    rk.append(el('span', 'eyebrow dim', 'Against the state you were in'),
              el('p', 'rank-v rank-' + rank, RANKS[rank]));
    rk.append(el('p', 'rank-note', rank >= 3
      ? 'The strongest options available to you at that moment.'
      : rank === 2 ? 'Defensible. Two better paths were open.'
      : 'There were better reads on that room.'));
    w.append(rk);

    const go = el('button', 'primary', S.idx + 1 >= DECISIONS.length ? 'Face the board' : 'Next');
    go.addEventListener('click', advance);
    w.append(go);
    show(w);
  }

  function symptoms(a, b) {
    const out = [];
    if (b.debt - a.debt >= 10) out.push('Engineering has stopped filing tickets for the checkout service.');
    else if (b.debt - a.debt >= 5) out.push('Two deploys were rolled back this week. Nobody wrote a post-mortem.');
    if (a.morale - b.morale >= 10) out.push('On-call engineers were paged four times last night across two time zones.');
    else if (a.morale - b.morale >= 5) out.push('Ananya has stopped arguing with you in meetings.');
    if (b.risk - a.risk >= 12) out.push('Support queue is three days deep and the complaints have started rhyming.');
    if (b.morale - a.morale >= 8) out.push('Someone put a plant on the engineering floor. It is still alive.');
    if (a.debt - b.debt >= 8) out.push('p95 came down and nobody noticed, which is the point.');
    return out;
  }

  function advance() {
    S.idx += 1;
    if (S.idx >= DECISIONS.length) return results();
    const prev = DECISIONS[S.idx - 1].q, now = DECISIONS[S.idx].q;
    if (prev !== now) return briefing();
    meeting();
  }

  /* 06 Results */
  function categories() {
    const growth = clamp(((S.gmv - 40) / (TARGET.gmv - 40)) * 55
      + ((S.mau - 2.0) / (TARGET.mau - 2.0)) * 45, 0, 100);
    const craft = clamp(100 - S.debt * 0.85 - S.crash * 18, 0, 100);
    const trust = clamp((S.nps + 20) * 0.9 - S.risk * 0.6, 0, 100);
    const judgment = clamp(history.reduce((t, h) => t + h.rank / 4, 0) / history.length * 100, 0, 100);
    return { growth: growth, craft: craft, trust: trust, judgment: judgment };
  }

  function results() {
    renderMetrics();
    const c = categories();
    const score = Math.round(c.growth * 0.3 + c.craft * 0.25 + c.trust * 0.25 + c.judgment * 0.2);
    const arch = ARCHETYPES.find(a => a.when(c));

    const w = el('section', 'results');
    w.append(el('p', 'eyebrow', 'Four quarters · ' + DECISIONS.length + ' decisions'));
    w.append(el('h1', 'arch', arch.name));
    w.append(el('p', 'arch-line', arch.line));

    const sc = el('div', 'score');
    sc.append(el('span', 'score-v', String(score)), el('span', 'score-k', '/ 100'));
    w.append(sc);

    const bars = el('div', 'bars');
    [['Growth', c.growth], ['Craft', c.craft], ['Trust', c.trust], ['Judgment', c.judgment]]
      .forEach(([k, v]) => {
        const row = el('div', 'bar');
        row.append(el('span', 'm-key', k));
        const track = el('div', 'track');
        const fill = el('i');
        fill.style.width = Math.round(v) + '%';
        track.append(fill);
        row.append(track, el('span', 'm-val', String(Math.round(v))));
        bars.append(row);
      });
    w.append(bars);

    // The reveal: hidden state, shown as numbers for the first and only time.
    const hid = el('div', 'hidden-reveal');
    hid.append(el('p', 'eyebrow', 'What you could not see'));
    [['Tech debt', S.debt, 18], ['Team morale', S.morale, 72], ['Brand risk', S.risk, 8]]
      .forEach(([k, v, start]) => {
        const row = el('div', 'hrow');
        const moved = v - start;
        row.append(el('span', 'm-key', k),
          el('span', 'm-val', Math.round(start) + ' → ' + Math.round(v)),
          el('span', 'm-d ' + (k === 'Team morale' ? (moved >= 0 ? 'up' : 'down')
                                                   : (moved <= 0 ? 'up' : 'down')),
            (moved > 0 ? '+' : '') + Math.round(moved)));
        hid.append(row);
      });
    w.append(hid);

    const fired = history.filter(h => h.chain);
    if (fired.length) {
      const tl = el('div', 'timeline');
      tl.append(el('p', 'eyebrow', 'Where it turned'));
      fired.forEach(h => {
        const c2 = CHAINS.find(x => x.id === h.chain);
        const row = el('div', 'tl-row');
        row.append(el('span', 'tl-i', 'D' + (h.idx + 1)), el('p', null, c2.headline));
        tl.append(row);
      });
      w.append(tl);
    }

    w.append(best(score));

    const again = el('button', 'primary', 'Run it again');
    again.addEventListener('click', () => { newRun(); briefing(); });
    w.append(again);

    const note = el('p', 'footnote',
      'Scores are computed on this device. There is no account and nothing is sent anywhere. Cross-player comparison would need a backend this site does not have yet.');
    w.append(note);
    show(w);
  }

  /* Honest self-comparison: the player's own prior runs, stored locally. */
  function best(score) {
    let runs = [];
    try { runs = JSON.parse(localStorage.getItem('shipit-runs') || '[]'); } catch (e) { runs = []; }
    const prior = runs.slice();
    runs.push(score);
    try { localStorage.setItem('shipit-runs', JSON.stringify(runs.slice(-25))); } catch (e) { /* private mode */ }

    const box = el('div', 'compare');
    if (!prior.length) {
      box.append(el('p', null, 'First run. Play again and this will compare against it.'));
    } else {
      const hi = Math.max.apply(null, prior);
      const avg = Math.round(prior.reduce((a, b) => a + b, 0) / prior.length);
      box.append(el('p', null, 'Your runs: ' + (prior.length + 1) +
        ' · best ' + Math.max(hi, score) + ' · average ' + avg +
        (score > hi ? ' — this is your best yet.' : '')));
    }
    return box;
  }

  /* ---------------------------------------------------------- theme */
  const themeBtn = $('#theme');
  function syncTheme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' mode');
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = dark ? '#0b0e13' : '#ffffff';
  }
  themeBtn.addEventListener('click', () => {
    const d = document.documentElement.dataset.theme === 'dark';
    document.documentElement.dataset.theme = d ? 'light' : 'dark';
    try { localStorage.setItem('harsh-theme', document.documentElement.dataset.theme); } catch (e) {}
    syncTheme();
  });
  syncTheme();

  coldOpen();
})();
