import { TransformFnParams } from 'class-transformer';

export function trimHelper({ value }: TransformFnParams) {
  value?.trim();
}
