//-------------------------------------------------------------------------------- EMAIL SHUFFLE FUNC -----------------------------------------------------------------------------------------------------//
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}


//----------------------------------------------------------------- NEGATIVE PHISHING TIPS ARRAY ----------------------------------------------------------------------------------------------------//

const tips = [
  "Always check the sender’s full email address.",
  "Hover over links before clicking to reveal the real destination.",
  "Look for spelling mistakes or odd grammar scammers often rush.",
  "Be cautious of emails that create urgency or fear.",
  "Never enter passwords after clicking a link in an email.",
  "Check for mismatched or unusual domains (e.g., micr0soft-support.com).",
  "Don’t trust attachments you weren’t expecting.",
  "Banks and government services will never ask for bank details by email.",
  "If an offer seems too good to be true, it usually is.",
  "Check for generic greetings like 'Dear Customer'.",
  "Look for inconsistencies in branding, logos, or colours.",
  "Don’t trust emails asking you to 'verify your account immediately'.",
  "Never download software from links in unsolicited emails.",
  "If unsure, contact the company using their official website not the email link.",
  "Watch out for fake delivery notifications asking you to pay a fee.",
  "Multi‑factor authentication protects you even if your password leaks.",
  "Scammers often impersonate colleagues double‑check unusual requests.",
  "Don’t trust emails claiming you’ve won a prize you never entered.",
  "Check the 'reply‑to' address it may differ from the sender.",
  "Be cautious of QR codes in unexpected emails.",
  "Never approve MFA prompts you didn’t trigger yourself.",
  "When in doubt, report it — better safe than sorry."
];


//----------------------------------------------------------------- POSITIVE PHISHING TIPS ARRAY ----------------------------------------------------------------------------------------------------//

const positiveTips = [
  "Great job! You spotted the red flags quickly.",
  "Nice work your cyber instincts are sharp.",
  "Staying alert keeps you safe online.",
  "Well done! You analysed that email like a pro.",
  "Excellent! You’re building strong phishing‑detection skills.",
  "Spot on that’s exactly what a real analyst would do.",
  "Good catch! You’re getting harder to fool.",
  "Brilliant! You recognised the signs immediately.",
  "Always trust your instincts when something feels off.",
  "Nice! You’re improving your cyber awareness."
];


//----------------------------------------------------------------- TIPS FUNCTIONS ----------------------------------------------------------------------------------------------------------//

function getRandomTip() {
  return tips[Math.floor(Math.random() * tips.length)];
}

function getRandomPositiveTip() {
  return positiveTips[Math.floor(Math.random() * positiveTips.length)];
}


//----------------------------------------------------------------- STATE + SCREENS ---------------------------------------------------------------------------------------------------------------//

let index = 0;
let correct = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let answered = false;
let foundFlags = new Set();

// Scoring: right call = VERDICT_POINTS. Phishing emails add up to FLAG_POINTS more,
// scaled by how many red flags were found. Flag points only count if the call was right.
const VERDICT_POINTS = 60;
const FLAG_POINTS = 40;

const screens = {
  home: document.getElementById("screen-home"),
  game: document.getElementById("screen-game"),
  results: document.getElementById("screen-results"),
  leaderboard: document.getElementById("screen-leaderboard")
};

function showScreen(name) {
  Object.values(screens).forEach(s => s && s.classList.remove("active"));
  if (screens[name]) screens[name].classList.add("active");
}


//----------------------------------------------------------------- EMAIL CARD (CLIENT LOOK + INSPECTION) -------------------------------------------------------------------------------------//

const emailCard = document.querySelector("#screen-game .email-card");
const elFeedback = document.getElementById("feedback");

const DEFAULT_INSPECTOR = "Tap anything that looks suspicious: the sender, spelling, grammar or links.";
const DEFAULT_STATUS = "Hover over a link to see where it really goes";

function loadEmail() {
  const email = emails[index];
  foundFlags = new Set();

  const initial = (email.initial || email.name.replace(/<[^>]*>/g, "").trim().charAt(0)).toUpperCase();

  emailCard.innerHTML = `
    <div class="email-subject">${email.subject}</div>
    <div class="email-sender">
      <div class="avatar" style="background:${email.color}">${initial}</div>
      <div class="sender-info">
        <div class="sender-line">
          <span class="sender-name">${email.name}</span>
          <span class="sender-addr">&lt;${email.addr}&gt;</span>
        </div>
        <div class="sender-to">to me</div>
      </div>
      <div class="email-date">${email.date}</div>
    </div>
    <div class="email-body">${email.body}</div>
    <div class="inspector" id="inspector">${DEFAULT_INSPECTOR}</div>
    <div class="status-row">
      <span id="link-status">${DEFAULT_STATUS}</span>
      <span id="flag-count">🚩 0</span>
    </div>
  `;
  elFeedback.innerHTML = "";
}

function setInspector(text, kind) {
  const box = document.getElementById("inspector");
  box.textContent = text;
  box.className = "inspector " + (kind || "");
}

function setStatus(url) {
  document.getElementById("link-status").textContent = url ? "🔗 " + url : DEFAULT_STATUS;
}

function updateFlagCount() {
  document.getElementById("flag-count").textContent = "🚩 " + foundFlags.size;
}

// Hovering a link shows where it REALLY goes (never navigates anywhere)
emailCard.addEventListener("mouseover", e => {
  const link = e.target.closest("a");
  if (link) setStatus(link.dataset.url);
});

emailCard.addEventListener("mouseout", e => {
  if (e.target.closest("a")) setStatus("");
});

emailCard.addEventListener("click", e => {
  const link = e.target.closest("a");
  if (link) {
    e.preventDefault();
    setStatus(link.dataset.url); // so touch devices can see the destination too
  }

  const flag = e.target.closest(".flag");
  if (flag) {
    foundFlags.add(flag);
    flag.classList.add("found");
    flag.classList.remove("missed");
    updateFlagCount();
    setInspector("🚩 " + flag.dataset.tip, "is-flag");
  } else if (e.target.closest(".email-body, .email-sender, .email-subject")) {
    setInspector("Nothing suspicious about that.", "is-ok");
  }
});

// After answering: reveal every red flag and build the explanation for the tip card
function buildDebrief(email) {
  const flags = [...emailCard.querySelectorAll(".flag")];
  const missed = flags.filter(f => !foundFlags.has(f));

  flags.forEach(f => f.classList.add(foundFlags.has(f) ? "found" : "missed"));

  const out = [email.why];
  missed.forEach(f => out.push("Missed: " + f.dataset.tip));
  return out;
}


//----------------------------------------------------------------- TIPS CARD ---------------------------------------------------------------------------------------------------------------------------//

const tipsCard = document.getElementById("tips-card");
const tipsMessage = document.getElementById("tips-message");
const tipsClose = document.getElementById("tips-close");

const tipsDetails = document.createElement("ul");
tipsDetails.id = "tips-details";
tipsMessage.insertAdjacentElement("afterend", tipsDetails);

function showTip(message, details = []) {
  tipsMessage.textContent = message;
  tipsDetails.textContent = "";
  details.forEach((text, i) => {
    const li = document.createElement("li");
    li.textContent = text;
    if (i === 0) li.className = "tips-why";
    tipsDetails.appendChild(li);
  });
  tipsCard.classList.remove("hidden");
}

tipsClose.addEventListener("click", () => {
  tipsCard.classList.add("hidden");
  answered = false;
  index++;

  if (index >= emails.length) {
    showResults();
  } else {
    loadEmail();
  }
});


//----------------------------------------------------------------- ANSWER BUTTONS --------------------------------------------------------------------------------------------------------------------//

function handleAnswer(guessPhish) {
  if (answered) return;
  answered = true;

  const email = emails[index];
  const isCorrect = email.isPhish === guessPhish;
  const flagTotal = emailCard.querySelectorAll(".flag").length;
  const flagsFound = foundFlags.size;
  const details = buildDebrief(email);

  if (isCorrect) {
    const flagPoints = flagTotal ? Math.round(FLAG_POINTS * flagsFound / flagTotal) : 0;
    const earned = VERDICT_POINTS + flagPoints;
    score += earned;
    correct++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;

    details.splice(1, 0, flagTotal
      ? `+${earned} points: ${VERDICT_POINTS} for the right call and ${flagPoints} for finding ${flagsFound} of ${flagTotal} red flags.`
      : `+${earned} points for the right call.`);

    playCorrectSound();
    showTip("Correct! " + getRandomPositiveTip(), details);
  } else {
    streak = 0;

    details.splice(1, 0, flagTotal
      ? `+0 points. You found ${flagsFound} of ${flagTotal} red flags, but they only score when you make the right call.`
      : "+0 points.");

    triggerPoliceAlert();
    setTimeout(() => {
      showTip("Incorrect. " + getRandomTip(), details);
    }, 2000);
  }
}

document.getElementById("btn-safe").onclick = () => handleAnswer(false);
document.getElementById("btn-phish").onclick = () => handleAnswer(true);


//----------------------------------------------------------------- RESULTS FUNCTION --------------------------------------------------------------------------------------------------------------------//

function showResults() {
  showScreen("results");
  const accuracy = Math.round((correct / emails.length) * 100);
  const flagged = emails.filter(e => `${e.name}${e.addr}${e.subject}${e.body}`.includes('class="flag"')).length;
  const maxScore = emails.length * VERDICT_POINTS + flagged * FLAG_POINTS;
  document.getElementById("final-score").textContent = `${score} / ${maxScore}`;
  document.getElementById("final-accuracy").textContent = `${accuracy}%`;
  document.getElementById("final-streak").textContent = bestStreak;
}


//----------------------------------------------------------------- FRONT PAGE BUTTON -------------------------------------------------------------------------------------------------------------------//

document.getElementById("start-btn").onclick = () => {
  index = 0;
  correct = 0;
  streak = 0;
  bestStreak = 0;
  score = 0;
  answered = false;

  shuffle(emails);

  loadEmail();
  showScreen("game");
};


//----------------------------------------------------------------- EMAIL DATA HELPERS ----------------------------------------------------------------------------------------------------------------//
// F(text, tip)       -> a hidden "red flag" the player can find by tapping it (spelling, grammar, sender, wording)
// L(text, url, tip)  -> a link. Hovering/tapping shows the REAL url. Add a tip if the link itself is a red flag.

const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const F = (text, tip) => `<span class="flag" data-tip="${esc(tip)}">${text}</span>`;

const L = (text, url, tip) =>
  tip
    ? `<a href="#" class="flag" data-url="${esc(url)}" data-tip="${esc(tip)}">${text}</a>`
    : `<a href="#" data-url="${esc(url)}">${text}</a>`;


//----------------------------------------------------------------- EMAIL DATA --------------------------------------------------------------------------------------------------------------------------//

const emails = [
  {
    name: "iCloud Support",
    addr: F("info.wwypv@phc.diocesewnc.org", "Random-looking address on a diocese (church) domain. Nothing to do with Apple or iCloud."),
    color: "#3b82f6",
    date: "Tue 6 Oct, 09:14",
    subject: F("We've received 62 complaints about your Email - ID:WKNOM", "The subject has nothing to do with the message (it is about storage). Odd claims and fake ID codes are used to look official."),
    body: `
      <p>Your ${F("iClod", "Misspelt brand name. Apple’s service is called iCloud.")} storage is almost full. Once you exceed your storage limit, you will no longer be able to back up
      your photos, documents, contacts, and device data. This means your new
      photos and videos will stop uploading to iCloud, and cloud storage as well as cloud apps
      will no longer be updated ${F("accross", "Spelling mistake: “across”. Real companies proof-read their emails.")} your devices.</p>
      <p>We understand how important it is to keep your data safe.<br>
      ${F("Thats", "Missing apostrophe: “That’s”. Sloppy grammar is a classic warning sign.")} why we're offering you an exclusive deal. Click the button below to get 50GB of free storage!</p>
      <p>${L("Get 50GB Free", "http://icloud-storage-bonus.xyz/claim?id=62", "Too-good-to-be-true offer, and the link goes to a random .xyz site, not apple.com or icloud.com.")}</p>
    `,
    isPhish: true,
    why: "Phishing: the sender is unrelated to Apple, there are spelling and grammar mistakes, and the “free storage” link goes to a random website."
  },
  {
    name: "Outlook Support",
    addr: F("info@outlook-support.dk", "Microsoft doesn’t email from a .dk support domain. Real Microsoft emails come from microsoft.com."),
    color: "#0078d4",
    date: "Tue 6 Oct, 11:02",
    subject: "MS Outlook Support",
    body: `
    <img src="images/outlook2.png" class="left" width="150" height="150" alt="outlook logo">
      <p>${F("Dear User", "Generic greeting. A real provider would use your name.")},</p>
      <p>All Hotmail customers have been upgraded to Outlook.com. ${F("Youre Hotmail Account services has expired", "Grammar mistakes (“Your Hotmail account services have expired”). Also a scare tactic.")}.</p>
      <p>Due to our new system upgrade to Outlook. In order for it to remain active, follow the link sign in Re-activate your account to Outlook.</p>
      <p>${L("https://www.account.live.com", "http://outlook-reactivate.dk/login", "The link text says account.live.com but it really goes somewhere else. Always check where a link goes before clicking.")}</p>
      <p>Thanks,<br>Microsoft Support Team</p>
    `,
    isPhish: true,
    why: "Phishing: the sender isn’t Microsoft, the greeting is generic, the grammar is poor, and the link text hides a different destination."
  },
  {
    name: "Sky",
    addr: "sky@notifications.contact.sky",
    color: "#1d4ed8",
    date: "Mon 5 Oct, 18:41",
    subject: "Your password has been changed",
    body: `
    <img src="images/sky.jpg" class="center" width="150" height="150" alt="sky logo">
      <h2>Your password has been changed</h2>
      <p>As requested, we've changed the password that you use to sign into Sky services.
      You will no longer be able to sign in using any of your previous passwords.</p>
      <p>If you didn't ask us to change your password, ${L("contact us", "https://www.sky.com/help")} so we can help keep your account secure.</p>
    `,
    isPhish: false,
    why: "Legit: the sender domain belongs to Sky, the link goes to sky.com, the writing is clean and nothing pressures you to act."
  },
  {
    name: "Royal Mail",
    addr: F("delivery@royalmail-fee.co.uk", "Royal Mail uses royalmail.com. “royalmail-fee.co.uk” is a lookalike domain made up for this scam."),
    color: "#dc2626",
    date: "Wed 7 Oct, 07:56",
    subject: "Your parcel is waiting – unpaid fee",
    body: `
    <img src="images/rm logo.webp" class="left" width="100" height="100" alt="royal mail logo">
    <p>Your parcel is being held due to an ${F("unpaid fee of £1.99", "Tiny “fees” are a common scam to steal your card details.")}.</p>
    <p>${F("Please pay now", "Pressure to act immediately is a classic phishing tactic.")} to release your delivery.</p>
    <p>${L("Pay Fee", "http://royalmail-fee.co.uk/pay?ref=RM88213", "Not royalmail.com. This leads to a fake card payment page.")}</p>
    `,
    isPhish: true,
    why: "Phishing: a lookalike Royal Mail domain, a small fee, and pressure to pay now. Real fees are paid through royalmail.com, not an emailed link."
  },
  {
    name: "NHS Appointments",
    addr: "noreply@nhs.net",
    color: "#005eb8",
    date: "Wed 7 Oct, 08:30",
    subject: "Appointment Reminder",
    body: `
    <img src="images/nhs.png" class="left" width="100" height="110" alt="nhs logo">
    <p>This is a reminder for your upcoming appointment.</p>
    <p>If you need to cancel or reschedule, please use the NHS App.</p>
    `,
    isPhish: false,
    why: "Legit: it comes from nhs.net, contains no links or payment requests, and sends you to the official NHS App instead."
  },
  {
    name: "Apple Support",
    addr: F("security@appleid-lock.com", "Apple emails come from apple.com. Extra words like “-lock” in the domain are a giveaway."),
    color: "#374151",
    date: "Wed 7 Oct, 13:20",
    subject: "Your Apple ID has been locked",
    body: `
    <img src="images/apple.jpg" class="left" width="100" height="100" alt="apple logo">
    <p>${F("We detected suspicious activity on your Apple ID.", "Fear tactic: scammers invent a problem so you panic and click.")}</p>
    <p>Your account has been locked for your safety.</p>
    <p>${L("Unlock Account", "http://appleid-lock.com/unlock", "Goes to appleid-lock.com, not apple.com. It would steal your Apple ID login.")}</p>
    `,
    isPhish: true,
    why: "Phishing: a lookalike domain, a scary “account locked” message, and an unlock link that goes to the same fake domain."
  },
  {
    name: "Amazon",
    addr: "no-reply@amazon.co.uk",
    color: "#f59e0b",
    date: "Thu 8 Oct, 10:05",
    subject: "Your Amazon order has been dispatched",
    body: `
    <img src="images/Amazon.png" class="center" width="100" height="100" alt="amazon logo">
    <p>Your order has been dispatched and will arrive tomorrow.</p>
    <p>Track your parcel in ${L("Your Orders", "https://www.amazon.co.uk/gp/css/order-history")}.</p>
    `,
    isPhish: false,
    why: "Legit: genuine amazon.co.uk sender, a link that goes to amazon.co.uk, and no request for payment or login details."
  },
  {
    name: "HMRC",
    addr: F("refund@tax-service-gov.uk", "Real HMRC emails end in hmrc.gov.uk. “tax-service-gov.uk” only imitates a government address."),
    color: "#1e3a8a",
    date: "Thu 8 Oct, 15:48",
    subject: "You are owed a tax refund",
    body: `
    <img src="images/HMRC-Logo.png" class="left" width="100" height="100" alt="hmrc logo">
    <p>After our annual review, ${F("you are eligible for a tax refund of £274.19", "Unexpected money. HMRC doesn’t email refund offers or ask you to claim through a link.")} from 2020 to 2021.</p>
    <p>Follow the instructions to claim your tax refund below.</p>
    <p>You ${F("<u>MUST</u> Submit your claim within 48 hours", "Artificial deadline and shouting capitals. A random capital “S” in “Submit” is another sign of rushed writing.")}.</p>
    <p>${L("Claim Refund", "http://tax-service-gov.uk/refund/claim", "Goes to the fake tax-service-gov.uk site, not gov.uk.")}</p>
    `,
    isPhish: true,
    why: "Phishing: a fake government domain, an unexpected refund, a 48-hour deadline, and a link to a non-gov.uk site."
  },
  {
    name: "Netflix",
    addr: "info@account.netflix.com",
    color: "#e50914",
    date: "Fri 9 Oct, 06:33",
    subject: "Update required - Netflix account on hold",
    body: `
    <img src="images/netflix-logo.jpg" class="center" width="150" height="150" alt="netflix logo">
    <p><b>Please update your payment details.</b></p>
    <p>We're having some trouble with your current billing information. We'll try again, but in the meantime you may want to update your payment details.</p>
    <p>${L("Update Account Now", "https://www.netflix.com/youraccount")}</p>
    `,
    isPhish: false,
    why: "Legit: the sender is a real netflix.com subdomain, the link goes to netflix.com, and the tone is calm. Even so, the safest habit is to open the app or site yourself."
  },
  {
    name: "Coleg Sir Gâr",
    addr: "info@colegsirgar.ac.uk",
    color: "#7c3aed",
    date: "Fri 9 Oct, 09:12",
    subject: "Important student notice",
    body: `
    <img src="images/colegsirgar.png" class="left" width="150" height="150" alt="welsh college logo">
    <p>We have updated our student handbook for the new term.</p>
    <p>Please review the changes on the student portal.</p>
    `,
    isPhish: false,
    why: "Legit: it comes from the college’s own .ac.uk domain, has no suspicious links, and points you to the student portal rather than asking for details."
  },
  {
    name: F("rnicrosoft Account", "“rn” has been swapped in for “m”, so “rnicrosoft” looks like “Microsoft” at a glance."),
    initial: "M",
    addr: F("no-reply@rnicrosoft.com", "The domain is rnicrosoft.com (r + n), not microsoft.com."),
    color: "#f25022",
    date: "Fri 9 Oct, 14:27",
    subject: `Your ${F("microsoft", "Microsoft’s name is capitalised. Small slips like this are common in phishing emails.")} account password is expiring soon`,
    body: `
    <img src="images/outlook2.png" class="left" width="150" height="150" alt="outlook logo">
    <h2>Password Expiry Notification</h2>
    <p>${F("Dear User", "Generic greeting. A real provider would use your name.")},</p>
    <p>This is a courtesy reminder that your Microsoft account password will ${F("expire in <strong>3 days</strong>", "Artificial deadline to rush you into clicking. Microsoft doesn’t work this way.")}.</p>
    <p>To maintain access to Outlook, OneDrive, and other Microsoft services, please update your password before it expires.</p>
    <p>${L("Update Password", "http://rnicrosoft-account.com/security", "Goes to rnicrosoft-account.com, a lookalike domain, not microsoft.com.")}</p>
    <p>Thank you for helping us keep your account secure.<br>— Microsoft Account Team</p>
    `,
    isPhish: true,
    why: "Phishing: “rnicrosoft” imitates Microsoft using “rn” for “m”. It also uses a generic greeting, a deadline, and a link to a lookalike domain."
  }
];


//----------------------------------------------------------------- LEADERBOARD (SUPABASE) -------------------------------------------------------------------------------------------------------//

const SB_URL = 'https://yqzvrvuqybounqzisyan.supabase.co';
const SB_KEY = 'sb_publishable_3sDDYyXO4i_dqdza2D9T4g_ox5BDoy1';
const sbHeaders = {
  apikey: SB_KEY,
  'Content-Type': 'application/json'
};

async function submitScore(name, score, accuracy, streak) {
  const res = await fetch(`${SB_URL}/rest/v1/scores`, {
    method: 'POST',
    headers: { ...sbHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ name, score, accuracy, streak })
  });
  if (!res.ok) throw new Error('Score submit failed');
}

async function loadLeaderboard() {
  const list = document.getElementById('lb-list');

  const showMsg = text => {
    list.textContent = '';
    const li = document.createElement('li');
    li.className = 'lb-msg';
    li.textContent = text;
    list.appendChild(li);
  };

  showMsg('Loading...');
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/scores?select=name,score,streak&order=score.desc,streak.desc&limit=10`,
      { headers: sbHeaders }
    );
    if (!res.ok) throw new Error('Load failed');
    const rows = await res.json();
    if (!rows.length) return showMsg('No scores yet. Be the first!');

    list.textContent = '';
    rows.forEach((r, i) => {
      const li = document.createElement('li');
      const parts = [
        ['lb-rank', i + 1],
        ['lb-name', r.name],
        ['lb-score', r.score],
        ['lb-streak', `streak ${r.streak}`]
      ];
      parts.forEach(([cls, text]) => {
        const span = document.createElement('span');
        span.className = cls;
        span.textContent = text;   // textContent keeps names safe from XSS
        li.appendChild(span);
      });
      list.appendChild(li);
    });
  } catch (e) {
    console.error(e);
    showMsg('Could not load leaderboard.');
  }
}


//----------------------------------------------------------------- SUBMIT / END BUTTON ----------------------------------------------------------------------------------------------------------//

document.getElementById("end-btn").onclick = async () => {
  const btn = document.getElementById("end-btn");
  btn.disabled = true;

  const nameInput = document.getElementById("player-name");
  const name = (nameInput && nameInput.value.trim()) || "Anon";
  const accuracy = Math.round((correct / emails.length) * 100);

  try {
    await submitScore(name, score, accuracy, bestStreak);
  } catch {}

  await loadLeaderboard();
  showScreen("leaderboard");
  btn.disabled = false;
};

document.getElementById("lb-home-btn").onclick = () => {
  const nameInput = document.getElementById("player-name");
  if (nameInput) nameInput.value = "";
  showScreen("home");
};


//----------------------------------------------------------------- CORRECT ANSWER -----------------------------------------------------------------------------------------------------------//

function playCorrectSound() {
  const sound = document.getElementById("correct-sound");
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}


//----------------------------------------------------------------- POLICE ALERT -------------------------------------------------------------------------------------------------------------//

function triggerPoliceAlert() {
  const alertOverlay = document.getElementById("police-alert");
  const siren = document.getElementById("siren-sound");

  alertOverlay.style.display = "block";

  if (siren) {
    siren.currentTime = 0;
    siren.play().catch(() => {});
  }

  setTimeout(() => {
    alertOverlay.style.display = "none";
    if (siren) siren.pause();
  }, 2000);
}
//----------------------------------------------------------------- END OF CODE --------------------------------------------------------------------------------------------------------------//
