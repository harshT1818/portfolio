const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
function syncTheme() {
  const dark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#101318' : '#ffffff';
}
themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('harsh-theme', root.dataset.theme); } catch {}
  syncTheme();
});
syncTheme();

const email = 'harshlthaker18@gmail.com';
const copyButton = document.querySelector('.copy-email');
let copyTimer;
copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(email);
    copyButton.firstChild.textContent = 'Copied ';
    document.querySelector('.copy-status').textContent = 'Email address copied to clipboard.';
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyButton.firstChild.textContent = 'Copy email '; }, 2500);
  } catch {
    document.querySelector('.copy-status').classList.remove('sr-only');
    document.querySelector('.copy-status').textContent = email;
  }
});

const stories = {
  survey: {
    number: '01', label: 'PRODUCT & DEVELOPMENT · SURVEY PLATFORM',
    title: 'A focused flow for better timing data.',
    lead: 'The goal was accurate question-level time tracking, with a survey experience that still handled conditional logic, revisits, and different devices.',
    tags: ['Requirements', 'UX flows', 'Development'],
    role: 'I defined the requirements and UX flows, then developed the feature itself in JavaScript, JSX, and CSS — building the one-question-at-a-time flow, its navigation, and its timing behaviour, and carrying it through edge cases, QA, and launch.',
    decisions: [
      'Keep one question active at a time, with Previous / Next controls and a question navigation panel.',
      'Preserve answers when a question is revisited, and account for time spent across revisits.',
      'Respect display and skip logic so hidden questions cannot be reached through navigation.',
      'Validate required answers on final submission, then focus the first invalid question.',
      'Handle keyboard navigation, mobile swipe, long-question scrolling, feature flags, and backward compatibility.'
    ],
    outcome: 'The design connected focused navigation with question-level timing and defined how the flow should behave across revisits, hidden questions, and submission errors.',
    measures: [ ['Primary signal', 'Coverage and accuracy of question-level timing.'], ['Guardrails', 'Survey completion, navigation errors, and interviewer feedback.'] ],
    demo: true
  },
  audit: {
    number: '02', label: 'WORKFLOW AUTOMATION · AUDIT CRM',
    title: 'Bring structure to audit operations.',
    lead: 'Audits need to reach the right people, workloads need to stay visible, and exceptions need a clear path through the operation.',
    tags: ['Workflow definition', 'Allocation logic', 'Quality control'],
    role: 'I helped define and deliver automated workload distribution, allocation logic, auditor dashboards, exception handling, and operational tracking.',
    decisions: [
      'Define allocation behavior around the operational workflow.',
      'Give auditors and operations teams visibility into assigned work and progress.',
      'Treat exception handling as a core product workflow.',
      'Translate quality-control requirements into product behavior and delivery details.'
    ],
    outcome: 'The delivered capabilities included automated workload distribution, auditor dashboards, and exception tracking.',
    scale: 'In September 1–28, 2026, the supplied Audit CRM data reports 207,375 samples audited and a peak of 271 daily active auditors on September 25. These figures describe the product’s operating scale; they do not measure the incremental effect of this workflow change.',
    measures: [ ['Workflow efficiency', 'Allocation time and audit turnaround.'], ['Operational quality', 'Workload balance and exception resolution time.'] ]
  },
  ai: {
    number: '03', label: 'AI PRODUCT · SURVEY RESPONSE CLEANING',
    title: 'AI cleaning, from requirements to adoption.',
    lead: 'A live, adopted AI workflow for cleaning survey samples, including “other” cases and subjective responses.',
    tags: ['Requirements & wireframes', 'QA & adoption', 'Continuous improvement'],
    role: 'I owned requirements documentation, UI/UX wireframing, QA, and adoption. After adoption, I continued improving the workflow as project requirements changed.',
    decisionsHeading: 'My work across the lifecycle',
    decisions: [
      'Document requirements for the survey-response cleaning workflow.',
      'Translate requirements into UI/UX wireframes.',
      'Carry out QA for the workflow.',
      'Support adoption of the live capability.',
      'Make regular improvements based on updated project requirements after adoption.'
    ],
    outcome: 'The AI-cleaning capability is live and adopted for survey samples. Product work continues after adoption as project needs evolve.',
    scale: '66,992 AI-cleaned groups were reported for September 1–28, 2026. This is workflow volume, not a count of individual samples or a measured accuracy or time-saving result.',
    measures: [ ['Cleaning quality', 'Agreement with human-reviewed decisions on a defined evaluation set.'], ['Adoption & efficiency', 'Repeat usage, manual corrections, and time required to complete cleaning.'] ]
  },
  form: {
    number: '04', label: 'PRODUCT QUALITY · FIELD AGENT CREATION',
    title: 'A failed submission shouldn’t erase someone’s work.',
    lead: 'When the API rejected a field-agent creation request, the frontend cleared the entire form. A duplicate email or mobile number meant entering everything again.',
    tags: ['Frontend change', 'Error handling', 'Regression validation'],
    role: 'I made a hands-on frontend change and checked the behavior across validation errors, API rejections, and successful creation.',
    decisions: [
      'Return a success or failure result from the API action.',
      'Reset the form only after a successful creation response.',
      'Keep entered values intact when server-side validation rejects a request.',
      'Test frontend validation, API rejection, and successful creation separately.'
    ],
    outcome: 'Failed submissions retained the entered values. Users could correct the issue without re-entering the entire form.',
    measures: [ ['Recovery', 'Successful submission after an error.'], ['User effort', 'Repeat-entry time and form abandonment.'] ]
  }
};
const dialog = document.querySelector('#story-dialog');
let opener;
const demoQuestions = [
  { title: 'What makes a product feel reliable?', answers: ['Predictable behavior', 'Clear feedback', 'Recovery when something goes wrong'] },
  { title: 'Where would you start with a complex workflow?', answers: ['Understand the user’s task', 'Map the failure paths', 'Define success clearly'] },
  { title: 'What matters after a release?', answers: ['Observe actual usage', 'Investigate friction', 'Learn and iterate'] }
];
let question = 0;
let selectedAnswers = [null, null, null];
function renderDemo() {
  const host = document.querySelector('#interactive-demo');
  if (!host) return;
  host.innerHTML = `<div class="demo-head"><span>ILLUSTRATIVE INTERACTION</span><span>QUESTION ${question + 1} OF 3</span></div><div class="demo-progress"><span style="width:${(question + 1) / 3 * 100}%"></span></div><h4 id="demo-question">${demoQuestions[question].title}</h4><div aria-labelledby="demo-question" role="group">${demoQuestions[question].answers.map((answer, i) => `<button class="demo-answer" data-answer="${i}" aria-pressed="${selectedAnswers[question] === i}">${answer}</button>`).join('')}</div><div class="demo-nav"><button data-step="-1" ${question === 0 ? 'disabled' : ''}>← Previous</button><span>Go back. Your answer stays.</span><button data-step="1" ${question === 2 ? 'disabled' : ''}>Next →</button></div>`;
  host.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
    selectedAnswers[question] = Number(button.dataset.answer);
    host.querySelectorAll('[data-answer]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  }));
  host.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
    const step = Number(button.dataset.step);
    question = Math.max(0, Math.min(2, question + step));
    renderDemo();
    const control = host.querySelector(`[data-step="${step}"]`);
    if (!control.disabled) control.focus(); else host.querySelector(`[data-step="${-step}"]`).focus();
  }));
}
function showStory(key, trigger) {
  const story = stories[key];
  if (!story) return;
  opener = trigger;
  document.querySelector('#story-number').textContent = story.number;
  document.querySelector('#story-content').innerHTML = `<article class="story"><span class="story-label">${story.label}</span><h2 id="story-title">${story.title}</h2><p class="story-lead">${story.lead}</p><div class="story-meta">${story.tags.map(tag => `<span>${tag}</span>`).join('')}</div><section class="story-section"><h3>My contribution</h3><p>${story.role}</p></section><section class="story-section"><h3>${story.decisionsHeading || 'Decisions that mattered'}</h3><ul>${story.decisions.map(decision => `<li>${decision}</li>`).join('')}</ul></section><section class="story-section outcome"><h3>What changed</h3><p>${story.outcome}</p></section>${story.demo ? '<section class="story-section"><h3>Try the interaction</h3><p>A simplified illustration of navigation and answer retention.</p><div id="interactive-demo" class="demo"></div></section>' : ''}<section class="story-section"><h3>How I’d evaluate it</h3><div class="measurement">${story.measures.map(([name, detail]) => `<div><strong>${name}</strong><span>${detail}</span></div>`).join('')}</div><p class="evidence-note">Measurement criteria, not quantified results. Verified impact data will be added when available.</p></section></article>`;
  if (story.scale) {
    const section = document.createElement('section');
    section.className = 'story-section product-scale';
    const heading = document.createElement('h3');
    heading.textContent = 'Product scale';
    const copy = document.createElement('p');
    copy.textContent = story.scale;
    section.append(heading, copy);
    document.querySelector('.story .outcome').after(section);
  }
  question = 0;
  selectedAnswers = [null, null, null];
  renderDemo();
  dialog.showModal();
  document.body.classList.add('dialog-open');
  dialog.scrollTop = 0;
  document.querySelector('.close-dialog').focus();
}
document.querySelectorAll('[data-story]').forEach(button => button.addEventListener('click', () => showStory(button.dataset.story, button)));
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  opener?.focus({ preventScroll: true });
});

const navigation = [...document.querySelectorAll('nav a')];
if ('IntersectionObserver' in window) {
  const visibleSections = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visibleSections.add(entry.target.id); else visibleSections.delete(entry.target.id);
    }
    const current = navigation.find(link => visibleSections.has(link.hash.slice(1)));
    navigation.forEach(link => {
      if (link === current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-90px 0px -45% 0px' });
  navigation.forEach(link => observer.observe(document.querySelector(link.hash)));
}
