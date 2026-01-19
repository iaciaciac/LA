
import { IncomingForm } from 'formidable'
import sharp from 'sharp'
import { createClient } from 'next-sanity'
import fs from 'fs'

// Disable Next.js body parsing to let formidable handle it
export const config = {
    api: {
        bodyParser: false,
    },
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN, // Use server-side token
    useCdn: false,
})

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        console.log('[API] Starting HEIC upload request...')

        const data = await new Promise((resolve, reject) => {
            const form = new IncomingForm({
                keepExtensions: true,
                maxFileSize: 100 * 1024 * 1024, // 100MB
                multiples: true, // v3 default, implies array
            })

            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('[API] Formidable Parse Error:', err)
                    return reject(err)
                }
                resolve({ fields, files })
            })
        })

        console.log('[API] Parse complete. Files:', Object.keys(data.files))

        // 安全检查：验证上传密钥
        // Formidable v3 可能返回数组或字符串，取决于配置
        const secretField = data.fields.secret;
        const secret = Array.isArray(secretField) ? secretField[0] : secretField;

        if (secret !== process.env.UPLOAD_SECRET) {
            console.warn('[API] Security Alert: Invalid upload secret provided.');
            return res.status(401).json({ error: '未经授权：密钥无效 (Unauthorized)' });
        }

        // Robust file access for Formidable v2/v3 compat
        let file = data.files.file
        if (Array.isArray(file)) {
            file = file[0]
        }

        if (!file) {
            console.error('[API] No file found in request. Keys:', Object.keys(data.files))
            return res.status(400).json({ error: 'No file uploaded. Check param name "file".' })
        }

        console.log('[API] Processing file:', file.originalFilename || file.name, 'Path:', file.filepath)

        // Read buffer
        let inputBuffer
        try {
            inputBuffer = fs.readFileSync(file.filepath)
            console.log('[API] Read buffer size:', inputBuffer.length)
        } catch (readErr) {
            console.error('[API] File read error:', readErr)
            throw new Error(`Failed to read temp file: ${readErr.message}`)
        }

        // Convert
        console.log('[API] Converting file...')
        let outputBuffer
        const isMac = process.platform === 'darwin'

        if (isMac) {
            try {
                console.log('[API] Native macOS detected. Using SIPS for conversion...')
                const { exec } = require('child_process')
                const util = require('util')
                const execPromise = util.promisify(exec)

                const outputPath = file.filepath + '.jpg'

                // sips -s format jpeg -s formatOptions 100 input.heic --out output.jpg
                // 100 = Best quality
                await execPromise(`sips -s format jpeg -s formatOptions 100 "${file.filepath}" --out "${outputPath}"`)

                outputBuffer = fs.readFileSync(outputPath)

                // Cleanup temp output
                try { fs.unlinkSync(outputPath) } catch (e) { }
                console.log('[API] SIPS Conversion success. Output size:', outputBuffer.length)

            } catch (sipsErr) {
                console.warn('[API] SIPS failed, falling back to Sharp:', sipsErr.message)
                // Fallthrough to sharp if sips fails for some reason
            }
        }

        if (!outputBuffer) {
            try {
                console.log('[API] Using Sharp for conversion...')
                outputBuffer = await sharp(inputBuffer)
                    .toFormat('jpeg', {
                        quality: 100,
                        chromaSubsampling: '4:4:4'
                    })
                    .toBuffer()
                console.log('[API] Sharp Conversion success. Output size:', outputBuffer.length)
            } catch (sharpErr) {
                console.error('[API] Sharp Conversion Error:', sharpErr)
                throw new Error(`Conversion failed: ${sharpErr.message}`)
            }
        }

        // Upload
        console.log('[API] Uploading to Sanity...')
        const asset = await client.assets.upload('image', outputBuffer, {
            filename: (file.originalFilename || 'image.heic').replace(/\.heic$/i, '.jpg'),
            contentType: 'image/jpeg'
        })

        console.log('[API] Sanity Upload success:', asset._id)

        // Cleanup
        try {
            fs.unlinkSync(file.filepath)
        } catch (e) { }

        res.status(200).json({
            success: true,
            asset: {
                _ref: asset._id,
                _type: 'reference'
            }
        })

    } catch (error) {
        console.error('[API] Critical Handler Error:', error)
        res.status(500).json({ error: error.message, stack: error.stack })
    }
}
