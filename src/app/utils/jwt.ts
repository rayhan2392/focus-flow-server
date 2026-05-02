import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export const generateToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);

  return token;
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
  const verifiedToken = jwt.verify(token, secret) as JwtPayload;

  return verifiedToken;
};