// Import global styles and fonts
import './globals.css'
import { Inter } from 'next/font/google'
import { ArrowLeft, Store } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
}

export default function GlobalNotFound() {
    return (
        <html lang="en" className={inter.className}>
            <body>
                <div className="not-found-page">

                    {/* Background Effects */}
                    <div className="nf-noise"></div>
                    <div className="nf-blob nf-blob-top"></div>
                    <div className="nf-blob nf-blob-bottom"></div>

                    {/* Main Content */}
                    <main className="nf-main">
                        <div className="nf-content">

                            {/* 404 Text dengan efek Glitch */}
                            <div className="nf-title-wrapper">
                                <h1 className="nf-title" data-text="404">404</h1>
                            </div>

                            <h2 className="nf-subtitle">Halaman Tidak Ditemukan</h2>
                            <p className="nf-desc">
                                Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin telah dipindahkan atau dihapus.
                            </p>

                            <a href="/" className="nf-button">
                                <ArrowLeft size={20} />
                                Kembali ke Home
                            </a>

                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="nf-footer">
                        <p>© {new Date().getFullYear()} OffMode Store • Error 404</p>
                    </footer>
                </div>
            </body>
        </html>
    )
}