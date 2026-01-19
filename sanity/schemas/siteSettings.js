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
        {
            name: 'healthSyncToken',
            title: 'Health Sync Token',
            type: 'string',
            description: 'Secret token to authorize iOS Shortcuts updates',
            readOnly: true,
            hidden: true // Hide from UI, used only by API
        }
    ],
}
