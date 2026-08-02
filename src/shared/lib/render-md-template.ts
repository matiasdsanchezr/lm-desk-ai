type TemplateVars = Record<string, string | number | boolean>

const TEMPLATE_REGEX = /\{\{([^\{\}]+)\}\}/g

export const renderMdTemplate = (
  template: string,
  variables: TemplateVars
): string => {
  return template.replace(TEMPLATE_REGEX, (match, key: string) => {
    const trimmedKey = key.trim()

    if (variables[trimmedKey] !== undefined) {
      return String(variables[trimmedKey])
    } else {
      console.warn(`Variable no encontrada en el template: "${trimmedKey}"`)
      return ""
    }
  })
}
