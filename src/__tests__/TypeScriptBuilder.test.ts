import { expect, test } from 'vitest';

import { compileSchema, TypeScriptBuilder } from '../TypeScriptBuilder';
import { JsonInput } from '../types';
const json: JsonInput = {
  constants: {
    COLOR_PICKER_DEFAULTS: [
      { label: 'Red', value: '$constants.DEFAULT_COLOR' },
      { label: 'Blue', value: '#0000FF' },
      { label: 'Green', value: '#00FF00' },
    ],
    DEFAULT_COLOR: '#FF0000',
    MESSAGE_DEFAULT_FIELDS: [
      {
        label: 'Message',
        component: 'text',
        name: 'message',
      },
    ],
    COLORS_DEFAULT_FIELDS: [
      {
        label: 'Color',
        component: 'color',
        name: 'color',
        colors: '$constants.COLOR_PICKER_DEFAULTS',
      },
    ],
    BG_COLOR_FIELD: {
      label: 'Background Color',
      component: 'color',
      name: 'bgColor',
      colors: '$constants.COLOR_PICKER_DEFAULTS',
    },
  },
  template: {
    sections: [
      {
        category: 'test',
        label: 'Test',
        key: 'test',
        fields: [
          {
            label: 'Color',
            component: 'color',
            name: 'color',
            colors: '$constants.COLOR_PICKER_DEFAULTS',
          },
          {
            label: 'Group',
            component: 'group',
            name: 'groupName',
            fields: '$constants.MESSAGE_DEFAULT_FIELDS',
          },
          {
            label: 'Group List',
            component: 'group-list',
            name: 'groupListName',
            fields: '$constants.MESSAGE_DEFAULT_FIELDS',
          },
          {
            label: 'Blocks',
            component: 'blocks',
            name: 'mixedType',
            templates: {
              first: {
                label: 'First',
                key: 'first',
                itemProps: {
                  label: 'First: {{item.message}}',
                },
                fields: '$constants.MESSAGE_DEFAULT_FIELDS',
              },
              second: {
                label: 'Second',
                key: 'second',
                itemProps: {
                  label: 'Second: {{item.message}}',
                },
                fields: '$constants.COLORS_DEFAULT_FIELDS',
              },
            },
          },
        ],
      },
    ],
    settings: [
      {
        label: 'Menu',
        name: 'menu',
        component: 'group',
        fields: '$constants.MESSAGE_DEFAULT_FIELDS',
      },
    ],
  },
};

test('compileJson', () => {
  const actual = compileSchema(json);
  const expected = {
    sections: [
      {
        category: 'test',
        label: 'Test',
        key: 'test',
        fields: [
          {
            label: 'Color',
            component: 'color',
            name: 'color',
            colors: [
              { label: 'Red', value: '#FF0000' },
              { label: 'Blue', value: '#0000FF' },
              { label: 'Green', value: '#00FF00' },
            ],
          },
          {
            label: 'Group',
            component: 'group',
            name: 'groupName',
            fields: [
              {
                label: 'Message',
                component: 'text',
                name: 'message',
              },
            ],
          },
          {
            label: 'Group List',
            component: 'group-list',
            name: 'groupListName',
            fields: [
              {
                label: 'Message',
                component: 'text',
                name: 'message',
              },
            ],
          },
          {
            label: 'Blocks',
            component: 'blocks',
            name: 'mixedType',
            templates: {
              first: {
                label: 'First',
                key: 'first',
                itemProps: {
                  label: 'First: {{item.message}}',
                },
                fields: [
                  {
                    label: 'Message',
                    component: 'text',
                    name: 'message',
                  },
                ],
              },
              second: {
                label: 'Second',
                key: 'second',
                itemProps: {
                  label: 'Second: {{item.message}}',
                },
                fields: [
                  {
                    label: 'Color',
                    component: 'color',
                    name: 'color',
                    colors: [
                      { label: 'Red', value: '#FF0000' },
                      { label: 'Blue', value: '#0000FF' },
                      { label: 'Green', value: '#00FF00' },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
    ],
    settings: [
      {
        label: 'Menu',
        name: 'menu',
        component: 'group',
        fields: [
          {
            label: 'Message',
            component: 'text',
            name: 'message',
          },
        ],
      },
    ],
  };

  expect(actual).toStrictEqual(expected);
});

test('toTypeDefinitions', () => {
  const schema = compileSchema(json);
  const packTypeWriter = new TypeScriptBuilder(schema);
  const actual = packTypeWriter.build();

  const {
    sections: { TestSection },
    settings,
  } = actual;
  expect(TestSection).toMatchInlineSnapshot(`
    "export type GroupNameGroupCms = { message?: string; };
    export type GroupListNameGroupCms = { message?: string; };
    export type FirstTemplateCms = { _template: "first"; message?: string; }
    export type SecondTemplateCms = { _template: "second"; color?: string; }
    export type TestSectionCms = { color?: string; groupName?: GroupNameGroupCms; groupListName?: GroupListNameGroupCms[]; mixedType?: (FirstTemplateCms | SecondTemplateCms)[];  }"
  `);

  expect(settings).toMatchInlineSnapshot(`
    "export type MenuGroupCms = { message?: string; };
    export type SettingsCms = { menu?: MenuGroupCms; };"
  `);
});
