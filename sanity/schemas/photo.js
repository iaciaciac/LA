import { HeicImageInput } from '../components/HeicImageInput'
import { VideoInput } from '../components/VideoInput'

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
                hotspot: true, // Revert to true to fix runtime error in Studio
            },
            components: {
                input: HeicImageInput
            },
        },
        {
            name: 'caption',
            title: 'Caption',
            type: 'text',
        },
        {
            name: 'isLivePhoto',
            title: 'Is Live Photo?',
            type: 'boolean',
            initialValue: true,
            description: 'Toggle ON for Apple Live Photos (loops, "LIVE" badge). Toggle OFF for regular videos (Video badge).',
        },
        {
            name: 'video',
            title: 'Video File',
            type: 'file',
            options: {
                accept: 'video/*'
            },
            components: {
                input: VideoInput
            },
        },
        {
            name: 'tags',
            title: 'Tags (Highlights)',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Add ANY tag to feature this photo in the actual Story Tray.',
            options: {
                layout: 'tags'
            }
        },
        {
            name: 'aiCoach',
            title: '🧠 AI Operation Coach',
            type: 'object',
            fields: [
                {
                    name: 'xhs',
                    title: '📕 Xiaohongshu Strategy',
                    type: 'object',
                    fields: [
                        {
                            name: 'viralScore',
                            title: '🔥 Viral Score (1-10)',
                            type: 'number'
                        },
                        {
                            name: 'title',
                            title: '📌 Title',
                            type: 'string'
                        },
                        {
                            name: 'copy',
                            title: '📝 Copy',
                            type: 'text'
                        },
                        {
                            name: 'hashtags',
                            title: '🏷️ Tags',
                            type: 'array',
                            of: [{ type: 'string' }]
                        },
                        {
                            name: 'critique',
                            title: '👩‍🏫 Visual Critique',
                            type: 'text'
                        }
                    ]
                },
                {
                    name: 'douyin',
                    title: '🎵 Douyin Strategy',
                    type: 'object',
                    fields: [
                        {
                            name: 'viralScore',
                            title: '🔥 Viral Score (1-10)',
                            type: 'number'
                        },
                        {
                            name: 'hook',
                            title: '🪝 Visual Hook',
                            type: 'string'
                        },
                        {
                            name: 'script',
                            title: '🎬 Script / Audio',
                            type: 'text'
                        },
                        {
                            name: 'copy',
                            title: '📝 Caption',
                            type: 'text'
                        },
                        {
                            name: 'bgm',
                            title: '🎵 BGM Suggestion',

                            type: 'string'
                        }
                    ]
                }
            ]
        },
    ],
    preview: {
        select: {
            title: 'title',
            media: 'image'
        },
        prepare(selection) {
            const { title, media } = selection
            return {
                title: title,
                media: media
            }
        }
    }
}
