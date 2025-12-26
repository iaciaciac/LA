// sanity/schemas/siteSettings.js
export const siteSettings = {
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
        {
            name: 'headline',
            title: 'Main Headline',
            type: 'string',
            description: 'The main typing text on the homepage',
        },
    ],
}

// sanity/schemas/photo.js
export const photo = {
    name: 'photo',
    title: 'Photos',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
        },
        {
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true, // Enables UI for selecting what areas of an image should always be visible
            },
        },
        {
            name: 'caption',
            title: 'Caption',
            type: 'text',
        },
    ],
}
