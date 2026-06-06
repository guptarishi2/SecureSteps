// Normalises an Indian phone number to E.164 form (+91XXXXXXXXXX).
// Accepts inputs like "9910143711", "+919910143711", "0991 014 3711", etc.
function formatPhone(value) {
  if (value === undefined || value === null) return "";
  // Keep a leading "+" if present, strip every other non-digit.
  let digits = String(value).trim().replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    return digits; // assume already E.164
  }
  // Drop a leading country/trunk prefix if the user typed one.
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return `+91${digits}`;
}

// The bare 10-digit number, used as the socket room id / tracking link.
function localDigits(value) {
  return formatPhone(value).replace(/^\+91/, "");
}

module.exports = { formatPhone, localDigits };
