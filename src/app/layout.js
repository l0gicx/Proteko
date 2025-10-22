// app/layout.js
import { Poppins } from 'next/font/google';
import './globals.css';
import AuthContext from './context/AuthContext';
import Header from './components/Header'; // <-- 1. Import the Header

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '700'] 
});

export const metadata = {
  title: 'PROTEKO - Labirinti Teknik',
  description: 'A board game for Shkolla Profesionale Teknike Korçë',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthContext>
          <Header /> {/* <-- 2. Add the Header here */}
          {children}
        </AuthContext>
      </body>
    </html>
  );
}