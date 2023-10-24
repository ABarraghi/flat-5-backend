import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { isApiBroker } from '@module/transform-layer/interface/flat-5/common.interface';

@Injectable()
@ValidatorConstraint({ name: 'isApiBroker' })
export class IsApiBroker implements ValidatorConstraintInterface {
  async validate(value: string, _validationArguments?: ValidationArguments) {
    return isApiBroker(value);
  }

  defaultMessage(_validationArguments?: ValidationArguments): string {
    return 'Broker must be one of the following: coyote, ...';
  }
}
