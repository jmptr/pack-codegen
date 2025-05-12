import { CompilerContext, Json } from './types';

export function toPascalCase(str: string) {
  return str
    .replace(/[-_\s]+(.)?/g, function (_: string, chr: string) {
      return chr ? chr.toUpperCase() : '';
    })
    .replace(/^(.)/, function (_: string, chr: string) {
      return chr.toUpperCase();
    });
}

type SupplantJson = (obj: Json, context: CompilerContext) => Json;

/**
 * Supplant the constants in the JSON object.
 * @param obj - The JSON object to supplant
 * @param context - The context to use for supplanting
 * @returns The supplanted JSON object
 */
export const supplantJson: SupplantJson = (obj, context) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => supplantJson(item, context));
  }

  const result: Record<string, Json> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.startsWith('$constants.')) {
      const contextKey = value.replace('$constants.', '');
      const contextValue = supplantJson(context.constants[contextKey], context);
      result[key] = contextValue;
    } else {
      result[key] = supplantJson(value, context);
    }
  }
  return result;
};
