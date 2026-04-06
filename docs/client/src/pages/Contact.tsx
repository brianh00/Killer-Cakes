import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearch } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { cakes as fallbackCakes } from "@/data";
import { fetchCakes, resolveCakeImage, type CakeData } from "@/lib/cakes";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(7, "Please enter a phone number."),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Please select a valid date",
    }),
    desiredCake: z.string().min(1, "Please select a desired cake."),
    otherCake: z.string().optional(),
    details: z.string().min(10, "Tell us more about your killer idea."),
  })
  .refine(
    (data) => data.desiredCake !== "Other" || (data.otherCake && data.otherCake.length > 5),
    {
      path: ["otherCake"],
      message: "Please describe your custom cake.",
    },
  );

export function Contact() {
  const { toast } = useToast();
  const search = useSearch();
  const preselectedCake = new URLSearchParams(search).get("cake") || "";
  const [cakes, setCakes] = useState<CakeData[]>(fallbackCakes);

  const cakeOptions = useMemo(() => [...cakes.map((c) => c.title), "Other"], [cakes]);
  const cakeImageMap = useMemo(
    () => Object.fromEntries(cakes.map((cake) => [cake.title, resolveCakeImage(cake.image)])),
    [cakes],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: "",
      desiredCake: preselectedCake || cakeOptions[0],
      otherCake: "",
      details: "",
    },
  });

  useEffect(() => {
    fetchCakes()
      .then(setCakes)
      .catch(() => {
        // Keep bundled data as fallback for static-only hosting.
      });
  }, []);

  useEffect(() => {
    if (preselectedCake && cakeOptions.includes(preselectedCake)) {
      form.setValue("desiredCake", preselectedCake);
      return;
    }

    const current = form.getValues("desiredCake");
    if (!cakeOptions.includes(current) && cakeOptions.length > 0) {
      form.setValue("desiredCake", cakeOptions[0]);
    }
  }, [preselectedCake, cakeOptions, form]);

  const desiredCake = form.watch("desiredCake");

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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-bold tracking-wider">Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} className="bg-background border-input focus:border-primary h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="desiredCake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase font-bold tracking-wider">Desired Cake</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                      >
                        {cakeOptions.map((cake) => (
                          <option key={cake} value={cake}>
                            {cake}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {cakeImageMap[desiredCake] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 min-h-[340px] flex justify-center"
                >
                  <img
                    src={cakeImageMap[desiredCake]}
                    alt={desiredCake}
                    className="w-3/5 h-[340px] object-cover rounded-md border border-border"
                  />
                </motion.div>
              )}

              {desiredCake === "Other" && (
                <FormField
                  control={form.control}
                  name="otherCake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-bold tracking-wider">Custom Cake Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us what your dream cake looks like..."
                          className="bg-background border-input focus:border-primary min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase font-bold tracking-wider">Additional Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share any other details we should know (venue, theme, allergies, etc.)"
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
