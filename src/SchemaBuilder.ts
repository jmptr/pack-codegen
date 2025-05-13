import fs from 'fs';
import { PackSchema } from './types';

export type SchemaBuilderOptions = {
  rootDir: string;
};

export type BuilderResults = {
  sections: Record<string, string>;
  settings: string;
};

export class SchemaBuilder {
  constructor(public options: SchemaBuilderOptions) {}

  static create(options: SchemaBuilderOptions) {
    return new SchemaBuilder(options);
  }

  write(schema: PackSchema, builderResults: BuilderResults) {
    const { rootDir } = this.options;

    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir, { recursive: true });
    }

    for (const [key, value] of Object.entries(builderResults.sections)) {
      const filePath = `${rootDir}/sections/${key}/${key}.types.ts`;
      fs.writeFileSync(filePath, value);
    }

    for (const [key, value] of Object.entries(schema.sections)) {
      const filePath = `${rootDir}/sections/${key}/${key}.schema.ts`;
      fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
    }

    const settingsFilePath = `${rootDir}/settings/settings.types.ts`;
    fs.writeFileSync(settingsFilePath, builderResults.settings);

    const settingsSchemaFilePath = `${rootDir}/settings/settings.schema.ts`;
    fs.writeFileSync(
      settingsSchemaFilePath,
      JSON.stringify(schema.settings, null, 2),
    );
  }
}
