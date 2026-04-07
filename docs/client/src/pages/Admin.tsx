import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchCakes, resolveCakeImage, type CakeData } from "@/lib/cakes";
import { ToastAction } from "@/components/ui/toast";

const emptyForm: CakeData = {
  title: "",
  description: "",
  price: "",
  image: "",
};

export function Admin() {
  const { toast } = useToast();
  const [passwordInput, setPasswordInput] = useState("");
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [cakes, setCakes] = useState<CakeData[]>([]);
  const [form, setForm] = useState<CakeData>(emptyForm);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [authError, setAuthError] = useState("");
  const [contactRecipientEmail, setContactRecipientEmail] = useState("");

  async function loadCakes() {
    const list = await fetchCakes();
    setCakes(list);
  }

  async function loadAdminSettings(password: string) {
    const response = await fetch("/api/admin/settings", {
      headers: {
        "x-admin-password": password,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Could not load admin settings");
    }

    const settings = (await response.json()) as { contactRecipientEmail: string };
    setContactRecipientEmail(settings.contactRecipientEmail);
  }

  useEffect(() => {
    if (!adminPassword) {
      return;
    }

    loadCakes().catch((error) => {
      toast({
        title: "Could not load cakes",
        description: (error as Error).message,
        variant: "destructive",
      });
    });

    loadAdminSettings(adminPassword).catch((error) => {
      toast({
        title: "Could not load admin settings",
        description: (error as Error).message,
        variant: "destructive",
      });
    });
  }, [adminPassword, toast]);

  const previewImage = useMemo(() => resolveCakeImage(form.image), [form.image]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setAuthError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (!response.ok) {
        setAuthError("Incorrect password.");
        return;
      }

      setAdminPassword(passwordInput);
      setPasswordInput("");
      toast({ title: "Authenticated", description: "Admin access granted." });
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingIndex(null);
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !adminPassword) {
      return;
    }

    setIsUploadingImage(true);
    try {
      const payload = new FormData();
      payload.append("image", file);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: {
          "x-admin-password": adminPassword,
        },
        body: payload,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Image upload failed");
      }

      const data = (await response.json()) as { filename: string };
      setForm((prev) => ({ ...prev, image: data.filename }));
      toast({ title: "Image uploaded", description: `Saved as ${data.filename}` });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      event.target.value = "";
      setIsUploadingImage(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adminPassword) {
      return;
    }

    setIsLoading(true);
    try {
      const method = editingIndex === null ? "POST" : "PUT";
      const endpoint = editingIndex === null ? "/api/admin/cakes" : `/api/admin/cakes/${editingIndex}`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to save cake");
      }

      const updated = (await response.json()) as CakeData[];
      setCakes(updated);
      resetForm();
      toast({
        title: editingIndex === null ? "Cake added" : "Cake updated",
        description: "Your changes were saved to cakes.json.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adminPassword) {
      return;
    }

    setIsSavingSettings(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ contactRecipientEmail }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to save settings");
      }

      toast({
        title: "Settings saved",
        description: "Contact recipient email was updated.",
      });
    } catch (error) {
      toast({
        title: "Settings save failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleDelete(index: number) {
    if (!adminPassword) {
      return;
    }

    const cake = cakes[index];
    if (!cake) {
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${cake.title} cake?`);
    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/cakes/${index}`, {
        method: "DELETE",
        headers: { "x-admin-password": adminPassword },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to delete cake");
      }

      const updated = (await response.json()) as CakeData[];
      setCakes(updated);
      if (editingIndex === index) {
        resetForm();
      }
      toast({
        title: "Cake deleted",
        description: `${cake.title} was removed.`,
        action: (
          <ToastAction altText="Undo delete" onClick={() => void handleUndoDelete(cake, index)}>
            Undo
          </ToastAction>
        ),
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUndoDelete(cake: CakeData, originalIndex: number) {
    if (!adminPassword) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/cakes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify({ ...cake, index: originalIndex }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Undo failed");
      }

      const updated = (await response.json()) as CakeData[];
      setCakes(updated);
      toast({ title: "Delete undone", description: `${cake.title} was restored.` });
    } catch (error) {
      toast({
        title: "Undo failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(index: number) {
    setEditingIndex(index);
    setForm(cakes[index]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!adminPassword) {
    return (
      <div className="pt-24 pb-12 min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-card border border-border p-8">
            <h1 className="text-4xl font-heading text-primary mb-2">Admin</h1>
            <p className="text-muted-foreground mb-6">Enter the admin password to manage cakes.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2"
                placeholder="Admin password"
                required
              />
              {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 font-heading uppercase transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {isLoading ? "Checking..." : "Unlock Admin"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[380px_1fr] gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border p-6 h-fit">
              <h2 className="text-2xl font-heading text-primary mb-2">Contact Recipient</h2>
              <form onSubmit={handleSaveSettings} className="space-y-3">
                <input
                  type="email"
                  value={contactRecipientEmail}
                  onChange={(event) => setContactRecipientEmail(event.target.value)}
                  className="w-full bg-background border border-input rounded-md px-3 py-2"
                  placeholder="recipient@example.com"
                  required
                />
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full bg-primary text-primary-foreground py-2 font-heading uppercase transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {isSavingSettings ? "Saving..." : "Save Recipient Email"}
                </button>
              </form>
            </div>

            <div className="bg-card border border-border p-6 h-fit">
            <h2 className="text-2xl font-heading text-primary mb-2">
              {editingIndex === null ? "Add Cake" : "Edit Cake"}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full bg-background border border-input rounded-md px-3 py-2"
                placeholder="Title"
                required
              />
              <input
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                className="w-full bg-background border border-input rounded-md px-3 py-2"
                placeholder="Price, e.g. $85"
                required
              />
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage || isLoading}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Upload fills the image filename automatically.
                </p>
              </div>
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="w-full bg-background border border-input rounded-md px-3 py-2 min-h-[120px]"
                placeholder="Description"
                required
              />

              {form.image ? (
                <img
                  src={previewImage}
                  alt="Cake preview"
                  className="w-full h-44 object-cover border border-border rounded-md"
                />
              ) : null}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading || isUploadingImage}
                  className="flex-1 bg-primary text-primary-foreground py-2 font-heading uppercase transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {editingIndex === null ? "Add" : "Update"}
                </button>
                {editingIndex !== null ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 border border-border py-2 font-heading uppercase transition-colors hover:bg-muted"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>
          </div>

          <div className="bg-card border border-border p-6">
            <h2 className="text-3xl font-heading text-white mb-4">Existing Cakes</h2>
            <div className="space-y-4">
              {cakes.map((cake, index) => (
                <div key={`${cake.title}-${index}`} className="grid md:grid-cols-[110px_1fr_auto] gap-4 border border-border p-4">
                  <img
                    src={resolveCakeImage(cake.image)}
                    alt={cake.title}
                    className="w-full h-24 object-cover"
                  />
                  <div>
                    <p className="text-white font-heading text-lg">{cake.title}</p>
                    <p className="text-primary font-semibold">{cake.price}</p>
                    <p className="text-sm text-muted-foreground">{cake.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Image: {cake.image}</p>
                  </div>
                  <div className="flex md:flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="border border-primary text-primary px-3 py-2 text-sm uppercase font-heading transition-colors hover:bg-primary/90 hover:text-primary-foreground"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="border border-primary text-primary px-3 py-2 text-sm uppercase font-heading transition-colors hover:bg-primary/90 hover:text-primary-foreground"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {cakes.length === 0 ? (
                <p className="text-muted-foreground">No cakes found in data file.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
