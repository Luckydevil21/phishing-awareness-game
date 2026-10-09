//-------------------------------------------------------------------------------- EMAIL SHUFFLE FUNC -----------------------------------------------------------------------------------------------------//
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};


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


//----------------------------------------------------------------- NEGATIVE TIPS FUNCTION ----------------------------------------------------------------------------------------------------------//

function getRandomTip() {
  const i = Math.floor(Math.random() * tips.length);
  return tips[i];
};


//----------------------------------------------------------------- POSITIVE TIPS FUNCTION ----------------------------------------------------------------------------------------------------------//

function getRandomPositiveTip() {
  const i = Math.floor(Math.random() * positiveTips.length);
  return positiveTips[i];
};


//----------------------------------------------------------------- ELEMENTS ---------------------------------------------------------------------------------------------------------------------------//
let index = 0;
let correct = 0;
let streak = 0;
let bestStreak = 0;
let answered = false;

/* ELEMENTS */
const screens = {
  home: document.getElementById("screen-home"),
  game: document.getElementById("screen-game"),
  results: document.getElementById("screen-results")
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
};


//----------------------------------------------------------------- GAME LOGIC -----------------------------------------------------------------------------------------------------------------------//

const elFrom = document.getElementById("from");
const elSubject = document.getElementById("subject");
const elBody = document.getElementById("body");
const elFeedback = document.getElementById("feedback");


function loadEmail() {
  const email = emails[index];
  elFrom.innerHTML = email.from;
  elSubject.innerHTML = email.subject;
  elBody.innerHTML = email.body;
  elFeedback.innerHTML = "";
};


//----------------------------------------------------------------- TIPS CARD ---------------------------------------------------------------------------------------------------------------------------//

const tipsCard = document.getElementById("tips-card");
const tipsMessage = document.getElementById("tips-message");
const tipsClose = document.getElementById("tips-close");
const nextBtn = document.getElementById("btn-next");

function showTip(message) {
  tipsMessage.textContent = message;
  tipsCard.classList.remove("hidden");
  nextBtn.disabled = true;
}

tipsClose.addEventListener("click", () => {
  tipsCard.classList.add("hidden");



  index++;

  if (index >= emails.length) {
    showResults();
  } else {
    loadEmail();
  }
});


//----------------------------------------------------------------- SAFE BUTTON --------------------------------------------------------------------------------------------------------------------------//

document.getElementById("btn-safe").addEventListener("click", () => {
  const email = emails[index];
  const isCorrect = email.isPhish === false;

 if (isCorrect) {
    correct++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;

    
    playCorrectSound();
    showTip("Correct! " + getRandomPositiveTip());
  } else {
    streak = 0;
    triggerPoliceAlert();

    setTimeout(() => {
      showTip("Incorrect. " + getRandomTip());
    }, 2000);
  }
});


//----------------------------------------------------------------- PHISHING BUTTON ----------------------------------------------------------------------------------------------------------------------//

document.getElementById("btn-phish").addEventListener("click", () => {
  const email = emails[index];
  const isCorrect = email.isPhish === true;

  if (isCorrect) {
    correct++;
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    playCorrectSound();
    showTip("Correct! " + getRandomPositiveTip());
  } else {
    streak = 0;
    triggerPoliceAlert();

    setTimeout(() => {
      showTip("Incorrect. " + getRandomTip());
    }, 2000);
  }
});


//----------------------------------------------------------------- RESULTS FUNCTION --------------------------------------------------------------------------------------------------------------------//

function showResults() {
  showScreen("results");
  const accuracy = Math.round((correct / emails.length) * 100);
  document.getElementById("final-score").textContent = `${correct} / ${emails.length}`;
  document.getElementById("final-accuracy").textContent = `${accuracy}%`;
  document.getElementById("final-streak").textContent = bestStreak;
};


//----------------------------------------------------------------- FRONT PAGE BUTTON -------------------------------------------------------------------------------------------------------------------//

document.getElementById("start-btn").onclick = () => {
  index = 0;
  correct = 0;
  streak = 0;
  bestStreak = 0;

  shuffle(emails)

  loadEmail();
  showScreen("game");
};


//----------------------------------------------------------------- EMAIL DATA --------------------------------------------------------------------------------------------------------------------------//

const emails = [
  {
    from: "info.wwypv@phc.diocesewnc.org",
    subject: "We've received 62 complaints about your Email - ID:WKNOM",
    body: `
      <p>Your iClod storage is almost full. Once you exceed your storage limit, you will no longer be able to back up
      your photos, documents, contacts, and device data. This means your new
      photos and videos will stop uploading to iCloud, and cloud storage as well as cloud apps
      will no longer be updated accross your devices.</p><br>
      <p>We understand how important it is to keep your data safe.<br>
      Thats why we're offering you an exclusive deal. Click the button below to get 50GB of free storage!</P>
      <p><a href="#">Get 50GB Free</a></p>
    `,
    isPhish: true
  },
    {
    from: "info@outlook-support.dk",
    subject: "MS Outlook Support",
    body: `
    <img src="images/outlook2.png" class="left" width="150" height="150" alt="outlook logo">
     <br> Dear User,
      <p>All Hotmail customers have been upgraded to Outlook.com. Youre Hotmail Account services has expired.</p><br>
      <p>Due to our new system upgrade to Outlook. In order for it to remain active<br>follow the link sign in Re-activate your account to Outlook.<br>
      <p><a href="#">https://www.account.live.com</a></p>
      <p>Thanks,</p>
      <p>Microsoft Support Team</p>
    `,
    isPhish: true
  },
  {
    from: "Sky sky@notifications.contact.sky",
    subject: "Your password has been changed",
    body: `
    <img src="images/sky.jpg" class="center" width="150" height="150" alt="sky logo">
      <h2>Your password has been changed</h2><br>
       <p>
    As requested, we've changed the password that you use to sign into Sky services. 
    You will no longer be able to sign in using any of your previous passwords.
  </p>
  <p>
    If you didn't ask us to change your password, 
    <a href="https://www.sky.com/help" target="_blank" rel="noopener noreferrer">
      contact us
    </a> so we can help keep your account secure.
  </p>
    `,
    isPhish: false
  },
  {
    from: "Royal Mail delivery@royalmail-fee.co.uk",
    subject: "Your parcel is waiting – unpaid fee",
    body: `
    <img src="images/rm logo.webp" class="left" width="100" height="100" alt="royal mail logo">
    <p>Your parcel is being held due to an unpaid fee of £1.99.</p>
    <p>Please pay now to release your delivery.</p>
    <p><a href="#">Pay Fee</a></p>
    `,
    isPhish: true
  },
   {
    from: "NHS Appointments noreply@nhs.net",
    subject: "Appointment Reminder",
    body: `
    <img src="images/nhs.png" class="left" width="100" height="110" alt="nhs logo">
    <p>This is a reminder for your upcoming appointment.</p>
    <p>If you need to cancel or reschedule, please use the NHS App.</p>
    `,
    isPhish: false
  },
   {
    from: "Apple Support security@appleid-lock.com",
    subject: "Your Apple ID has been locked",
    body: `
    <img src="images/apple.jpg" class="left" width="100" height="100" alt="apple logo">
   <p>We detected suspicious activity on your Apple ID.</p>
    <p>Your account has been locked for your safety.</p>
    <p><a href="#">Unlock Account</a></p>
    `,
    isPhish: true
  },
   {
  from: "Amazon no-reply@amazon.co.uk",
  subject: "Your Amazon order has been dispatched",
  body: `
  <img src="images/Amazon.png" class="center" width="100" height="100" alt="amazon logo">
    <p>Your order has been dispatched and will arrive tomorrow.</p>
    <p>Track your parcel in Your Orders.</p>
  `,
  isPhish: false
},
  {
  from: "HMRC refund@tax-service-gov.uk",
  subject: "You are owed a tax refund",
  body: `
  <img src="images/HMRC-Logo.png" class="left" width="100" height="100" alt="hmrc logo">
    <p>After our annual review, you are eligible for a tax refund of £274.19 from 2020 to 2021.</p>
    <p> Follow the instructions to claim your tax refund below.</p>
    <p>You <u>MUST</u> Submit your claim within 48 hours.</p>
    <p><a href="#">Claim Refund</a></p>
  `,
  isPhish: true
},
  {
  from: "Netflix info@account.netflix.com",
  subject: "Update required - Netflix account on hold",
  body: `
  <img src="images/netflix-logo.jpg" class="center" width="150" height="150" alt="netflix logo">
    <p><b>Please update your payment details.</b></p>
    <p>We're having some trouble with your current billing information. We'll try again, but in the meantime you may want to update your payment details.</p>
    <p><a href="#">Update Account Now</a></p>
  `,
  isPhish: false
},
  {
  from: "Coleg Sir Gâr info@colegsirgar.ac.uk",
  subject: "Important student notice",
  body: `
  <img src="images/colegsirgar.png" class="left" width="150" height="150" alt="welsh college logo">
    <p>We have updated our student handbook for the new term.</p>
    <p>Please review the changes on the student portal.</p>
  `,
  isPhish: false
},
  {
  from: "rnicrosoft Account no-reply@microsoft.com",
  subject: "Your microsoft account password is expiring soon",
  body: `
  <img src="images/outlook2.png" class="left" width="150" height="150" alt="outlook logo">
    <h2>Password Expiry Notification</h2>
    <p>Dear User,</p>
    <p>This is a courtesy reminder that your Microsoft account password will expire in <strong>3 days</strong>.</p>
    <p>To maintain access to Outlook, OneDrive, and other Microsoft services, please update your password before it expires.</p>
    <p><a href="https://account.microsoft.com/security" target="_blank" rel="noopener noreferrer">Update Password</a></p>
    <p>Thank you for helping us keep your account secure.</p>
    <p>— Microsoft Account Team</p>
  `,
  isPhish: true
},
];


//----------------------------------------------------------------- RETURN TO START ----------------------------------------------------------------------------------------------------------//

document.getElementById("end-btn").onclick = () => {
  index = 0;
  correct = 0;
  streak = 0;
  bestStreak = 0;

  showScreen("home");
};

const SB_URL = 'https://YOUR-PROJECT.supabase.co';
const SB_KEY = 'YOUR-ANON-KEY';
const sbHeaders = {
  apikey: SB_KEY,
  Authorization: `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json'
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function submitScore(name, score, accuracy, streak) {
  await fetch(`${SB_URL}/rest/v1/scores`, {
    method: 'POST',
    headers: { ...sbHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ name, score, accuracy, streak })
  });
}

async function loadLeaderboard() {
  const list = document.getElementById('lb-list');
  list.textContent = 'Loading...';
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/scores?select=name,score,streak&order=score.desc,streak.desc&limit=10`,
      { headers: sbHeaders }
    );
    const rows = await res.json();
    list.textContent = '';
    rows.forEach(r => {
      const li = document.createElement('li');
      li.textContent = `${r.name} – ${r.score} (streak ${r.streak})`; // textContent avoids XSS
      list.appendChild(li);
    });
  } catch {
    list.textContent = 'Could not load leaderboard.';
  }
}

document.getElementById('end-btn').addEventListener('click', async () => {
  const name = document.getElementById('player-name').value.trim() || 'Anon';
  // replace these three with however your game stores them
  await submitScore(name, finalScore, finalAccuracy, bestStreak);
  await loadLeaderboard();
  showScreen('screen-leaderboard');
});

document.getElementById('lb-home-btn').addEventListener('click', () => showScreen('screen-home'));

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


//----------------------------------------------------------------- SHOW FLASHING OVERLAY ----------------------------------------------------------------------------------------------------//

  alertOverlay.style.display = "block";


//----------------------------------------------------------------- PLAY SOUNDS ---------------------------------------------------------------------------------------------------------------//

  if (siren) {
    siren.currentTime = 0;
    siren.play().catch(() => {});
  };

  
//----------------------------------------------------------------- AUTO STOP AFTER 2S -------------------------------------------------------------------------------------------------------//

  setTimeout(() => {
    alertOverlay.style.display = "none";
    if (siren) siren.pause();
  }, 2000);
};
//----------------------------------------------------------------- END OF CODE --------------------------------------------------------------------------------------------------------------//
