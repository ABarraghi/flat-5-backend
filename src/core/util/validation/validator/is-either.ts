import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isEither', async: false })
export class IsEither implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    let count = 0;
    args.constraints.forEach(constraint => {
      args.object[constraint] && count++;
    });

    return count === 1;
  }

  defaultMessage(args: ValidationArguments) {
    const fields = args.constraints.join(',');

    return `One and only one of fields must be specified ${fields}`;
  }
}
