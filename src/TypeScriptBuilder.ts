import {
  BlocksField,
  FormField,
  GroupField,
  GroupListField,
} from '@pack/types';
import { supplantJson, toPascalCase } from './lib';
import { BuilderResults, Json, JsonInput, PackSchema } from './types';

export function compileSchema(input: JsonInput): PackSchema {
  const { constants, template } = input;
  const context = {
    constants: constants as Record<string, Json>,
  };
  const result = supplantJson(template, context) as PackSchema;
  return result;
}

export class TypeScriptBuilder {
  outTypes: Record<string, string[]> = {};
  constructor(public schema: PackSchema) {}

  addFieldToTypes(field: FormField, typeKey: string) {
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
        return `${field.name}?: ${this.getComponentType(field.field.component)}[]`;
      case 'group':
        return `${field.name}?: ${this.addGroupToTypes(field, typeKey)}; `;
      case 'group-list':
        return `${field.name}?: ${this.addGroupListToTypes(field, typeKey)}; `;
      case 'blocks':
        return `${field.name}?: ${this.addBlockToTypes(field, typeKey)}; `;
    }
  }

  addBlockToTypes(field: BlocksField, typeKey: string) {
    const templateTypes: string[] = [];
    for (const [templateName, template] of Object.entries(field.templates)) {
      let templateStr = '';
      const templateTypeName = `${toPascalCase(templateName)}TemplateCms`;
      templateStr += `type ${templateTypeName} = { `;
      templateStr += `_template: "${templateName}"; `;
      for (const formField of template.fields || []) {
        templateStr += `${this.addFieldToTypes(formField, typeKey)}`;
      }
      templateStr += '}';
      templateTypes.push(templateTypeName);
      this.outTypes[typeKey].push(templateStr);
    }
    return `(${templateTypes.join(' | ')})[]`;
  }

  addGroupToTypes(field: GroupField, typeKey: string) {
    const groupName = `${toPascalCase(field.name)}GroupCms`;
    let groupType = `type ${groupName} = { `;
    for (const formField of field.fields) {
      groupType += this.addFieldToTypes(formField, typeKey);
    }
    groupType += '};';
    this.outTypes[typeKey].push(groupType);
    return groupName;
  }

  addGroupListToTypes(field: GroupListField, typeKey: string) {
    const groupListName = `${toPascalCase(field.name)}GroupCms`;
    let groupListType = `type ${groupListName} = { `;
    for (const formField of field.fields) {
      groupListType += this.addFieldToTypes(formField, typeKey);
    }
    groupListType += '};';
    this.outTypes[typeKey].push(groupListType);
    return `${groupListName}[]`;
  }

  getComponentType(component: string) {
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

  build(): BuilderResults {
    for (const section of this.schema.sections) {
      const sectionName = `${toPascalCase(section.key)}Section`;
      const typeKey = `${sectionName}Cms`;
      this.outTypes[sectionName] = [];
      const typeDef = `type ${typeKey} = { ${section.fields.map((field) => this.addFieldToTypes(field, sectionName)).join('')} }`;
      this.outTypes[sectionName].push(typeDef);
    }

    const typeKey = `settings`;
    let settingsType = `type SettingsCms = { `;
    this.outTypes[typeKey] = [];
    for (const settingsField of this.schema.settings) {
      settingsType += this.addFieldToTypes(settingsField, typeKey);
    }
    settingsType += '};';
    this.outTypes[typeKey].push(settingsType);

    const builderResults = Object.entries(this.outTypes).reduce<BuilderResults>(
      (acc, [key, value]) => {
        if (key === 'settings') {
          acc.settings = value.join('\n');
        } else {
          acc.sections[key] = value.join('\n');
        }
        return acc;
      },
      { sections: {}, settings: '' },
    );
    return builderResults;
  }
}
