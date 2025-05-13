import { FormField, SectionSchema } from '@pack/types';

export type PackSchema = {
  sections: SectionSchema[];
  settings: FormField[];
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [property in string]: Json }
  | Json[];

export type CompilerContext = {
  constants: Record<string, Json>;
};

export type JsonInput = CompilerContext & { template: Json };
