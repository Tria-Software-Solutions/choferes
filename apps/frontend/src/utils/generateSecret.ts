// Utility to generate a random secure password (temporal password)
export default function generateSecret(length = 12) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";
  let secret = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    secret += charset.charAt(Math.floor(Math.random() * n));
  }
  return secret;
}
