import z, { ZodType } from "zod"

export const jsonOutputInstruction = (zodSchema: ZodType) => `\
<output_format>
Debes responder ÚNICAMENTE con un JSON que cumpla ESTRICTAMENTE con este JSON Schema:
${JSON.stringify(z.toJSONSchema(zodSchema))}
</output_format>
`
