/* Ship It — decision content.
   12 decisions across 4 quarters, 5 options each.

   Options carry raw effects only. Nothing is labelled worst/best here on purpose:
   ranking is computed against accumulated state at play time (see sim-engine.js),
   so the same option can be the strongest play in Q1 and the one that ends the
   run in Q3. Flags set here are what later decisions read.

   Effect units: gmv in crore, mau in millions, nps points, crash percentage
   points, runway in months, debt/morale/risk on 0-100 internal scales. */

const START = {
  gmv: 48.2, mau: 2.14, nps: 48, crash: 0.42, runway: 14.2,
  debt: 18, morale: 72, risk: 8,
  flags: {}
};

const TARGET = { gmv: 56.8, mau: 2.5 };

const QUARTERS = [
  { id: 'q1', name: 'Q1', theme: 'Make the number', brief: 'Board call is in 48 hours. Your checkout runs on a 2021 Postgres monolith nobody has owned since March. Every quarter you spend fixing that is a quarter you do not spend growing.' },
  { id: 'q2', name: 'Q2', theme: 'Scale it', brief: 'Growth held. Now finance wants the unit economics to work, and three teams want headcount you do not have.' },
  { id: 'q3', name: 'Q3', theme: 'Pressure', brief: 'Big Billion Day is this quarter. Whatever you built in Q1 is about to meet eight times the traffic it was tested at.' },
  { id: 'q4', name: 'Q4', theme: 'Reckoning', brief: 'The board meets in six weeks. Everything you deferred has an owner now, and it is you.' }
];

const DECISIONS = [
  /* ---------------------------------------------------------------- Q1 */
  {
    q: 'q1', title: 'Checkout is bleeding on 3G',
    scene: [
      { who: 'Priyal Sharma', role: 'GROWTH', tone: 'data', text: 'Drop-off at payment intent is 38.4% on 3G across Tier-2 — Lucknow, Patna, Indore. That is roughly ₹2.1Cr of GMV a week walking out before Friday peak.' },
      { who: 'Ananya Iyer', role: 'VP ENG', tone: 'warn', text: 'The payment service is monolithic Postgres replicas from 2021. BLR-CENTRAL-01 is at 89% connection pool. Whatever we bolt on, it sits on that.' },
      { who: 'Rohan Sen', role: 'DESIGN', tone: 'calm', text: 'We prototyped a one-tap UPI sheet. Checkout dropped from 18s to 3.4s in testing. Marketing wants three promo banners inside it.' },
      { who: 'Vikram Mehta', role: 'CEO', tone: 'push', text: 'Board call is in 48 hours. I do not care about the plumbing. What are we shipping?' }
    ],
    options: [
      { label: 'Ship one-tap checkout, bypass the inventory hold',
        detail: 'Skip row-level reservation on Tier-2 so the drawer is instant. Defer the webhook ack to background workers.',
        fx: { gmv: 3.2, mau: 0.05, nps: -7, crash: 0.47, debt: 16, morale: -11 },
        sets: ['inventory_bypass'] },
      { label: 'Freeze features two weeks, split the payment service',
        detail: 'No customer-facing releases. Pay down the monolith now and swallow flat GMV this sprint.',
        fx: { gmv: -1.4, mau: -0.02, nps: 1, debt: -12, morale: 9, runway: -0.4 },
        sets: ['paid_down_early'] },
      { label: 'Ship the stripped UPI sheet, cut the promo banners',
        detail: 'Rohan\'s prototype as tested. Payload down 62%. Tell marketing no.',
        fx: { gmv: 1.6, mau: 0.03, nps: 6, crash: -0.04, debt: 2, morale: 4 },
        sets: ['design_won'] },
      { label: 'Roll the 10-minute express badge with manual dispatch',
        detail: 'Ops absorbs the strain over WhatsApp. Top-line conversion now, process debt later.',
        fx: { gmv: 2.4, mau: 0.06, nps: -3, debt: 5, morale: -9, risk: 6 },
        sets: ['manual_ops'] },
      { label: 'Tell the board you need one more sprint',
        detail: 'No shipping this week. Buy time to do it properly. Vikram will not enjoy the call.',
        fx: { gmv: -0.8, nps: 0, debt: -4, morale: 6, risk: 4 },
        sets: ['bought_time'] }
    ]
  },
  {
    q: 'q1', title: 'Vernacular navigation for Tier-3',
    scene: [
      { who: 'Priyal Sharma', role: 'GROWTH', tone: 'data', text: 'Tier-3 signups are up 40% but D7 retention is 11%. They install, they cannot read the category tree, they leave.' },
      { who: 'Rohan Sen', role: 'DESIGN', tone: 'calm', text: 'Hindi and Marathi cover 60% of that cohort. Voice navigation covers more but it is a quarter of work, not a sprint.' },
      { who: 'Ananya Iyer', role: 'VP ENG', tone: 'warn', text: 'Every string in the app is hardcoded. Localisation means touching 400 components. There is no i18n layer.' }
    ],
    options: [
      { label: 'Hardcode Hindi strings into the top 20 screens',
        detail: 'Fastest path to a demo. Ships in nine days. No i18n layer, so every future language repeats the work.',
        fx: { gmv: 0.9, mau: 0.08, nps: 3, debt: 13, morale: -7 },
        sets: ['no_i18n'] },
      { label: 'Build the i18n layer first, then Hindi and Marathi',
        detail: 'Six weeks. Nothing visible for a month, then every language is cheap forever.',
        fx: { gmv: -0.3, mau: 0.04, nps: 2, debt: -8, morale: 8, runway: -0.3 },
        sets: ['paid_down_early'] },
      { label: 'Ship icon-first navigation, no text at all',
        detail: 'Sidesteps language entirely. Works for groceries. Rohan thinks it tests well; nobody has tested it.',
        fx: { gmv: 0.4, mau: 0.05, nps: -2, debt: 1, morale: 2 } },
      { label: 'Voice navigation, full quarter commitment',
        detail: 'The thing that actually unlocks Tier-3. Costs you everything else this quarter.',
        fx: { gmv: -1.8, mau: 0.11, nps: 7, debt: 4, morale: -4, runway: -0.8 },
        sets: ['voice_bet'] },
      { label: 'Do nothing — Tier-3 is not the ICP this year',
        detail: 'Focus the quarter on Tier-1 and Tier-2 where the money already is.',
        fx: { gmv: 1.1, mau: -0.03, nps: -1, morale: -2 } }
    ]
  },
  {
    q: 'q1', title: 'Growth wants a referral programme',
    scene: [
      { who: 'Priyal Sharma', role: 'GROWTH', tone: 'push', text: 'Blended CAC is ₹310. Referral would land us nearer ₹90. Every competitor is running one.' },
      { who: 'Vikram Mehta', role: 'CEO', tone: 'push', text: 'If it moves MAU before the board call, do it.' },
      { who: 'Ananya Iyer', role: 'VP ENG', tone: 'warn', text: 'Referral means a wallet. A wallet means money movement, reconciliation and an audit trail. That is not a sprint, that is a system.' }
    ],
    options: [
      { label: 'Cash-in-wallet referral, reconcile manually for now',
        detail: 'Finance runs a spreadsheet each Friday. Ships in two weeks. Works until it does not.',
        fx: { gmv: 2.1, mau: 0.14, nps: 2, debt: 11, morale: -6, risk: 9 },
        sets: ['manual_recon'] },
      { label: 'Discount-coupon referral, no money movement',
        detail: 'Weaker incentive, no wallet, no reconciliation, no regulatory surface.',
        fx: { gmv: 1.2, mau: 0.07, nps: 3, debt: 2, morale: 2 } },
      { label: 'Build the wallet properly with an audit trail',
        detail: 'Eight weeks and a compliance review before a single rupee moves.',
        fx: { gmv: -0.6, mau: 0.03, debt: -5, morale: 5, risk: -6, runway: -0.6 },
        sets: ['clean_wallet'] },
      { label: 'Paid acquisition instead — buy the MAU',
        detail: 'Predictable, instant, and it stops the moment you stop paying.',
        fx: { gmv: 1.8, mau: 0.16, nps: -1, runway: -1.1, morale: -1 },
        sets: ['bought_growth'] },
      { label: 'No referral. Fix retention first.',
        detail: 'Pouring users into a leaky funnel is more expensive than fixing the funnel.',
        fx: { gmv: 0.3, mau: -0.01, nps: 5, debt: -3, morale: 6 },
        sets: ['retention_first'] }
    ]
  },

  /* ---------------------------------------------------------------- Q2 */
  {
    q: 'q2', title: 'Finance wants margin on every cart',
    scene: [
      { who: 'Vikram Mehta', role: 'CEO', tone: 'push', text: 'Contribution margin is negative on 38% of orders. Investors have noticed. We need a lever.' },
      { who: 'Priyal Sharma', role: 'GROWTH', tone: 'data', text: 'Auto-adding a ₹9 delivery-protection fee tests at 94% acceptance. Because nobody sees it.' },
      { who: 'Rohan Sen', role: 'DESIGN', tone: 'warn', text: 'They do not see it because we hid it. I want that on the record.' }
    ],
    options: [
      { label: 'Auto-add delivery protection, opt-out buried in settings',
        detail: '94% acceptance, ₹9 a cart, immediate margin. Rohan wants it minuted that he objected.',
        fx: { gmv: 4.1, nps: -12, debt: 1, morale: -14, risk: 24 },
        sets: ['dark_pattern'] },
      { label: 'Offer protection as a clear opt-in at checkout',
        detail: '31% take rate instead of 94%. A third of the revenue, none of the exposure.',
        fx: { gmv: 1.3, nps: 2, morale: 4, risk: -2 },
        sets: ['clean_monetisation'] },
      { label: 'Raise the free-delivery threshold by ₹100',
        detail: 'Honest, visible, and users will complain loudly for two weeks.',
        fx: { gmv: 2.2, mau: -0.04, nps: -5, morale: 1 } },
      { label: 'Launch sponsored placements for brands',
        detail: 'Real margin, but it means ranking results by who paid rather than what is good.',
        fx: { gmv: 3.4, nps: -6, debt: 7, morale: -5, risk: 11 },
        sets: ['ads'] },
      { label: 'Cut the loss-making SKUs instead',
        detail: 'Fix margin by selling less of what loses money. GMV drops; the business gets healthier.',
        fx: { gmv: -2.6, mau: -0.05, nps: 1, morale: 3, runway: 1.4 },
        sets: ['cut_skus'] }
    ]
  },
  {
    q: 'q2', title: 'Vendors are not getting paid on time',
    scene: [
      { who: 'Ananya Iyer', role: 'VP ENG', tone: 'warn', text: 'Settlement is four days late on average. The reconciliation job times out because it reads from the same replicas checkout uses.' },
      { who: 'Priyal Sharma', role: 'GROWTH', tone: 'data', text: 'Vendor churn is 6% this month, up from 2%. Supply is how this works.' },
      { who: 'Vikram Mehta', role: 'CEO', tone: 'calm', text: 'Two of the big grocery chains have asked for a call. That is never a good call.' }
    ],
    options: [
      { label: 'Move settlement to its own read replica',
        detail: 'Two sprints of infrastructure. Fixes the timeout and takes load off checkout.',
        fx: { gmv: 0.4, debt: -14, morale: 7, runway: -0.5 },
        sets: ['paid_down_early'] },
      { label: 'Pay vendors early from the balance sheet, fix it later',
        detail: 'Buys goodwill immediately. Burns cash and leaves the job broken.',
        fx: { gmv: 0.8, nps: 2, runway: -1.6, debt: 4, morale: -2 },
        sets: ['cash_patch'] },
      { label: 'Batch settlement weekly instead of daily',
        detail: 'The job stops timing out because it runs less. Vendors wait longer by design.',
        fx: { gmv: 0.2, nps: -3, debt: 3, morale: -4, risk: 7 } },
      { label: 'Give the top 50 vendors a dedicated settlement lane',
        detail: 'Protects the supply that matters. The long tail waits and notices.',
        fx: { gmv: 1.1, nps: -4, debt: 6, morale: -3, risk: 9 } },
      { label: 'Put an ops team on manual settlement every night',
        detail: 'Works tomorrow. Costs six people their evenings indefinitely.',
        fx: { gmv: 0.6, debt: 8, morale: -16, runway: -0.4 },
        sets: ['manual_ops'] }
    ]
  },
  {
    q: 'q2', title: 'A competitor launches 10-minute delivery',
    scene: [
      { who: 'Vikram Mehta', role: 'CEO', tone: 'push', text: 'They launched in four cities this morning. My phone has not stopped. Investors are asking what our answer is.' },
      { who: 'Ananya Iyer', role: 'VP ENG', tone: 'warn', text: 'Ten minutes means dark stores, dispatch routing and inventory accuracy we do not have. Our stock counts drift by 4% daily.' },
      { who: 'Rohan Sen', role: 'DESIGN', tone: 'calm', text: 'Our users mostly do weekly grocery baskets. They are not the ten-minute use case.' }
    ],
    options: [
      { label: 'Match it — launch 10-minute in four cities now',
        detail: 'Answer the narrative. Build the dark-store network while it is live.',
        fx: { gmv: 4.8, mau: 0.18, nps: -9, crash: 0.3, debt: 19, morale: -13, runway: -2.2 },
        sets: ['ten_min'] },
      { label: 'Launch a 30-minute promise you can actually keep',
        detail: 'Slower headline, kept promise. Positions on reliability rather than speed.',
        fx: { gmv: 2.3, mau: 0.08, nps: 8, debt: 5, morale: 3 },
        sets: ['reliability_play'] },
      { label: 'Fix inventory accuracy first, speed later',
        detail: 'Unglamorous. It is also the thing that makes any delivery promise possible.',
        fx: { gmv: 0.5, nps: 4, debt: -11, morale: 8, runway: -0.4 },
        sets: ['paid_down_early'] },
      { label: 'Announce 10-minute, ship it in two quarters',
        detail: 'Buy the news cycle now and the engineering bill arrives later.',
        fx: { gmv: 1.9, mau: 0.09, nps: -6, morale: -8, risk: 17 },
        sets: ['announced_vapour'] },
      { label: 'Ignore it and double down on basket size',
        detail: 'Your users buy weekly. Compete where you already win.',
        fx: { gmv: 2.0, mau: -0.02, nps: 3, morale: 2 },
        sets: ['focused'] }
    ]
  },

  /* ---------------------------------------------------------------- Q3 */
  {
    q: 'q3', title: 'Ananya has another offer',
    scene: [
      { who: 'Ananya Iyer', role: 'VP ENG', tone: 'calm', text: 'I am not negotiating. I am telling you because you should hear it from me. Three of my on-call engineers have been paged every night for five weeks.' },
      { who: 'Vikram Mehta', role: 'CEO', tone: 'push', text: 'We cannot lose her eight weeks before Big Billion Day.' },
      { who: 'Priyal Sharma', role: 'GROWTH', tone: 'data', text: 'Attrition is 24% annualised. It was 9% last year.' }
    ],
    options: [
      { label: 'Counter-offer and promise a hiring plan',
        detail: 'Money and a promise. The pages continue tonight.',
        fx: { gmv: 0, morale: 4, runway: -0.7, debt: 2 } },
      { label: 'Freeze the roadmap for a stability sprint',
        detail: 'Nothing ships for three weeks. The pager stops. The board asks why velocity died.',
        fx: { gmv: -2.2, debt: -18, morale: 22, risk: 6 },
        sets: ['stability_sprint'] },
      { label: 'Hire two SREs and give her the budget',
        detail: 'Right answer, eight weeks too late to help before peak.',
        fx: { gmv: -0.4, debt: -6, morale: 11, runway: -1.3 } },
      { label: 'Accept it and promote from within',
        detail: 'Her deputy is good and has never run an incident at this scale.',
        fx: { gmv: 0.3, debt: 7, morale: -9, crash: 0.08 },
        sets: ['ananya_left'] },
      { label: 'Ask her to stay through Big Billion Day, then go',
        detail: 'Honest, transactional, and she will remember being asked.',
        fx: { gmv: 0.2, morale: -6, debt: 1 },
        sets: ['ananya_leaving'] }
    ]
  },
  {
    q: 'q3', title: 'Big Billion Day — eight times traffic',
    detonator: true,
    scene: [
      { who: 'Priyal Sharma', role: 'GROWTH', tone: 'data', text: 'Three weeks out. Forecast is 8.2× normal peak, concentrated in a 90-minute window on day one.' },
      { who: 'Ananya Iyer', role: 'VP ENG', tone: 'warn', text: 'I need to know what we are promising before I know whether we survive it.' },
      { who: 'Vikram Mehta', role: 'CEO', tone: 'push', text: 'This is the quarter. Whatever the number is, we beat it.' }
    ],
    options: [
      { label: 'Full promo push — deep discounts, every channel',
        detail: 'Maximum traffic, maximum headline, maximum load on whatever you built in Q1.',
        fx: { gmv: 9.4, mau: 0.28, nps: -2, crash: 0.2, debt: 8, morale: -8, runway: -1.4 },
        sets: ['full_push'] },
      { label: 'Staggered launch — city by city over four days',
        detail: 'Flattens the peak. Smaller headline, survivable load.',
        fx: { gmv: 5.6, mau: 0.16, nps: 4, crash: 0.04, debt: 2, morale: 4 },
        sets: ['staggered'] },
      { label: 'Load-test and fix for two weeks, then a modest push',
        detail: 'Spend the runway on confidence rather than reach.',
        fx: { gmv: 3.1, mau: 0.08, nps: 6, crash: -0.12, debt: -13, morale: 9, runway: -0.6 },
        sets: ['load_tested'] },
      { label: 'Queue users at the door above a traffic ceiling',
        detail: 'Nobody gets a 500. Some people get a waiting room and a countdown.',
        fx: { gmv: 4.4, mau: 0.11, nps: -4, crash: -0.2, debt: 3, morale: 2 },
        sets: ['queue'] },
      { label: 'Sit this one out — no event this year',
        detail: 'Defensible, and it will be read as weakness by everyone outside the building.',
        fx: { gmv: -1.2, mau: -0.04, nps: 1, morale: -5, risk: 12 } }
    ]
  },
  {
    q: 'q3', title: 'Customer phone numbers are in the logs',
    scene: [
      { who: 'Ananya Iyer', role: 'VP ENG', tone: 'warn', text: 'An intern found it. Order payloads have been writing full phone numbers and addresses into application logs. Retention on those logs is 90 days.' },
      { who: 'Rohan Sen', role: 'DESIGN', tone: 'calm', text: 'How many users?' },
      { who: 'Ananya Iyer', role: 'VP ENG', tone: 'warn', text: 'All of them. Since the Q1 checkout work.' }
    ],
    options: [
      { label: 'Purge logs, patch it, disclose to users this week',
        detail: 'Costly, slow, and the only version of this you can defend in a year.',
        fx: { gmv: -1.6, nps: -4, debt: -6, morale: 12, risk: -22 },
        sets: ['disclosed'] },
      { label: 'Patch it quietly and purge the logs',
        detail: 'No disclosure. No evidence. No sleep.',
        fx: { gmv: 0, nps: 0, debt: -3, morale: -11, risk: 16 },
        sets: ['covered_up'] },
      { label: 'Patch it, keep the logs for the incident review',
        detail: 'Methodical and leaves the exposure in place while you investigate.',
        fx: { gmv: -0.3, debt: -4, morale: 2, risk: 6 } },
      { label: 'Full audit of every data path before touching anything',
        detail: 'Three weeks, no shipping, and you will find more than this.',
        fx: { gmv: -2.8, debt: -16, morale: 6, risk: -14, runway: -0.7 },
        sets: ['full_audit'] },
      { label: 'Log it as a P2 and schedule it after the quarter',
        detail: 'There is a lot on. It has been like this for months already.',
        fx: { gmv: 0.4, morale: -15, risk: 28 },
        sets: ['deferred_pii'] }
    ]
  },

  /* ---------------------------------------------------------------- Q4 */
  {
    q: 'q4', title: 'The board wants a path to profitability',
    scene: [
      { who: 'Vikram Mehta', role: 'CEO', tone: 'calm', text: 'The next round is not happening at this burn. They want eighteen months of runway and a credible story.' },
      { who: 'Priyal Sharma', role: 'GROWTH', tone: 'data', text: 'Half our GMV comes from cohorts that are margin-negative after delivery cost.' }
    ],
    options: [
      { label: 'Cut the growth budget, keep the team',
        detail: 'MAU flattens. Nobody leaves. The story is slower and true.',
        fx: { gmv: -2.4, mau: -0.09, nps: 1, morale: 5, runway: 3.2 } },
      { label: 'Reduce headcount by 15%',
        detail: 'Fastest route to runway. You will spend the next two quarters rebuilding trust.',
        fx: { gmv: -1.1, debt: 12, morale: -26, runway: 4.1 },
        sets: ['layoffs'] },
      { label: 'Exit the three worst-margin cities',
        detail: 'Smaller, healthier, and an admission in public that you overreached.',
        fx: { gmv: -3.8, mau: -0.14, nps: -2, morale: -4, runway: 3.6 },
        sets: ['retreat'] },
      { label: 'Push monetisation harder across the board',
        detail: 'Fees, ads, delivery charges. Extract more from the users you already have.',
        fx: { gmv: 3.9, nps: -14, morale: -7, risk: 18, runway: 1.8 },
        sets: ['squeeze'] },
      { label: 'Raise a bridge round on current metrics',
        detail: 'Buys time without changing anything. Dilutive and entirely dependent on your numbers holding.',
        fx: { gmv: 0.2, runway: 5.0, morale: -2, risk: 10 },
        sets: ['bridge'] }
    ]
  },
  {
    q: 'q4', title: 'A consumer-protection notice arrives',
    scene: [
      { who: 'Vikram Mehta', role: 'CEO', tone: 'warn', text: 'Legal forwarded it an hour ago. They are asking about auto-added charges and disclosure at checkout. There is a thirty-day window to respond.' },
      { who: 'Rohan Sen', role: 'DESIGN', tone: 'calm', text: 'I would like to point out that this is the thing I asked to be minuted.' }
    ],
    options: [
      { label: 'Remove the charges, refund retroactively, respond fully',
        detail: 'Expensive, immediate, and ends the story in one news cycle.',
        fx: { gmv: -4.2, nps: 14, morale: 10, risk: -32, runway: -1.2 },
        sets: ['made_good'] },
      { label: 'Make the charges opt-in going forward, no refunds',
        detail: 'Fixes it prospectively and leaves the past where it is.',
        fx: { gmv: -1.8, nps: 6, morale: 3, risk: -14 } },
      { label: 'Respond narrowly through counsel, change nothing',
        detail: 'Defensible for now. The second notice will not be a notice.',
        fx: { gmv: 0.3, nps: -3, morale: -9, risk: 15 } },
      { label: 'Improve the disclosure copy and keep the default',
        detail: 'A larger font on the thing people still will not read.',
        fx: { gmv: -0.4, nps: -1, morale: -6, risk: 7 } },
      { label: 'Get ahead of it — publish what happened and what changed',
        detail: 'Publish before anyone asks. High variance, and the only move that compounds.',
        fx: { gmv: -2.4, nps: 18, morale: 13, risk: -26 },
        sets: ['transparent'] }
    ]
  },
  {
    q: 'q4', title: 'What do you tell the board?',
    scene: [
      { who: 'Vikram Mehta', role: 'CEO', tone: 'calm', text: 'Six slides, Thursday. I will not edit them. Whatever you put up there is what we are committing to for next year.' }
    ],
    options: [
      { label: 'Lead with GMV growth and the headline numbers',
        detail: 'Show the number they asked for. Let the rest come up in questions, if it does.',
        fx: { gmv: 0.6, nps: -1, morale: -5, risk: 9 },
        sets: ['told_the_number'] },
      { label: 'Lead with the system risks you inherited and fixed',
        detail: 'Reframe the year as reliability work. Only credible if you actually did it.',
        fx: { gmv: -0.3, morale: 9, risk: -8 },
        sets: ['told_the_truth'] },
      { label: 'Show the real unit economics, including the bad cohorts',
        detail: 'Hard conversation now instead of a harder one in March.',
        fx: { gmv: -0.6, nps: 2, morale: 12, risk: -12, runway: 0.4 },
        sets: ['told_the_truth'] },
      { label: 'Present the plan for next year, light on this one',
        detail: 'Forward-looking, energetic, and entirely silent about what happened.',
        fx: { gmv: 0.2, morale: -3, risk: 6 } },
      { label: 'Give them the full picture and ask for what you need',
        detail: 'Everything: the debt, the attrition, the exposure, and the budget to fix it.',
        fx: { gmv: -0.4, morale: 16, risk: -16, runway: 0.8 },
        sets: ['told_the_truth', 'asked_for_help'] }
    ]
  }
];

/* --------------------------------------------------------------------
   Dependency graph. Each rule watches for a flag plus a state threshold
   and fires on a later decision, rewriting the outcome. These are the
   moments where a reasonable Q1 choice becomes the thing that ends the run.
   -------------------------------------------------------------------- */

const CHAINS = [
  {
    id: 'checkout_collapse',
    at: 7,                                   // Big Billion Day
    when: s => s.flags.inventory_bypass && s.debt >= 55 && (s.flags.full_push || s.flags.ten_min),
    headline: 'Checkout went down for 41 minutes at peak.',
    body: 'The inventory hold you bypassed in Q1 became load-bearing. Under 8× traffic the worker pool backed up, oversold 11,400 orders, and took payments for stock that did not exist.',
    fx: { gmv: -11.2, nps: -22, crash: 1.4, morale: -18, risk: 30 }
  },
  {
    id: 'checkout_held',
    at: 7,
    when: s => s.flags.load_tested || (s.flags.paid_down_early && s.debt < 35),
    headline: 'Peak held. No incidents above sev-3.',
    body: 'The work you did earlier in the year is the reason nothing broke. Nobody outside engineering will ever know that.',
    fx: { gmv: 2.4, nps: 7, morale: 10 }
  },
  {
    id: 'recon_blowup',
    at: 4,
    when: s => s.flags.manual_recon,
    headline: 'Reconciliation broke at 40,000 referrals.',
    body: 'The Friday spreadsheet stopped closing. ₹1.8Cr in wallet balances cannot be matched to orders, and finance will not sign off the quarter.',
    fx: { gmv: -2.1, morale: -9, risk: 14, runway: -0.8 }
  },
  {
    id: 'i18n_tax',
    at: 5,
    when: s => s.flags.no_i18n,
    headline: 'Marathi took as long as Hindi did.',
    body: 'With no i18n layer, every new language is a fresh pass over 400 components. The second one cost exactly what the first one cost.',
    fx: { debt: 9, morale: -7, gmv: -0.6 }
  },
  {
    id: 'attrition_cascade',
    at: 8,
    when: s => s.morale <= 32 || s.flags.ananya_left,
    headline: 'Two senior engineers resigned this week.',
    body: 'They were the only people who understood the settlement path. Nothing is on fire today. Everything takes three times longer starting now.',
    fx: { debt: 15, morale: -8, crash: 0.1, gmv: -1.4 }
  },
  {
    id: 'regulator',
    at: 10,
    when: s => s.flags.dark_pattern || s.flags.squeeze,
    headline: 'The notice names the auto-added fee specifically.',
    body: 'Someone forwarded a screenshot of the buried opt-out to a consumer forum in April. It has been circulating since.',
    fx: { risk: 12, nps: -6 }
  },
  {
    id: 'pii_surfaces',
    at: 11,
    when: s => s.flags.covered_up || s.flags.deferred_pii,
    headline: 'A journalist has the log samples.',
    body: 'The exposure you did not disclose is now a question you are answering in public, in the same week as the board meeting.',
    fx: { nps: -19, risk: 26, morale: -14, gmv: -2.2 }
  },
  {
    id: 'vapour_due',
    at: 8,
    when: s => s.flags.announced_vapour,
    headline: 'Two quarters later, there is still no 10-minute delivery.',
    body: 'You announced it in Q2. The press asked again this week. There is no version of the answer that sounds good.',
    fx: { nps: -11, risk: 13, morale: -6 }
  }
];

/* Archetypes, resolved against the four category scores at the end. */
const ARCHETYPES = [
  { id: 'operator',   name: 'The Operator',            when: c => c.growth >= 60 && c.craft >= 60 && c.trust >= 60,
    line: 'You grew the business without mortgaging it. This is rarer than it sounds and nobody will thank you for it.' },
  { id: 'hacker',     name: 'The Growth Hacker',       when: c => c.growth >= 70 && c.trust < 45,
    line: 'You hit every number the board asked for. The people who use your product paid for it.' },
  { id: 'craft',      name: 'The Craftsperson',        when: c => c.craft >= 70 && c.growth < 45,
    line: 'The system you leave behind is clean, fast and well understood. You missed the target that decided whether anyone inherits it.' },
  { id: 'arsonist',   name: 'The Arsonist',            when: c => c.craft < 35 && c.growth >= 55,
    line: 'Everything worked right up until it did not. The next PM will spend a year on what you did in four quarters.' },
  { id: 'diplomat',   name: 'The Diplomat',            when: c => c.trust >= 70 && c.growth < 55,
    line: 'Your team would follow you anywhere. The board is less certain about where that is.' },
  { id: 'firefighter',name: 'The Firefighter',         when: c => c.judgment >= 60 && c.craft < 50,
    line: 'You read every room correctly and spent the year reacting to the last thing that broke.' },
  { id: 'caretaker',  name: 'The Caretaker',           when: c => c.growth < 40 && c.craft < 50,
    line: 'Not much broke. Not much happened. The board has questions about the second part.' },
  { id: 'survivor',   name: 'The Survivor',            when: () => true,
    line: 'You got to Q4 with a business still standing. Given how Q1 started, that is a result.' }
];
