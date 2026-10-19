<?php
/**
 * Doctors domain logic — the "Consult a Doctor" roster shown in the storefront
 * header modal and managed from the admin panel. Mirrors the catalog.php style:
 * thin endpoints call these functions; all validation lives here.
 */

declare(strict_types=1);

/** Max bio length kept in step with the DB column. */
const DOCTOR_BIO_MAX = 500;

/**
 * Shape one DB row into the public JSON object the frontend `Doctor` type
 * expects (id as string, languages as an array, experience as an int).
 */
function doctor_view(array $row): array
{
    $languages = array_values(array_filter(array_map(
        'trim',
        explode(',', (string) ($row['languages'] ?? '')),
    ), fn ($s) => $s !== ''));

    return [
        'id'             => (string) $row['id'],
        'name'           => (string) $row['name'],
        'qualifications' => (string) ($row['qualifications'] ?? ''),
        'specialization' => (string) ($row['specialization'] ?? ''),
        'experience'     => (int) ($row['experience'] ?? 0),
        'languages'      => $languages,
        'bio'            => (string) ($row['bio'] ?? ''),
        'availability'   => (string) ($row['availability'] ?? ''),
        'avatar'         => (string) ($row['avatar'] ?? ''),
    ];
}

/** All doctors in display order (public + admin share this read). */
function get_doctors(PDO $pdo): array
{
    $rows = $pdo->query(
        'SELECT id, name, qualifications, specialization, experience, languages,
                bio, availability, avatar
         FROM doctors ORDER BY sort_order, id'
    )->fetchAll();
    return array_map('doctor_view', $rows);
}

/** Fetch a single doctor view by primary key, or throw 404. */
function fetch_doctor(PDO $pdo, int $id): array
{
    $stmt = $pdo->prepare(
        'SELECT id, name, qualifications, specialization, experience, languages,
                bio, availability, avatar
         FROM doctors WHERE id = ? LIMIT 1'
    );
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) {
        throw new ApiError("Doctor #$id not found.", 404);
    }
    return doctor_view($row);
}

/** Normalize the editable fields out of a request body (shared create/update). */
function doctor_fields(array $input, array $defaults = []): array
{
    $languages = $input['languages'] ?? ($defaults['languages'] ?? []);
    if (is_string($languages)) {
        $languages = explode(',', $languages);
    }
    $languages = implode(', ', string_list(is_array($languages) ? $languages : []));

    $experience = $input['experience'] ?? ($defaults['experience'] ?? 0);
    $experience = max(0, (int) parse_number_or_null($experience));

    $bio = trim((string) ($input['bio'] ?? ($defaults['bio'] ?? '')));
    if (mb_strlen($bio) > DOCTOR_BIO_MAX) {
        $bio = mb_substr($bio, 0, DOCTOR_BIO_MAX);
    }

    return [
        'qualifications' => trim((string) ($input['qualifications'] ?? ($defaults['qualifications'] ?? ''))),
        'specialization' => trim((string) ($input['specialization'] ?? ($defaults['specialization'] ?? ''))),
        'experience'     => $experience,
        'languages'      => $languages,
        'bio'            => $bio,
        'availability'   => trim((string) ($input['availability'] ?? ($defaults['availability'] ?? ''))),
        'avatar'         => trim((string) ($input['avatar'] ?? ($defaults['avatar'] ?? ''))) ?: null,
    ];
}

/** Create a doctor; `name` is the only required field. */
function create_doctor(PDO $pdo, array $input): array
{
    $name = require_string($input['name'] ?? null, 'name');
    $f = doctor_fields($input);

    $stmt = $pdo->prepare(
        'INSERT INTO doctors
           (name, qualifications, specialization, experience, languages, bio, availability, avatar, sort_order)
         VALUES (?,?,?,?,?,?,?,?, (SELECT COALESCE(MAX(sort_order)+1,0) FROM doctors d))'
    );
    $stmt->execute([
        $name, $f['qualifications'], $f['specialization'], $f['experience'],
        $f['languages'], $f['bio'], $f['availability'], $f['avatar'],
    ]);
    return fetch_doctor($pdo, (int) $pdo->lastInsertId());
}

/** Update a doctor by id. Omitted fields keep their current value. */
function update_doctor(PDO $pdo, array $input): array
{
    $id = (int) ($input['id'] ?? 0);
    if ($id <= 0) {
        throw new ApiError('"id" is required.', 400);
    }
    $stmt = $pdo->prepare(
        'SELECT name, qualifications, specialization, experience, languages,
                bio, availability, avatar
         FROM doctors WHERE id = ? LIMIT 1'
    );
    $stmt->execute([$id]);
    $cur = $stmt->fetch();
    if (!$cur) {
        throw new ApiError("Doctor #$id not found.", 404);
    }

    $name = trim((string) ($input['name'] ?? '')) ?: $cur['name'];
    // Only treat a field as "provided" when the key is present; otherwise keep.
    $cur['languages'] = array_filter(array_map('trim', explode(',', (string) $cur['languages'])));
    $f = doctor_fields(array_intersect_key($input, array_flip([
        'qualifications', 'specialization', 'experience', 'languages', 'bio', 'availability', 'avatar',
    ])), $cur);

    $prevAvatar = $cur['avatar'] ?: null;

    $upd = $pdo->prepare(
        'UPDATE doctors SET name = ?, qualifications = ?, specialization = ?,
                experience = ?, languages = ?, bio = ?, availability = ?, avatar = ?
         WHERE id = ?'
    );
    $upd->execute([
        $name, $f['qualifications'], $f['specialization'], $f['experience'],
        $f['languages'], $f['bio'], $f['availability'], $f['avatar'], $id,
    ]);

    // Clean up a replaced avatar we uploaded (never touch bundled /avatars/*).
    if ($prevAvatar && $prevAvatar !== $f['avatar']) {
        delete_image_file($prevAvatar);
    }
    return fetch_doctor($pdo, $id);
}

/** Delete a doctor by id (and clean up an uploaded avatar). */
function delete_doctor(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare('SELECT avatar FROM doctors WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    $cur = $stmt->fetch();
    if (!$cur) {
        throw new ApiError("Doctor #$id not found.", 404);
    }
    $pdo->prepare('DELETE FROM doctors WHERE id = ?')->execute([$id]);
    if ($cur['avatar']) {
        delete_image_file($cur['avatar']);
    }
}
