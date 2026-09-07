import { JwtAdminPayload, JwtCustomerPayload } from '../utils/jwt.utils';

declare global {
  namespace Express {
    interface Request {
      admin?: JwtAdminPayload;
      user?: JwtCustomerPayload;
    }
  }
}

export {};
