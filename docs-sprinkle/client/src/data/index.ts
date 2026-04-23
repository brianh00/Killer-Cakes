import cakesRaw from "./cakes.json";

// Eagerly import all cake images from attached_assets/cakes so they get hashed/bundled by Vite.
// Add a new image to attached_assets/cakes and a new entry to cakes.json — Vite picks it up automatically.
const imageModules = import.meta.glob(
  "@assets/cakes/*.{jpg,jpeg,png,JPG,JPEG,PNG}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

function resolveImage(filename: string): string {
  const match = Object.entries(imageModules).find(([path]) =>
    path.endsWith(`/cakes/${filename}`),
  );
  return match?.[1] ?? "";
}

export interface CakeData {
  title: string;
  description: string;
  price: string;
  image: string;
}

export const cakes: CakeData[] = (
  cakesRaw as Array<{ title: string; description: string; price: string; image: string }>
).map((cake) => ({
  ...cake,
  image: resolveImage(cake.image),
}));

// Map of cake title → resolved image URL, used by Contact page
export const cakeImageMap: Record<string, string> = Object.fromEntries(
  cakes.map((cake) => [cake.title, cake.image])
);
