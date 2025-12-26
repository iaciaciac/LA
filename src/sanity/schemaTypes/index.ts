import { type SchemaTypeDefinition } from 'sanity'
import { siteSettings } from './siteSettings'
import { photo } from './photo'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [siteSettings, photo],
}
