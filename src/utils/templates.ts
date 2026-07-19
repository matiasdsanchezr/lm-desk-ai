type TemplateVars = Record<string, string | number | boolean>

const TEMPLATE_REGEX = /\{\{([^{}]+)\}\}/g

/**
 * Reemplaza los placeholders {{key}}
 * con los valores proporcionados en un objeto.
 * @param template - Template string con placeholders tipo {{key}}
 * @param variables - Objeto con los valores a inyectar
 * @returns El contenido del template procesado
 */
export const renderTemplate = (
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
