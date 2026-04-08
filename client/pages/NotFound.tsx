import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="min-h-[500px] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-primary mb-4 font-playfair">404</h1>
          <h2 className="text-3xl font-bold text-foreground mb-4 font-playfair">Halaman Tidak Ditemukan</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Maaf, halaman yang Anda cari tidak ada. Kembalilah ke beranda untuk melanjutkan berbelanja.
          </p>
          <Link
            to="/"
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
