import { motion } from "framer-motion";
import heroImage from "@assets/generated_images/decadent_chocolate_drip_cake_hero_image.png"; // Reusing for now or could gen another

export function About() {
  return (
    <div className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-heading mb-8 text-primary">Not Your Grandma's Bakery</h1>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                We started Killer Cakes in a tiny basement kitchen in East Atlanta Village with one goal: <strong className="text-white">Death to boring cakes.</strong>
              </p>
              <p>
                Too many celebrations are ruined by dry sponge and overly sweet, flavorless fondant. We believe a cake should be the main event. It should be loud, it should be bold, and it should taste even better than it looks.
              </p>
              <p>
                We use high-quality ingredients, locally sourced when we can, and we don't skimp on the good stuff. Real butter, real chocolate, fresh fruit. No preservatives, no shortcuts.
              </p>
              <div className="p-6 border-l-4 border-primary bg-card mt-8">
                <h3 className="text-xl font-heading text-white mb-2">The Killer Guarantee</h3>
                <p>If it doesn't make your jaw drop, we haven't done our job.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.6, delay: 0.2 }}
             className="relative"
          >
             <div className="absolute inset-0 border-4 border-primary transform translate-x-4 translate-y-4"></div>
             <img 
               src={heroImage} 
               alt="Baker working" 
               className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-500 relative z-10"
             />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
