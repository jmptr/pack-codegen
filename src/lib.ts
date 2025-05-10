export function toPascalCase(str: string) {
  return str
    .replace(/[-_\s]+(.)?/g, function (_: string, chr: string) {
      return chr ? chr.toUpperCase() : '';
    })
    .replace(/^(.)/, function (_: string, chr: string) {
      return chr.toUpperCase();
    });
}
