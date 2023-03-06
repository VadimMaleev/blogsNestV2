import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class IpRestrictionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    type InputType = {
      endpoint: string;
      ip: string;
      countInput: number;
      timeInput: number;
    };

    const url = request.url;
    const ip = request.ip;
    const ipObject: InputType[] = [];

    const input = {
      endpoint: url,
      ip: ip,
      countInput: ipObject.length + 1,
      timeInput: +new Date(),
    };

    ipObject.push(input);

    const ipAddresses = ipObject.filter((o) => o.ip === ip);
    const endpointObject = ipAddresses.filter((o) => o.endpoint === url);
    const countsArray = endpointObject.filter(
      (o) => o.timeInput > +new Date() - 10000,
    );

    if (countsArray.length >= 5)
      throw new HttpException('ip-restriction', HttpStatus.TOO_MANY_REQUESTS);

    return true;
  }
}
