import { defineType, defineField } from 'sanity'

export const siteSettings = defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
        defineField({
            name: 'headline',
            title: 'Main Headline',
            type: 'string',
            description: 'The main typing text on the homepage',
        }),
    ],
})
