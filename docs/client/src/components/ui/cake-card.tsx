import { motion } from "framer-motion";
import { Link } from "wouter";

interface CakeCardProps {
  image: string;
  title: string;
  description: string;
  price: string;
  orderLink?: string;
}

export function CakeCard({ image, title, description, price, orderLink }: CakeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group bg-card overflow-hidden border border-border hover:border-primary transition-colors"
    >
      <div className="aspect-square overflow-hidden relative">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
          <Link href={orderLink ?? "contact"}>
            <a className="w-full bg-primary text-primary-foreground py-3 text-center font-heading uppercase text-sm hover:bg-white hover:text-black transition-colors">
              Order This
            </a>
          </Link>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-heading text-white">{title}</h3>
          <span className="text-primary font-bold font-heading">{price}</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
      </div>
    </motion.div>
  );
}
