import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
}


//- sinh token reset password
async function generateResetToken(): Promise<{
  tokenPlain: string;
  tokenHash: string;
  expiresAt: Date;
}> {
  //- Sinh token ngẫu nhiên 32 bytes → chuỗi hex dài
  const tokenPlain = crypto.randomBytes(32).toString('hex');

  //- Băm token để lưu trong DB
  const tokenHash = await bcrypt.hash(tokenPlain, 10);

  //- Hạn sử dụng (15 phút)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  return { tokenPlain, tokenHash, expiresAt };
}

/**
 * Kiểm tra token người dùng gửi có khớp với token đã lưu trong DB không
 */
async function verifyResetToken(
  tokenPlain: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<boolean> {
  if (new Date() > expiresAt) return false; //- hết hạn
  return await bcrypt.compare(tokenPlain, tokenHash);
}

export { hashPassword, comparePassword, generateResetToken, verifyResetToken };
