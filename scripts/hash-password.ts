/**
 * Run: npx tsx scripts/hash-password.ts your_plain_password
 * Copy the output into ADMIN_PASSWORD in .env.local
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npx tsx scripts/hash-password.ts <password>");
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  const b64 = Buffer.from(hash).toString("base64");
  console.log("Plain hash (do not put in .env — $ gets corrupted by Next.js):");
  console.log(hash);
  console.log("\nAdd to .env:");
  console.log(`ADMIN_PASSWORD_B64=${b64}`);
});
