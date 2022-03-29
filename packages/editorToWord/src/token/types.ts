import { StyleInterface, StyleOption } from '../types';
export type TokenHandler = (
  style: StyleInterface,
  styleOption: StyleOption
) => StyleOption;
