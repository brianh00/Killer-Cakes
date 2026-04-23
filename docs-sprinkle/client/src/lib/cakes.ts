export interface CakeData {
  title: string;
  description: string;
  price: string;
  image: string;
}

const appBase = import.meta.env.PROD ? "/Killer-Cakes" : "";

const imageModules = import.meta.glob(
  "@assets/cakes/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

function resolveBundledImage(filename: string): string {
  const match = Object.entries(imageModules).find(([modulePath]) =>
    modulePath.endsWith(`/cakes/${filename}`),
  );
  return match?.[1] ?? "";
}

export function resolveCakeImage(image: string): string {
  if (!image) {
    return "";
  }

  if (/^(https?:)?\/\//.test(image) || image.startsWith("/")) {
    return image;
  }

  const bundled = resolveBundledImage(image);
  if (bundled) {
    return bundled;
  }

  return `${appBase}/attached_assets/cakes/${encodeURIComponent(image)}`;
}

export async function fetchCakes(): Promise<CakeData[]> {
  const response = await fetch("/api/cakes");
  if (!response.ok) {
    throw new Error("Failed to load cakes");
  }

  const cakes = (await response.json()) as CakeData[];
  return cakes;
}
