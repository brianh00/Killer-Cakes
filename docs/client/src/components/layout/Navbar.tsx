import { Link, useLocation } from "wouter";
import { Menu, X, Instagram, Facebook } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const base = import.meta.env.PROD ? "/Killer-Cakes" : "";
  const normalizedLocation = location.startsWith(base) ? location.slice(base.length) : location;

  const links = [
    { href: "", label: "Home" },
    { href: "about", label: "About" },
  ];

  return (
    <nav className="fixed w-full z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl md:text-3xl font-heading text-primary tracking-tighter hover:scale-105 transition-transform">
            KILLER CAKES
          </a>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={`text-sm font-medium transition-colors hover:text-primary uppercase tracking-widest ${
                  normalizedLocation === `/${link.href}` ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </a>
            </Link>
          ))}
          <Link href="contact">
            <a className="bg-primary text-primary-foreground px-6 py-2 font-heading text-sm uppercase skew-x-[-10deg] hover:skew-x-0 transition-transform">
              Order Now
            </a>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    onClick={() => setIsOpen(false)}
                    className={`text-2xl font-heading uppercase ${
                      location === link.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              <Link href="contact">
                <a
                  onClick={() => setIsOpen(false)}
                  className={`text-2xl font-heading uppercase ${
                    normalizedLocation === "/contact" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Contact
                </a>
              </Link>
              <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                <Instagram className="text-muted-foreground hover:text-primary transition-colors" />
                <Facebook className="text-muted-foreground hover:text-primary transition-colors" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
