
import { useMemo, useState } from "react";
import { Image } from "@/components/ui/image";
import {
  Eye,
  ImageIcon,
  Pencil,
  Plus,
  Power,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input, Select, Textarea } from "@/components/ui/input";
import { advertisements as seed } from "@/data/advertisements";
import type {
  Advertisement,
  AdvertisementStatus,
  AdvertisementType,
} from "@/types";
import { cn } from "@/lib/utils";

const statusTone: Record<
  AdvertisementStatus,
  "success" | "muted" | "danger" | "discount"
> = {
  active: "success",
  scheduled: "discount",
  expired: "danger",
  disabled: "muted",
};

const typeLabels: Record<AdvertisementType | "all", string> = {
  all: "All",
  banner: "Banners",
  gif: "Product GIFs",
  slider: "Sliders",
};

const emptyDraft: Advertisement = {
  id: "",
  title: "",
  subtitle: "",
  eyebrow: "",
  ctaLabel: "Shop Now",
  ctaHref: "/products",
  image: "/banners/monsoon-wellness.svg",
  type: "banner",
  status: "scheduled",
  startDate: "",
  endDate: "",
  accent: "#274a37",
};

export function DashboardClient() {
  const [ads, setAds] = useState<Advertisement[]>(seed);
  const [filter, setFilter] = useState<AdvertisementType | "all">("all");
  const [editing, setEditing] = useState<Advertisement | null>(null);
  const [preview, setPreview] = useState<Advertisement | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? ads : ads.filter((a) => a.type === filter)),
    [ads, filter],
  );

  const stats = useMemo(
    () => ({
      total: ads.length,
      active: ads.filter((a) => a.status === "active").length,
      scheduled: ads.filter((a) => a.status === "scheduled").length,
      disabled: ads.filter((a) => a.status === "disabled").length,
    }),
    [ads],
  );

  const toggleStatus = (id: string) =>
    setAds((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === "disabled" ? "active" : "disabled",
            }
          : a,
      ),
    );

  const remove = (id: string) => {
    setAds((prev) => prev.filter((a) => a.id !== id));
    setConfirmId(null);
  };

  const save = (draft: Advertisement) => {
    setAds((prev) => {
      const exists = prev.some((a) => a.id === draft.id);
      if (exists) return prev.map((a) => (a.id === draft.id ? draft : a));
      return [{ ...draft, id: `ad-${Date.now().toString(36)}` }, ...prev];
    });
    setEditing(null);
  };

  return (
    <>
      <Container className="py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-500">
              Admin
            </span>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              Advertisement Management
            </h1>
            <p className="mt-2 text-forest-700/60">
              Manage promotional banners, product GIFs and sliders. (Demo UI
              with mock data.)
            </p>
          </div>
          <Button onClick={() => setEditing({ ...emptyDraft })}>
            <Plus size={18} /> Add Advertisement
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total" value={stats.total} icon={<ImageIcon size={18} />} />
          <StatCard label="Active" value={stats.active} icon={<TrendingUp size={18} />} tone="forest" />
          <StatCard label="Scheduled" value={stats.scheduled} icon={<Eye size={18} />} tone="gold" />
          <StatCard label="Disabled" value={stats.disabled} icon={<Power size={18} />} />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {(Object.keys(typeLabels) as (AdvertisementType | "all")[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                filter === t
                  ? "bg-forest-700 text-cream-50"
                  : "border border-cream-300 text-forest-700 hover:bg-cream-200",
              )}
            >
              {typeLabels[t]}
            </button>
          ))}
        </div>

        {/* Table (desktop) */}
        <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-cream-300 md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-wide text-forest-700/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Advertisement</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Schedule</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {visible.map((ad) => (
                <tr key={ad.id} className="bg-cream-50 hover:bg-cream-100/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={ad.image}
                        alt=""
                        width={64}
                        height={40}
                        className="h-10 w-16 rounded-md border border-cream-300 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-forest-800">
                          {ad.title}
                        </p>
                        <p className="truncate text-xs text-forest-700/50">
                          {ad.subtitle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-forest-700">
                    {ad.type}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[ad.status]}>{ad.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-forest-700/70">
                    {ad.startDate} → {ad.endDate}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      ad={ad}
                      onPreview={() => setPreview(ad)}
                      onEdit={() => setEditing(ad)}
                      onToggle={() => toggleStatus(ad.id)}
                      onDelete={() => setConfirmId(ad.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="mt-6 space-y-4 md:hidden">
          {visible.map((ad) => (
            <div
              key={ad.id}
              className="rounded-2xl border border-cream-300 bg-cream-50 p-4"
            >
              <div className="flex gap-3">
                <Image
                  src={ad.image}
                  alt=""
                  width={80}
                  height={56}
                  className="h-14 w-20 rounded-md border border-cream-300 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-forest-800">
                    {ad.title}
                  </p>
                  <p className="truncate text-xs text-forest-700/50">
                    {ad.startDate} → {ad.endDate}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge tone={statusTone[ad.status]}>{ad.status}</Badge>
                    <span className="text-xs capitalize text-forest-700/60">
                      {ad.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t border-cream-200 pt-3">
                <RowActions
                  ad={ad}
                  onPreview={() => setPreview(ad)}
                  onEdit={() => setEditing(ad)}
                  onToggle={() => toggleStatus(ad.id)}
                  onDelete={() => setConfirmId(ad.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-cream-400 bg-cream-100/60 py-12 text-center text-forest-700/60">
            No advertisements in this category yet.
          </p>
        )}
      </Container>

      {/* Add / Edit modal */}
      {editing && (
        <AdEditor
          draft={editing}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}

      {/* Preview modal */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Advertisement Preview"
      >
        {preview && (
          <div className="overflow-hidden rounded-xl">
            <div className="relative aspect-[21/9] w-full">
              <Image
                src={preview.image}
                alt=""
                fill
                sizes="512px"
                className="object-cover"
              />
              <div
                className="absolute inset-0 flex items-center"
                style={{
                  background: `linear-gradient(90deg, ${preview.accent ?? "#274a37"}f2, transparent)`,
                }}
              >
                <div className="px-6">
                  {preview.eyebrow && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-cream-50/90">
                      {preview.eyebrow}
                    </span>
                  )}
                  <p className="text-xl font-bold text-cream-50">
                    {preview.title}
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-cream-100/90">
                    {preview.subtitle}
                  </p>
                </div>
              </div>
            </div>
            <dl className="mt-4 space-y-1.5 text-sm">
              <Row k="CTA" v={`${preview.ctaLabel} → ${preview.ctaHref}`} />
              <Row k="Type" v={preview.type} />
              <Row k="Status" v={preview.status} />
              <Row k="Schedule" v={`${preview.startDate} → ${preview.endDate}`} />
            </dl>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="Delete advertisement?"
        className="max-w-sm"
      >
        <p className="text-sm text-forest-700/70">
          This will remove the advertisement from the list. This action can be
          undone by reloading the demo.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setConfirmId(null)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => confirmId && remove(confirmId)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-forest-700/55">{k}</dt>
      <dd className="text-right font-medium capitalize text-forest-800">{v}</dd>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone?: "neutral" | "forest" | "gold";
}) {
  return (
    <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            tone === "forest" && "bg-forest-100 text-forest-700",
            tone === "gold" && "bg-gold-500/15 text-gold-600",
            tone === "neutral" && "bg-cream-200 text-forest-700",
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-forest-800">{value}</p>
      <p className="text-sm text-forest-700/60">{label}</p>
    </div>
  );
}

function RowActions({
  ad,
  onPreview,
  onEdit,
  onToggle,
  onDelete,
}: {
  ad: Advertisement;
  onPreview: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-cream-300 text-forest-700 transition-colors hover:bg-cream-200";
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button type="button" onClick={onPreview} aria-label="Preview" className={iconBtn}>
        <Eye size={16} />
      </button>
      <button type="button" onClick={onEdit} aria-label="Edit" className={iconBtn}>
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={onToggle}
        aria-label={ad.status === "disabled" ? "Enable" : "Disable"}
        className={cn(
          iconBtn,
          ad.status !== "disabled" && "text-forest-600",
        )}
      >
        <Power size={16} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete"
        className={cn(iconBtn, "hover:bg-red-50 hover:text-red-600")}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function AdEditor({
  draft,
  onCancel,
  onSave,
}: {
  draft: Advertisement;
  onCancel: () => void;
  onSave: (ad: Advertisement) => void;
}) {
  const [form, setForm] = useState<Advertisement>(draft);
  const set = <K extends keyof Advertisement>(key: K, value: Advertisement[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal
      open
      onClose={onCancel}
      title={draft.id ? "Edit Advertisement" : "Add Advertisement"}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
        className="space-y-4"
      >
        <Input
          label="Title"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <Textarea
          label="Subtitle"
          rows={2}
          value={form.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Eyebrow"
            value={form.eyebrow ?? ""}
            onChange={(e) => set("eyebrow", e.target.value)}
          />
          <Input
            label="Image path"
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            hint="e.g. /banners/monsoon-wellness.svg"
          />
          <Input
            label="CTA Label"
            value={form.ctaLabel}
            onChange={(e) => set("ctaLabel", e.target.value)}
          />
          <Input
            label="CTA Link"
            value={form.ctaHref}
            onChange={(e) => set("ctaHref", e.target.value)}
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) =>
              set("type", e.target.value as AdvertisementType)
            }
          >
            <option value="banner">Banner</option>
            <option value="gif">Product GIF</option>
            <option value="slider">Slider</option>
          </Select>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) =>
              set("status", e.target.value as AdvertisementStatus)
            }
          >
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </Select>
          <Input
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
          <Input
            label="End date"
            type="date"
            value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {draft.id ? "Save Changes" : "Add Advertisement"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
