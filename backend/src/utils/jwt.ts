import jwt, { JwtPayload } from 'jsonwebtoken';

const ACCESS_TTL  = '15m';
const REFRESH_TTL = '30d';
const ISSUER      = 'luxe-time-travel';

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface RefreshPayload {
  id : string;
  role: UserRole;
  jti : string;
  exp : number;
}

export function signAccess(payload: JwtPayload) {
  const { exp, iat, nbf, aud, iss, sub, jti, ...claims } = payload;
  return jwt.sign(claims, process.env.JWT_SECRET!, {
    expiresIn : ACCESS_TTL,
    issuer    : ISSUER,
    audience  : 'user',
    algorithm : 'HS256',
  });
}

export function verify(token: string, aud: 'user' | 'refresh') {
  return jwt.verify(token, process.env.JWT_SECRET!, {
    issuer     : ISSUER,
    audience   : aud,
    algorithms : ['HS256'],
  }) as JwtPayload;
}

export function signRefresh(
  payload: Omit<RefreshPayload, 'jti' | 'exp'>,
  jti: string
) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    issuer    : ISSUER,
    audience  : 'refresh',
    algorithm : 'HS256',
    expiresIn : REFRESH_TTL,
    jwtid     : jti,
  });
}

export function verifyRefresh(token: string): RefreshPayload {
  return jwt.verify(token, process.env.JWT_SECRET!, {
    issuer     : ISSUER,
    audience   : 'refresh',
    algorithms : ['HS256'],
  }) as RefreshPayload;
}