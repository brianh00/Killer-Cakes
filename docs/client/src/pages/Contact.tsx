import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please select a valid date",
  }),
  flavor: z.string().min(1, "Please select a flavor vibe."),
  message: z.string().min(10, "Tell us more about your killer idea."),
});

export function Contact() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      date: "",
      flavor: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to send request");
      }

      toast({
        title: "Request Received!",
        description: "Your request was sent. We’ll be in touch soon.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Failed to send request",
        description: (error as Error).message || "Could not send message. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-heading text-primary mb-4">Get In Touch</h1>
          <p className="text-xl text-muted-foreground">Ready to order? Tell us what you're craving.</p>
        </motion.div>

        <div className="grid md:grid-cols-1 gap-12 bg-card p-8 md:p-12 border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-bold tracking-wider">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} className="bg-background border-input focus:border-primary h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-bold tracking-wider">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="jane@example.com" {...field} className="bg-background border-input focus:border-primary h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-bold tracking-wider">Event Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-background border-input focus:border-primary h-12 block" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="flavor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-bold tracking-wider">Vibe / Flavor Profile</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Dark Chocolate, Fruity, Surprise Me" {...field} className="bg-background border-input focus:border-primary h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase font-bold tracking-wider">The Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about the event, the design you have in mind, or if you want us to go wild..." 
                        className="bg-background border-input focus:border-primary min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-14 text-lg font-heading uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground">
                Send Request
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
