import React, { useState, useCallback } from 'react'
import { Stack, Text, Card, Button, Spinner } from '@sanity/ui'
import { set } from 'sanity'
import { useClient } from 'sanity'

export const HeicImageInput = (props) => {
    const { onChange } = props
    const [isConverting, setIsConverting] = useState(false)
    const [error, setError] = useState(null)

    const client = useClient({ apiVersion: '2024-01-01' })

    const handleUpload = useCallback(async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setError(null)
        if (!file.name.toLowerCase().endsWith('.heic') && !file.type.includes('heic')) {
            setError('Please select a .HEIC file')
            return
        }

        setIsConverting(true)

        try {
            console.log('Starting HEIC server-side conversion...', file.name)

            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/upload-heic', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            console.log('Server upload success:', data.asset._ref)

            // Patch the field with the new asset
            onChange(set({
                _type: 'image',
                asset: {
                    _type: "reference",
                    _ref: data.asset._ref
                }
            }))

            console.log('Success!')

        } catch (err) {
            console.error('HEIC API Error:', err)
            setError(`Upload failed: ${err.message}`)
        } finally {
            setIsConverting(false)
            event.target.value = ''
        }
    }, [onChange])

    return (
        <Stack space={3}>
            {props.renderDefault(props)}
            <Card padding={3} radius={2} tone="primary" border>
                <Stack space={3}>
                    <Text size={1} weight="semibold">HEIC Converter (Server-side)</Text>
                    <Text size={1} muted>
                        Uploads uncompressed HEIC to server for high-quality conversion.
                    </Text>

                    {isConverting ? (
                        <Button
                            mode="ghost"
                            text="Uploading & Converting..."
                            icon={Spinner}
                            disabled
                        />
                    ) : (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <input
                                type="file"
                                accept=".heic,.HEIC"
                                onChange={handleUpload}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer',
                                    zIndex: 10
                                }}
                            />
                            <Button
                                mode="ghost"
                                text="Select .HEIC File"
                                tone="primary"
                            />
                        </div>
                    )}

                    {error && (
                        <Text size={1} style={{ color: 'red' }}>
                            {error}
                        </Text>
                    )}
                </Stack>
            </Card>
        </Stack>
    )
}
