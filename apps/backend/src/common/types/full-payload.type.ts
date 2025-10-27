import { Payload } from './payload.type';

export type FullPayload = Payload & {
  exp: number;
  iat: number;
};
