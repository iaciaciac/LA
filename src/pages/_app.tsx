import '@/styles/globals.css'
import '@/styles/vibe-theme.css'
import type { AppProps } from 'next/app'



import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import useScrollRestoration from '../hooks/useScrollRestoration';

export default function App({ Component, pageProps }: AppProps) {
  useScrollRestoration();

  return <Component {...pageProps} />;
}
