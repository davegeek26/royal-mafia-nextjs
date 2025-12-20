import "./globals.css";
import { StateProvider } from "@/context/StateProvider";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StripeProvider from "@/components/StripeProvider";

export const metadata = {
  title: "Royal Mafia Clothing",
  description: "Premium clothing store featuring exclusive collections and designer fashion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StateProvider>
          <CartProvider>
            <StripeProvider>
              <Header />
              {children}
              <Footer />
            </StripeProvider>
          </CartProvider>
        </StateProvider>
      </body>
    </html>
  );
}
