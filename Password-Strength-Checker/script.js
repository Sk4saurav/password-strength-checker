/* ================================
   COMMON PASSWORD BLACKLIST
================================ */
const commonPasswords = [
  "password",
  "123456",
  "12345678",
  "qwerty",
  "admin",
  "password123"
];

/* ================================
   ENTROPY CALCULATION FUNCTION
================================ */
function calculateEntropy(password) {
  let pool = 0;

  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 32;

  if (pool === 0) return 0;

  return password.length * Math.log2(pool);
}

/* ================================
   PASSWORD GENERATOR FUNCTION
================================ */
function generateStrongPassword(length = 14) {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const special = "!@#$%^&*()_+[]{}<>?";

  const allChars = lower + upper + digits + special;
  let password = "";

  // Ensure at least one of each
  password += lower[Math.floor(Math.random() * lower.length)];
  password += upper[Math.floor(Math.random() * upper.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle characters
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/* ================================
   MAIN LOGIC
================================ */
$(document).ready(function () {

  /* ----------------
     SHOW / HIDE PASSWORD
  ---------------- */
  $("#toggleEye").on("click", function () {
    const input = $("#password");
    input.attr("type", input.attr("type") === "password" ? "text" : "password");
  });

  /* ----------------
     DARK MODE TOGGLE
  ---------------- */
  $("#darkMode").on("click", function () {
    $("body").toggleClass("dark");
  });

  /* ----------------
     PASSWORD GENERATOR
  ---------------- */
  $("#generatePassword").on("click", function () {
    const newPassword = generateStrongPassword();
    $("#password").val(newPassword).trigger("input");
  });

  /* ----------------
     PASSWORD INPUT HANDLER
  ---------------- */
  $("#password").on("input", function () {

    const password = $(this).val();
    const progressBar = $("#progressBar");
    const strengthText = $("#strengthText");

    // Reset UI
    progressBar
      .removeClass("bg-danger bg-warning bg-success")
      .css("width", "0%");
    $(".password-condition").removeClass("met unmet");

    /* ================================
       COMMON PASSWORD CHECK
    ================================ */
    if (password.length > 0 && commonPasswords.includes(password.toLowerCase())) {
      strengthText.text("Very Weak (Common Password)");
      progressBar.addClass("bg-danger").css("width", "20%");
      $("#entropy").text("0");
      $("#zxscore").text("0");
      return;
    }

    /* ================================
       PASSWORD CONDITIONS
    ================================ */
    const conditions = {
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      digit: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
      len8: password.length >= 8,
      len12: password.length >= 12
    };

    let score = 0;

    $.each(conditions, function (id, passed) {
      if (passed) {
        $("#" + id).addClass("met");
        score++;
      } else {
        $("#" + id).addClass("unmet");
      }
    });

    /* ================================
       ENTROPY DISPLAY
    ================================ */
    const entropy = calculateEntropy(password);
    $("#entropy").text(entropy.toFixed(2));

    /* ================================
       ZXCVBN STRENGTH
    ================================ */
    const zx = zxcvbn(password);
    $("#zxscore").text(zx.score);

    /* ================================
       FINAL STRENGTH DECISION
    ================================ */
    if (password.length === 0) {
      strengthText.text("Very Weak");
      return;
    }

    if (zx.score <= 1) {
      strengthText.text("Weak");
      progressBar.addClass("bg-danger").css("width", "25%");
    }
    else if (zx.score === 2) {
      strengthText.text("Medium");
      progressBar.addClass("bg-warning").css("width", "50%");
    }
    else {
      strengthText.text("Strong");
      progressBar.addClass("bg-success").css("width", "100%");
    }
  });

});
