import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isAfter', async: false })
export class IsAfter implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    return propertyValue > args.object[args.constraints[0]];
  }

  defaultMessage(args: ValidationArguments) {
    return `'${args.property}' must be after '${args.constraints[0]}'`;
  }
}
