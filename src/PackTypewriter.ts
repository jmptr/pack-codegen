import {
  BlocksField,
  FormField,
  GroupField,
  GroupListField,
} from '@pack/types';
import { supplantJson, toPascalCase } from './lib';

export function compileSchema(input: JsonInput): PackSchema {
  const { constants, template } = input;
  const context = {
    constants: constants as Record<string, Json>,
  };
  const result = supplantJson(template, context) as PackSchema;
  return result;
}

/**
 * Get the type of a component.  This is only used for getting the subtype of
 * a list field.
 * @param component - The component to get the type of
 * @returns The type of the component
 */
function getComponentType(component: string) {
  switch (component) {
    case 'color':
    case 'date':
    case 'html':
    case 'markdown':
    case 'radio-group':
    case 'rich-text':
    case 'select':
    case 'text':
    case 'textarea':
      return 'string';
    case 'image':
      return 'MediaCms';
    case 'number':
      return 'number';
    case 'toggle':
      return 'boolean';
    case 'productSearch':
      return 'ProductCms';
    case 'collections':
      return 'CollectionCms';
    case 'productBundles':
      return 'ProductBundleCms';
    case 'link':
      return 'LinkCms';
    case 'tags':
      return 'string[]';
    default:
      return 'string';
  }
}

/**
 * Add a group to the types.
 * @param field - The field to add to the types
 * @param allTypes - The list of all types
 * @returns The type of the group
 */
function addGroupToTypes(field: GroupField, allTypes: string[]) {
  const groupName = `${toPascalCase(field.name)}GroupCms`;
  let groupType = `type ${groupName} = { `;
  for (const formField of field.fields) {
    groupType += addFieldToTypes(formField, allTypes);
  }
  groupType += '}; ';
  allTypes.push(groupType);
  return `${field.name}?: ${groupName}; `;
}

function addGroupListToTypes(field: GroupListField, allTypes: string[]) {
  const groupListName = `${toPascalCase(field.name)}GroupCms`;
  let groupListType = `type ${groupListName} = { `;
  for (const formField of field.fields) {
    groupListType += addFieldToTypes(formField, allTypes);
  }
  groupListType += '}; ';
  allTypes.push(groupListType);
  return `${field.name}?: ${groupListName}[]; `;
}

/**
 * Add a block to the types.
 * @param field - The field to add to the types
 * @param allTypes - The list of all types
 * @returns The type of the block
 */
function addBlockToTypes(field: BlocksField, allTypes: string[]) {
  const templateTypes: string[] = [];
  for (const [templateName, template] of Object.entries(field.templates)) {
    let templateStr = '';
    const templateTypeName = `${toPascalCase(templateName)}TemplateCms`;
    templateStr += `type ${templateTypeName} = { `;
    templateStr += `_template: "${templateName}"; `;
    for (const formField of template.fields || []) {
      templateStr += `${addFieldToTypes(formField, allTypes)}`;
    }
    templateStr += '}';
    templateTypes.push(templateTypeName);
    allTypes.push(templateStr);
  }
  return `${field.name}?: (${templateTypes.join(' | ')})[]; `;
}

/**
 * Add a field to the types.
 * @param field - The field to add to the types
 * @param allTypes - The list of all types
 * @returns The type of the field
 */
function addFieldToTypes(field: FormField, allTypes: string[]) {
  switch (field.component) {
    case 'color':
    case 'date':
    case 'html':
    case 'markdown':
    case 'radio-group':
    case 'rich-text':
    case 'select':
    case 'text':
    case 'textarea':
      return `${field.name}?: string; `;
    case 'image':
      return `${field.name}?: MediaCms; `;
    case 'number':
      return `${field.name}?: number; `;
    case 'toggle':
      return `${field.name}?: boolean; `;
    case 'productSearch':
      return `${field.name}?: ProductCms; `;
    case 'collections':
      return `${field.name}?: CollectionCms; `;
    case 'productBundles':
      return `${field.name}?: ProductBundleCms; `;
    case 'link':
      return `${field.name}?: LinkCms; `;
    case 'tags':
      return `${field.name}?: string[]; `;
    case 'list':
      return `${field.name}?: ${getComponentType(field.field.component)}[]`;
    case 'group':
      return addGroupToTypes(field, allTypes);
    case 'group-list':
      return addGroupListToTypes(field, allTypes);
    case 'blocks':
      return addBlockToTypes(field, allTypes);
  }
}

/**
 * Convert the schema to type definitions.
 * @param input - The schema to convert
 * @returns The type definitions
 */
export function toTypeDefinitions(input: PackSchema) {
  const typeDefs: string[] = [];
  for (const section of input.sections) {
    let typeDef = `type ${toPascalCase(section.key)}SectionCms = { `;
    for (const formField of section.fields) {
      const propStr = addFieldToTypes(formField, typeDefs);
      typeDef += `${propStr}`;
    }
    typeDef += '}';
    typeDefs.push(typeDef);
  }
  return typeDefs.join('\n');
}
