import { authenticator, totp } from 'otplib';

totp.options = { digits: 6 };
totp.options = { window: 1 };

export async function generateSecret() {
  const secret = authenticator.generateSecret();
  return secret;
}

export async function generateToken() {
  const secret = await generateSecret()
  const token = totp.generate(secret);
  return {token, secret};
}

export async function verifyToken({ token, secret }: { token: string; secret: string }) {
  try {
    const isValid = totp.verify({ token, secret });
    return isValid;
  } catch (err) {
    // Possible errors
    // - options validation
    // - "Invalid input - it is not base32 encoded string" (if thiry-two is used)
    console.error(err);
    return;
  }
}
