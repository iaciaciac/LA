import { defineType, defineField } from 'sanity'

export const photo = defineType({
    name: 'photo',
    title: 'Photos',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'caption',
            title: 'Caption',
            type: 'text',
        }),
    ],
})
