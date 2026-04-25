import { motion } from "framer-motion";
import heroImage from "@assets/generated_images/decadent_chocolate_drip_cake_hero_image.png";
import nealImage from "@assets/neal.jpg";

export function About() {
  return (
    <div className="pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
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
             <img 
               src={heroImage} 
               alt="Baker working" 
               className="w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-500 relative z-10"
             />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 mx-auto w-full md:w-1/2"
        >
          <div className="relative overflow-hidden border border-primary/30 bg-card">
            <img
              src={nealImage}
              alt="Neal of Killer Cakes"
              className="block w-full aspect-[16/9] object-cover object-center"
            />
          </div>
        </motion.div>

        {/* Community Commitment Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-12 bg-card border border-primary/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <h2 className="text-3xl font-heading text-primary mb-8">Community First</h2>
          <div className="prose prose-invert prose-lg text-muted-foreground">
            <p className="mb-6 italic">
              "My friends and neighbors who want to support our local communities: now more than ever, it is important to learn about and support nearby food banks."
            </p>
            <p className="mb-6">
              Killer Cakes is committed to giving back and will soon be reaching out to churches and food banks throughout the Kennesaw area. While food safety and liability regulations often prevent the donation of open food items such as cupcakes, there are still meaningful ways to help.
            </p>
            <p className="mb-6">
              We can donate canned goods, and we can donate revenue to organizations that serve those in need. Each of us has the ability to make a difference. No contribution is too small. Every bit truly counts.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
