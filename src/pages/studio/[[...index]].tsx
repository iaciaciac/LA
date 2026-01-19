import Head from 'next/head'
import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
    return (
        <>
            <Head>
                <title>Sanity Studio</title>
                <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
                <meta name="referrer" content="same-origin" />
            </Head>
            <NextStudio config={config} />
        </>
    )
}
