// app/layout.js
import { Poppins } from 'next/font/google';
import './globals.css';
import AuthContext from './context/AuthContext';
import MainLayout from './components/MainLayout';
import { Toaster } from 'react-hot-toast'; // <-- 1. Import Toaster

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '700'] 
});

export const metadata = { /* ... */ };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthContext>
          {/* 2. Add the Toaster component here */}
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          <MainLayout>
            {children}
          </MainLayout>
        </AuthContext>
      </body>
    </html>
  );
}