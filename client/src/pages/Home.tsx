import { motion } from "framer-motion";
import { CakeCard } from "@/components/ui/cake-card";
import heroImage from "@assets/generated_images/decadent_chocolate_drip_cake_hero_image.png";
import cake1 from "@assets/generated_images/artistic_pink_velvet_cake.png";
import cake2 from "@assets/generated_images/gothic_dark_wedding_cake.png";
import cake3 from "@assets/generated_images/vibrant_rainbow_cake_slice.png";
import { Link } from "wouter";
import { ArrowRight, Star } from "lucide-react";

export function Home() {
  const featuredCakes = [
    {
      title: "Neon Velvet",
      description: "Our signature pink velvet sponge with electric buttercream swirls. A party in every bite.",
      price: "$65",
      image: cake1,
    },
    {
      title: "Midnight Vows",
      description: "Black cocoa fondant, deep red sugar roses, and a heart of dark chocolate ganache.",
      price: "$120",
      image: cake2,
    },
    {
      title: "Prism Slice",
      description: "Seven layers of fruit-infused sponge. Taste the rainbow, but make it killer.",
      price: "$8/slice",
      image: cake3,
    },
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Killer Chocolate Cake"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 z-10 relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-heading text-primary mb-6 leading-tight">
              KILLER<br />
              <span className="text-foreground text-stroke">TASTE</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-lg font-light">
              Atlanta's boldest custom cakes. We don't do boring. We do delicious, dangerous, and unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <a className="bg-primary hover:bg-primary/90 text-white px-8 py-4 font-heading uppercase text-lg tracking-widest transition-transform hover:scale-105 flex items-center justify-center gap-2">
                  Start Order <ArrowRight />
                </a>
              </Link>
              <Link href="/about">
                <a className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 font-heading uppercase text-lg tracking-widest transition-colors flex items-center justify-center">
                  Our Story
                </a>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-heading mb-4 text-white">Fresh From The Lab</h2>
              <p className="text-muted-foreground">The latest creations from our kitchen.</p>
            </div>
            <Link href="/contact">
              <a className="text-primary hover:text-white transition-colors font-heading uppercase flex items-center gap-2">
                View Full Menu <ArrowRight size={20} />
              </a>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCakes.map((cake, index) => (
              <CakeCard key={index} {...cake} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Vibe Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} fill="currentColor" size={32} />
            ))}
          </div>
          <blockquote className="text-3xl md:text-5xl font-heading leading-tight mb-8 max-w-4xl mx-auto">
            "I ordered a cake for my ex's wedding. It was prettier than the bride. 10/10 would recommend."
          </blockquote>
          <cite className="not-italic font-bold tracking-widest uppercase opacity-80">- Sarah J., Buckhead</cite>
        </div>
      </section>
    </div>
  );
}
