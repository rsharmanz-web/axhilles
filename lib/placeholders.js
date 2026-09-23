// Tokens from the mascot brief. Edit here; leave mascot-prompt.js untouched.
// {{MASCOT_NAME}} {{BOOKING_LINK}} {{READING_LIST_LINK}} {{PRIVACY_URL}}
module.exports = {
  MASCOT_NAME: "Axhilles",
  BOOKING_LINK: "https://calendly.com/r-sharma-nz/30min",
  READING_LIST_LINK: "https://axhilles.com/readings/",
  PRIVACY_URL: "{{PRIVACY_URL}}",
};

function fillMascotPrompt(template) {
  return template
    .replaceAll("{{MASCOT_NAME}}", module.exports.MASCOT_NAME)
    .replaceAll("{{BOOKING_LINK}}", module.exports.BOOKING_LINK)
    .replaceAll("{{READING_LIST_LINK}}", module.exports.READING_LIST_LINK);
}

module.exports.fillMascotPrompt = fillMascotPrompt;
