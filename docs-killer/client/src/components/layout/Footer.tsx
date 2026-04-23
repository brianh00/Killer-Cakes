import { Instagram, MapPin, Mail, Phone } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-muted py-12 border-t border-border mt-auto">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl grid gap-10 text-center md:grid-cols-[1.35fr_1fr] md:gap-14 md:text-left md:items-start">
          <div>
            <h3 className="text-2xl font-heading text-primary mb-4">Killer Cakes</h3>
            <p className="text-muted-foreground mb-4">
              Bold flavors. Killer designs. Atlanta's most dangerous bakery.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <a href="https://www.instagram.com/KillercakesGA" target="_blank" rel="noreferrer" className="p-2 bg-background rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="md:border-l md:border-border md:pl-10 lg:pl-12">
            <h4 className="font-heading text-lg mb-4">Contact</h4>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin size={16} className="text-primary" />
                <span>666 Peachtree St NE, Atlanta, GA</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone size={16} className="text-primary" />
                <span>(404) 528-8135</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} className="text-primary" />
                <span>killercakesatl@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Killer Cakes Atlanta. All rights reserved.
          <span className="mx-2">|</span>
          <Link href="/admin">
            <a className="underline hover:text-primary transition-colors">Admin</a>
          </Link>
        </div>
      </div>
    </footer>
  );
}
