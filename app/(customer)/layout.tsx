import Navigation from "@/components/layout/navigation";
import Footer from "@/components/layout/Footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* NAVBAR */}
      <Navigation />

      {/* CONTENIDO */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}