import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { ROLE_KEY } from '../decorators/roles.decorator';
import { PayloadToken } from '../models/token.model';
import { Role } from '../models/roles.model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // roles = ['admin'] la variable roles es un array con los roles que encontro en la metadata
    const roles = this.reflector.get<Role[]>(ROLE_KEY, context.getHandler());
    if (!roles) {
      return true;
    }
    // La amanera de obtenber un request dentro del guardian
    const request = context.switchToHttp().getRequest();
    const user = request.user as PayloadToken; // obtendriamos { role: admin, sub: 1212 }
    const isAuth = roles.some((role) => role === user.role);
    if (!isAuth) {
      throw new UnauthorizedException('your role is wrong');
    }
    return isAuth;
  }
}
