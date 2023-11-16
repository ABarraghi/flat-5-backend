import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import * as dayjs from 'dayjs';

@ValidatorConstraint({ name: 'isAfterNow', async: false })
export class IsAfterNow implements ValidatorConstraintInterface {
  validate(propertyValue: string, _args: ValidationArguments) {
    return dayjs(propertyValue) > dayjs();
  }

  defaultMessage(args: ValidationArguments) {
    return `'${args.property}' must be after now`;
  }
}
