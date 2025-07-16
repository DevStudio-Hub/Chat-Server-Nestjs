import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

interface jwtPayload {
  userId: string;
  username: string;
}

interface AuthenticatedRequest extends Request {
  userId: string;
}

@Injectable()
export class GetUserIdMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const cookies = req.cookies as Record<string, string>;
    const token = cookies['token'];

    if (!token) {
      throw new UnauthorizedException('Token is not provide');
    }
    try {
      const verifyToken = await this.jwtService.verifyAsync<jwtPayload>(token);

      if (!verifyToken?.userId) {
        throw new UnauthorizedException('Token not  valid');
      }
      (req as AuthenticatedRequest).userId = verifyToken.userId;
      next();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
