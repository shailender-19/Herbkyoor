import type { Doctor } from "@/data/doctors";
import { request, resolveAssetPath } from "./client";

/**
 * Public doctors read endpoint (PHP). Returns the roster shown in the header
 * "Consult a Doctor" modal. Avatar paths are normalized onto the app's public
 * asset layout (see resolveAssetPath).
 */
export function fetchDoctors(): Promise<Doctor[]> {
  return request<{ doctors: Doctor[] }>(`/doctors/list.php`).then((r) =>
    (r.doctors ?? []).map((d) => ({
      ...d,
      avatar: resolveAssetPath(d.avatar),
    })),
  );
}
