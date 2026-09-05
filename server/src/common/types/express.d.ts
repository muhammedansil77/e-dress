import { JwtAdminPayload } from '../utils/jwt.utils';

declare global {
  namespace Express {
    interface Request {
      admin?: JwtAdminPayload;
    }
  }
}
