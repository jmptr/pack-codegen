import { FormField, SectionSchema } from '@pack/types';

type FieldDescriptor = {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
};

export type TypeDescriptor = {
  name: string;
  description?: string;
  fields: FieldDescriptor[];
};

export type PackSchema = {
  sections: SectionSchema[];
  settings: FormField[];
};

export type BuilderResults = {
  sections: Record<string, string>;
  settings: string;
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
