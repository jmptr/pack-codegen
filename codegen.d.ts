import { FormField, SectionSchema } from '@pack/types';

declare global {
  type FieldDescriptor = {
    name: string;
    type: string;
    description?: string;
    optional?: boolean;
  };

  type TypeDescriptor = {
    name: string;
    description?: string;
    fields: FieldDescriptor[];
  };

  type PackSchema = {
    sections: SectionSchema[];
    settings: FormField[];
  };

  type Json =
    | string
    | number
    | boolean
    | null
    | { [property in string]: Json }
    | Json[];

  type CompilerContext = {
    constants: Record<string, Json>;
  };

  type JsonInput = CompilerContext & { template: Json };
}
