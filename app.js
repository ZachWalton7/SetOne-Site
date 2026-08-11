/* ==========================================================================
   SetOne — landing page behavior
   No analytics. No third-party scripts. Just the waitlist and the badge swap.
   ========================================================================== */

// ── Launch switch ─────────────────────────────────────────────────────────
// Pre-launch: null → show the waitlist.
// Launch day: paste the App Store URL → the hero CTA swaps to Apple's badge.
const APP_STORE_URL = null;

// ── Waitlist backend (Supabase, insert-only under RLS) ────────────────────
const SUPABASE_URL = "https://pcupaezqkvgetnuwrtcw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9qztrf-FJOtSv9DBNbMQAA_ZqSpZi8N";

async function joinWaitlist(email) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ email }),
  });
  // 201 = joined; 409 = already on the list (treat as success).
  return res.status === 201 || res.status === 409;
}

// ── Copy (in voice) ───────────────────────────────────────────────────────
const MSG = {
  invalid: "That doesn't look like an email. Check it.",
  loading: "Adding you…",
  success: "You're on the list. The story, the date, the link. Then we stop.",
  error: "Didn't go through. Try again in a minute.",
};

// Reasonable email check. RFC-perfect isn't the point; catching typos is.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setStatus(el, text, kind) {
  el.textContent = text;
  el.classList.remove("is-error", "is-success");
  if (kind) el.classList.add(`is-${kind}`);
}

function wireForm(form) {
  if (!form) return;
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector(".waitlist-status");

  // Clear the invalid state as soon as they start fixing it.
  input.addEventListener("input", () => {
    input.removeAttribute("aria-invalid");
    if (status.classList.contains("is-error")) setStatus(status, "");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!EMAIL_RE.test(email)) {
      input.setAttribute("aria-invalid", "true");
      setStatus(status, MSG.invalid, "error");
      input.focus();
      return;
    }

    button.disabled = true;
    button.classList.add("is-loading");
    setStatus(status, MSG.loading);

    let ok = false;
    try {
      ok = await joinWaitlist(email);
    } catch (_) {
      ok = false;
    }

    button.classList.remove("is-loading");

    if (ok) {
      // Success is a terminal state: lock the row, keep it quiet.
      setStatus(status, MSG.success, "success");
      input.value = "";
      input.disabled = true;
      button.disabled = true;
      const label = button.querySelector(".btn-label");
      if (label) label.textContent = "On the list";
    } else {
      button.disabled = false;
      setStatus(status, MSG.error, "error");
    }
  });
}

// ── App Store badge swap (launch day) ─────────────────────────────────────
// Apple's "Download on the App Store" badge, per marketing guidelines. This is
// a faithful inline recreation for the pre-launch build; before shipping,
// replace it with Apple's official downloaded asset.
function appStoreBadgeMarkup(url) {
  return `
    <a href="${url}" aria-label="Download SetOne on the App Store"
       target="_blank" rel="noopener">
      <svg class="appstore-badge" viewBox="0 0 120 40" role="img"
           aria-label="Download on the App Store" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="40" rx="8" fill="#000"/>
        <rect x="0.5" y="0.5" width="119" height="39" rx="7.5" fill="none"
              stroke="#A6A6A6" stroke-opacity="0.5"/>
        <path fill="#fff" d="M24.77 20.3c-.02-2.35 1.92-3.48 2-3.53-1.09-1.6-2.79-1.82-3.39-1.84-1.44-.15-2.82.85-3.55.85-.74 0-1.86-.83-3.07-.81-1.57.02-3.03.92-3.84 2.33-1.66 2.87-.42 7.1 1.17 9.42.79 1.14 1.73 2.41 2.96 2.36 1.19-.05 1.64-.76 3.08-.76 1.43 0 1.84.76 3.09.74 1.28-.02 2.09-1.15 2.86-2.29.92-1.31 1.29-2.6 1.31-2.66-.03-.01-2.5-.96-2.53-3.8zM22.43 12.9c.65-.79 1.09-1.89.97-2.99-.94.04-2.09.63-2.76 1.4-.6.69-1.13 1.79-.99 2.86 1.05.08 2.13-.53 2.78-1.27z"/>
        <text x="34" y="16" fill="#fff" font-family="system-ui, sans-serif" font-size="7" font-weight="400">Download on the</text>
        <text x="34" y="29" fill="#fff" font-family="system-ui, sans-serif" font-size="15" font-weight="600" letter-spacing="-0.3">App Store</text>
      </svg>
    </a>`;
}

function applyLaunchState() {
  if (!APP_STORE_URL) return; // pre-launch: waitlist stays.

  const heroCta = document.querySelector(".hero-cta");
  const badgeSlot = document.getElementById("appstore-cta");
  if (heroCta) heroCta.classList.add("is-launched");
  if (badgeSlot) {
    badgeSlot.innerHTML = appStoreBadgeMarkup(APP_STORE_URL);
    badgeSlot.hidden = false;
  }

  // Turn the closing-section form into a badge link too.
  const closing = document.getElementById("waitlist-form-2");
  if (closing) {
    const wrapper = document.createElement("div");
    wrapper.className = "appstore-cta";
    wrapper.innerHTML = appStoreBadgeMarkup(APP_STORE_URL);
    closing.replaceWith(wrapper);
  }
}

// ── Init ──────────────────────────────────────────────────────────────────
document.querySelectorAll(".waitlist").forEach(wireForm);
applyLaunchState();
