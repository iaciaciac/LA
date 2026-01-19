
import React from 'react'
import { Stack, Card, Text } from '@sanity/ui'
import { useClient } from 'sanity'

export const VideoInput = (props) => {
    const { value } = props
    const client = useClient({ apiVersion: '2024-01-01' })

    // Construct URL from asset ref
    // Standard format: file-${hash}-${extension}
    const getFileUrl = (ref) => {
        if (!ref) return null
        const parts = ref.split('-')
        if (parts.length < 3) return null

        // parts[0] is 'file'
        // parts[parts.length-1] is extension
        // defaults: file-<hash>-<extension>

        const extension = parts[parts.length - 1]
        const hash = parts[1]

        const { projectId, dataset } = client.config()
        return `https://cdn.sanity.io/files/${projectId}/${dataset}/${hash}.${extension}`
    }

    const videoUrl = value?.asset?._ref ? getFileUrl(value.asset._ref) : null

    return (
        <Stack space={3}>
            {props.renderDefault(props)}
            {videoUrl ? (
                <Card padding={2} radius={2} border tone="transparent">
                    <Stack space={2}>
                        <Text size={1} weight="semibold" muted>Video Preview</Text>
                        <video
                            src={videoUrl}
                            controls
                            playsInline
                            style={{ width: '100%', maxHeight: '400px', backgroundColor: '#000', borderRadius: '4px' }}
                        />
                    </Stack>
                </Card>
            ) : null}
        </Stack>
    )
}
