export default {
    name: 'aboutPage',
    title: 'Photos Page',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Page Title',
            type: 'string',
            initialValue: 'Photos Page',
            readOnly: true
        },
        {
            name: 'contentBlocks',
            title: 'Content Blocks',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'introBlock',
                    title: 'Intro Block (Left Style)',
                    fields: [
                        {
                            name: 'heading',
                            title: 'Highlight Heading',
                            type: 'string',
                            initialValue: 'Hey',
                            description: 'Bold text (e.g. "Hey")'
                        },
                        {
                            name: 'subheading',
                            title: 'Subheading',
                            type: 'string',
                            initialValue: "That's right, I am Cai Cai.",
                        },
                        {
                            name: 'image',
                            title: 'Main Image',
                            type: 'image',
                            options: { hotspot: true }
                        },
                        {
                            name: 'icon',
                            title: 'Top Icon',
                            type: 'image',
                            description: 'Small icon at top (e.g. AntCloud logo)'
                        }
                    ],
                    preview: {
                        select: {
                            title: 'heading',
                            media: 'image'
                        },
                        prepare({ title, media }) {
                            return {
                                title: `Intro: ${title}`,
                                media
                            }
                        }
                    }
                },
                {
                    type: 'object',
                    name: 'projectBlock',
                    title: 'Project Block (Right Style)',
                    fields: [
                        {
                            name: 'title',
                            title: 'Project Title',
                            type: 'string',
                            placeholder: 'Unknown project'
                        },
                        {
                            name: 'description',
                            title: 'Description',
                            type: 'text',
                            rows: 2,
                            placeholder: 'This is just a new attempt!'
                        },
                        {
                            name: 'subtext',
                            title: 'Subtext (Bottom)',
                            type: 'string',
                            placeholder: 'Perhaps, this is a bridge of communication.'
                        },
                        {
                            name: 'image',
                            title: 'Project Image',
                            type: 'image',
                            options: { hotspot: true }
                        },
                        {
                            name: 'linkUrl',
                            title: 'Link URL',
                            type: 'url'
                        }
                    ],
                    preview: {
                        select: {
                            title: 'title',
                            media: 'image'
                        },
                        prepare({ title, media }) {
                            return {
                                title: `Project: ${title}`,
                                media
                            }
                        }
                    }
                }
            ]
        }
    ]
}
