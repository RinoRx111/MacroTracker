/**
 * Compares two semantic version strings.
 * Normalized to handle prefixes like 'v' or 'V' and extra/missing segments.
 * 
 * @param {string} v1 The first version string
 * @param {string} v2 The second version string
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if they are equivalent
 */
export function compareVersions(v1, v2) {
  const normalize = (v) => {
    if (typeof v !== 'string') return [];
    // Remove leading 'v' or 'V' and split by dot
    return v
      .trim()
      .replace(/^[vV]/, '')
      .split('.')
      .map(part => parseInt(part, 10))
      .filter(num => !isNaN(num));
  };

  const parts1 = normalize(v1);
  const parts2 = normalize(v2);
  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const val1 = parts1[i] || 0;
    const val2 = parts2[i] || 0;

    if (val1 > val2) return 1;
    if (val1 < val2) return -1;
  }

  return 0;
}

/**
 * Checks if version 2 is strictly newer than version 1.
 * Typically used as: isNewerVersion(currentVersion, latestVersion)
 * 
 * @param {string} currentVersion The local version
 * @param {string} latestVersion The latest version from remote
 * @returns {boolean} true if latestVersion is newer than currentVersion
 */
export function isNewerVersion(currentVersion, latestVersion) {
  return compareVersions(currentVersion, latestVersion) === -1;
}
