const bcrypt = require("bcrypt");

// encPass(password, "encrypt") -> returns a hash
// encPass(password, "decrypt", hashedPass) -> returns true/false
async function encPass(password, key, hashedPass, salt = 10) {
  try {
    if (key === "encrypt") {
      const passSalt = await bcrypt.genSalt(salt);
      return await bcrypt.hash(password, passSalt);
    }
    if (key === "decrypt") {
      return await bcrypt.compare(password, hashedPass);
    }
  } catch (err) {
    console.error("error in helper encPassword:", err.message);
  }
}

module.exports = encPass;