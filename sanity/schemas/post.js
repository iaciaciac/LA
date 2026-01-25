export default {
    name: 'post',
    title: 'Blog Posts',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
        },
        {
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
            initialValue: (new Date()).toISOString()
        },
        {
            name: 'body',
            title: 'Body',
            type: 'array',
            of: [
                { type: 'block' },
                {
                    type: 'image',
                    fields: [
                        {
                            type: 'text',
                            name: 'alt',
                            title: 'Alternative text',
                            description: 'Some of your visitors cannot see images, be they blind, color-blind, or low-sighted; alternative text is of great help for those people that can rely on it to have a good idea of what\'s on your page.',
                            options: {
                                isHighlighted: true
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'mainImage',
            title: 'Main image',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'publishedAt',
            media: 'mainImage',
        },
    },
}
