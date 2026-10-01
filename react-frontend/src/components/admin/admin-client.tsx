
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import {
  FolderPlus,
  ImagePlus,
  Loader2,
  LogOut,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input, Select, Textarea } from "@/components/ui/input";
import { adminApi } from "@/api/admin";
import { resolveAssetPath } from "@/api/client";

// ---------------------------------------------------------------------------
// Types (mirror the admin API payloads)
// ---------------------------------------------------------------------------

interface RawProduct {
  product_id: string;
  product_name: string;
  product_price: string | number;
  product_category: string;
  product_image_path_list: string[];
  size_available: string[];
  product_description: string;
  discount: string | number;
  sceme: string;
}

interface CategoryMeta {
  name: string;
  description: string;
  icon: string;
  image?: string;
}

interface AdminCategory {
  slug: string;
  meta: CategoryMeta | null;
  productCount: number;
  products: RawProduct[];
}

type Phase = "loading" | "login" | "ready";

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

/** Split a textarea value (comma or newline separated) into a clean array. */
function toList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Image uploader
// ---------------------------------------------------------------------------

/**
 * Upload + preview + remove images. Files are POSTed to `/api/admin/upload`,
 * stored under `public/product_images/<folder>/`, and the returned paths are
 * mapped onto the product / category via `onChange`.
 */
function ImageManager({
  images,
  folder,
  onChange,
  single = false,
}: {
  images: string[];
  folder: string;
  onChange: (next: string[]) => void;
  single?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      // Note: no explicit Content-Type — the browser sets the multipart boundary.
      const { ok, data } = await adminApi.upload(file, folder || "misc");
      if (ok && typeof data.path === "string") {
        added.push(data.path);
      } else {
        setError((data.error as string) ?? "Upload failed.");
        break;
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    if (added.length === 0) return;
    onChange(single ? [added[added.length - 1]] : [...images, ...added]);
  };

  const remove = (path: string) => onChange(images.filter((i) => i !== path));

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((src) => (
          <div
            key={src}
            className="group relative h-20 w-20 overflow-hidden rounded-lg border border-cream-300 bg-cream-100"
          >
            <Image
              src={resolveAssetPath(src)}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => remove(src)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-forest-950/70 text-cream-50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-cream-400 text-forest-600 transition-colors hover:bg-cream-100 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              {single && images.length > 0 ? (
                <Upload size={18} />
              ) : (
                <ImagePlus size={18} />
              )}
              <span className="text-[11px] font-medium">
                {single && images.length > 0 ? "Replace" : "Upload"}
              </span>
            </>
          )}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={!single}
        className="hidden"
        onChange={(e) => upload(e.target.files)}
      />

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-forest-700/50">
        PNG, JPG, WEBP, GIF, SVG or AVIF · up to 5 MB · saved to{" "}
        <code className="rounded bg-cream-200 px-1 py-0.5">
          /product_images/{folder || "misc"}
        </code>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export function AdminClient() {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    let active = true;
    adminApi
      .session()
      .then(({ data }) => {
        if (active) setPhase(data.authenticated ? "ready" : "login");
      })
      .catch(() => active && setPhase("login"));
    return () => {
      active = false;
    };
  }, []);

  if (phase === "loading") {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center py-20">
        <Loader2 className="animate-spin text-forest-600" size={28} />
      </Container>
    );
  }

  if (phase === "login") {
    return <LoginScreen onSuccess={() => setPhase("ready")} />;
  }

  return <Panel onLogout={() => setPhase("login")} />;
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { ok, data } = await adminApi.login({ username, password });
    setBusy(false);
    if (ok) onSuccess();
    else setError((data.error as string) ?? "Login failed.");
  };

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm rounded-2xl border border-cream-300 bg-cream-50 p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-forest-500">
            Admin Area
          </span>
          <h1 className="mt-1 text-2xl font-bold text-forest-900">Sign in</h1>
          <p className="mt-1 text-sm text-forest-700/60">
            Manage product categories and items.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Username"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="animate-spin" size={16} />}
            Sign in
          </Button>
        </form>
      </div>
    </Container>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function Panel({ onLogout }: { onLogout: () => void }) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [icons, setIcons] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [editingProduct, setEditingProduct] = useState<{
    category: string;
    product: RawProduct | null;
  } | null>(null);
  const [editingCategory, setEditingCategory] = useState<
    AdminCategory | "new" | null
  >(null);
  const [confirm, setConfirm] = useState<
    | { kind: "product"; category: string; product: RawProduct }
    | { kind: "category"; category: AdminCategory }
    | null
  >(null);
  const [busy, setBusy] = useState(false);

  const apply = useCallback(
    (ok: boolean, data: Record<string, unknown>) => {
      setLoading(false);
      if (!ok) {
        setError((data.error as string) ?? "Failed to load catalogue.");
        return;
      }
      const cats = (data.categories as AdminCategory[]) ?? [];
      setCategories(cats);
      setIcons((data.icons as string[]) ?? []);
      setError(null);
      setSelected((prev) => {
        if (prev && cats.some((c) => c.slug === prev)) return prev;
        return cats[0]?.slug ?? null;
      });
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await adminApi.catalog();
    apply(ok, data);
  }, [apply]);

  useEffect(() => {
    let active = true;
    adminApi.catalog().then(({ ok, data }) => {
      if (active) apply(ok, data);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const logout = async () => {
    await adminApi.logout();
    onLogout();
  };

  const current = useMemo(
    () => categories.find((c) => c.slug === selected) ?? null,
    [categories, selected],
  );

  const totalProducts = useMemo(
    () => categories.reduce((sum, c) => sum + c.productCount, 0),
    [categories],
  );

  const doDelete = async () => {
    if (!confirm) return;
    setBusy(true);
    const { ok, data } =
      confirm.kind === "product"
        ? await adminApi.deleteProduct(
            confirm.category,
            confirm.product.product_id,
          )
        : await adminApi.deleteCategory(confirm.category.slug);
    setBusy(false);
    if (!ok) {
      setError((data.error as string) ?? "Delete failed.");
      return;
    }
    setConfirm(null);
    await load();
  };

  return (
    <>
      <Container className="py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-500">
              Admin
            </span>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              Catalogue Management
            </h1>
            <p className="mt-2 text-sm text-forest-700/60">
              {categories.length} categories · {totalProducts} products ·
              changes are saved to{" "}
              <code className="rounded bg-cream-200 px-1 py-0.5 text-xs">
                Product_list.json
              </code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : undefined}
              />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut size={16} /> Logout
            </Button>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Categories */}
          <aside className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-forest-700/70">
                Categories
              </h2>
              <Button size="sm" onClick={() => setEditingCategory("new")}>
                <FolderPlus size={16} /> New
              </Button>
            </div>
            <div className="space-y-1.5">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setSelected(c.slug)}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    selected === c.slug
                      ? "border-forest-300 bg-forest-50"
                      : "border-cream-300 bg-cream-50 hover:bg-cream-100"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-forest-800">
                      {c.meta?.name ?? c.slug}
                    </span>
                    <span className="block truncate text-xs text-forest-700/50">
                      {c.slug}
                    </span>
                  </span>
                  <Badge tone="muted">{c.productCount}</Badge>
                </button>
              ))}
              {categories.length === 0 && !loading && (
                <p className="rounded-xl border border-dashed border-cream-400 bg-cream-100/60 px-3 py-6 text-center text-sm text-forest-700/50">
                  No categories yet.
                </p>
              )}
            </div>
          </aside>

          {/* Products */}
          <section className="min-w-0">
            {current ? (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-forest-900">
                      {current.meta?.name ?? current.slug}
                    </h2>
                    <p className="truncate text-sm text-forest-700/60">
                      {current.meta?.description ?? "No description."}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCategory(current)}
                    >
                      <Pencil size={16} /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() =>
                        setConfirm({ kind: "category", category: current })
                      }
                    >
                      <Trash2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        setEditingProduct({
                          category: current.slug,
                          product: null,
                        })
                      }
                    >
                      <Plus size={16} /> Add Product
                    </Button>
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-cream-300">
                  {current.products.length === 0 ? (
                    <p className="bg-cream-50 px-4 py-12 text-center text-sm text-forest-700/50">
                      No products in this category yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-cream-200">
                      {current.products.map((p) => (
                        <li
                          key={p.product_id}
                          className="flex items-center gap-3 bg-cream-50 px-3 py-3 hover:bg-cream-100/60"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-cream-300 bg-cream-100">
                            {p.product_image_path_list?.[0] ? (
                              <Image
                                src={resolveAssetPath(p.product_image_path_list[0])}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-forest-700/30">
                                <Package size={18} />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-forest-800">
                              {p.product_name}
                            </p>
                            <p className="truncate text-xs text-forest-700/50">
                              {p.product_id}
                              {p.product_price ? ` · ₹${p.product_price}` : ""}
                              {p.discount ? ` · ${p.discount}% off` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <IconButton
                              label="Edit product"
                              onClick={() =>
                                setEditingProduct({
                                  category: current.slug,
                                  product: p,
                                })
                              }
                            >
                              <Pencil size={16} />
                            </IconButton>
                            <IconButton
                              label="Delete product"
                              className="hover:bg-red-50 hover:text-red-600"
                              onClick={() =>
                                setConfirm({
                                  kind: "product",
                                  category: current.slug,
                                  product: p,
                                })
                              }
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              !loading && (
                <p className="rounded-2xl border border-dashed border-cream-400 bg-cream-100/60 px-4 py-16 text-center text-forest-700/60">
                  Select or create a category to manage its products.
                </p>
              )
            )}
          </section>
        </div>
      </Container>

      {editingProduct && (
        <ProductModal
          category={editingProduct.category}
          product={editingProduct.product}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSaved={async () => {
            setEditingProduct(null);
            await load();
          }}
        />
      )}

      {editingCategory && (
        <CategoryModal
          category={editingCategory === "new" ? null : editingCategory}
          icons={icons}
          onClose={() => setEditingCategory(null)}
          onSaved={async (slug) => {
            setEditingCategory(null);
            await load();
            setSelected(slug);
          }}
        />
      )}

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === "category" ? "Delete category?" : "Delete product?"}
        className="max-w-sm"
      >
        <p className="text-sm text-forest-700/70">
          {confirm?.kind === "category" ? (
            <>
              This permanently removes{" "}
              <strong>{confirm.category.meta?.name ?? confirm.category.slug}</strong>{" "}
              and all {confirm.category.productCount} of its products from the
              catalogue file.
            </>
          ) : confirm?.kind === "product" ? (
            <>
              This permanently removes{" "}
              <strong>{confirm.product.product_name}</strong> from the catalogue
              file.
            </>
          ) : null}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={doDelete}
            disabled={busy}
          >
            {busy && <Loader2 className="animate-spin" size={16} />}
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}

function IconButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-cream-300 text-forest-700 transition-colors hover:bg-cream-200 ${
        className ?? ""
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Product editor
// ---------------------------------------------------------------------------

function ProductModal({
  category,
  product,
  categories,
  onClose,
  onSaved,
}: {
  category: string;
  product: RawProduct | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    product_name: product?.product_name ?? "",
    product_price: String(product?.product_price ?? ""),
    product_category: product?.product_category ?? category,
    discount: String(product?.discount ?? ""),
    sceme: product?.sceme ?? "",
    product_description: product?.product_description ?? "",
    sizes: (product?.size_available ?? []).join(", "),
  });
  const [images, setImages] = useState<string[]>(
    product?.product_image_path_list ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const payload = {
      product_name: form.product_name,
      product_price: form.product_price,
      product_category: form.product_category,
      discount: form.discount,
      sceme: form.sceme,
      product_description: form.product_description,
      product_image_path_list: images,
      size_available: toList(form.sizes),
    };

    const { ok, data } = isEdit
      ? await adminApi.updateProduct({
          category,
          id: product!.product_id,
          product: payload,
        })
      : await adminApi.createProduct(payload);

    setBusy(false);
    if (ok) onSaved();
    else setError((data.error as string) ?? "Save failed.");
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? "Edit Product" : "Add Product"}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Product name"
          required
          value={form.product_name}
          onChange={(e) => set("product_name", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price (₹)"
            inputMode="numeric"
            value={form.product_price}
            onChange={(e) => set("product_price", e.target.value)}
            hint="Leave blank if not set"
          />
          <Input
            label="Discount (%)"
            inputMode="numeric"
            value={form.discount}
            onChange={(e) => set("discount", e.target.value)}
          />
          <Select
            label="Category"
            value={form.product_category}
            onChange={(e) => set("product_category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.meta?.name ?? c.slug}
              </option>
            ))}
          </Select>
          <Input
            label="Scheme / Offer"
            value={form.sceme}
            onChange={(e) => set("sceme", e.target.value)}
            hint='e.g. "Buy 1 Get 1"'
          />
        </div>
        <Textarea
          label="Sizes available"
          rows={2}
          value={form.sizes}
          onChange={(e) => set("sizes", e.target.value)}
          hint="Comma separated, e.g. 30 Capsule, 60 Capsule"
        />
        <div>
          <span className="mb-1.5 block text-sm font-medium text-forest-800">
            Product images
          </span>
          <ImageManager
            images={images}
            folder={form.product_category}
            onChange={setImages}
          />
        </div>
        <Textarea
          label="Description"
          rows={3}
          value={form.product_description}
          onChange={(e) => set("product_description", e.target.value)}
        />
        {error && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="animate-spin" size={16} />}
            {isEdit ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Category editor
// ---------------------------------------------------------------------------

function CategoryModal({
  category,
  icons,
  onClose,
  onSaved,
}: {
  category: AdminCategory | null;
  icons: string[];
  onClose: () => void;
  onSaved: (slug: string) => void;
}) {
  const isEdit = !!category;
  const [form, setForm] = useState({
    slug: category?.slug ?? "",
    name: category?.meta?.name ?? "",
    description: category?.meta?.description ?? "",
    icon: category?.meta?.icon ?? icons[0] ?? "Leaf",
  });
  const [image, setImage] = useState<string>(category?.meta?.image ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Where uploaded cover images land. Uses the (fixed) slug when editing, or a
  // best-effort slug from the typed slug/name when creating.
  const uploadFolder =
    (isEdit ? category!.slug : form.slug.trim()) ||
    form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
    "categories";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { ok, data } = isEdit
      ? await adminApi.updateCategory({
          slug: category!.slug,
          name: form.name,
          description: form.description,
          icon: form.icon,
          image,
        })
      : await adminApi.createCategory({
          slug: form.slug || undefined,
          name: form.name,
          description: form.description,
          icon: form.icon,
          image,
        });

    setBusy(false);
    if (ok) {
      const saved = data.category as AdminCategory | undefined;
      onSaved(saved?.slug ?? category?.slug ?? form.slug);
    } else {
      setError((data.error as string) ?? "Save failed.");
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Edit Category" : "New Category"}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Display name"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          hint='Shown on the storefront, e.g. "Heart Care"'
        />
        {!isEdit && (
          <Input
            label="Slug (optional)"
            value={form.slug}
            onChange={(e) => set("slug", e.target.value)}
            hint="Auto-derived from the name if left blank"
          />
        )}
        {isEdit && (
          <p className="text-xs text-forest-700/50">
            Slug:{" "}
            <code className="rounded bg-cream-200 px-1 py-0.5">
              {category!.slug}
            </code>{" "}
            (cannot be changed)
          </p>
        )}
        <Textarea
          label="Description"
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
        <Select
          label="Icon"
          value={form.icon}
          onChange={(e) => set("icon", e.target.value)}
        >
          {icons.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-forest-800">
            Cover image
          </span>
          <ImageManager
            images={image ? [image] : []}
            folder={uploadFolder}
            single
            onChange={(imgs) => setImage(imgs[0] ?? "")}
          />
          <p className="mt-1 text-xs text-forest-700/50">
            Optional — falls back to the first product image if left empty.
          </p>
        </div>
        {error && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="animate-spin" size={16} />}
            {isEdit ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
