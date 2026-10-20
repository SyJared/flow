const settingsKey = userId => `flow-settings-${userId}`;

export const getPreferences = userId => {
  if (!userId) return { landingPage: "dashboard", showNotificationBadge: true };
  try {
    return {
      landingPage: "dashboard",
      showNotificationBadge: true,
      ...JSON.parse(localStorage.getItem(settingsKey(userId)) || "{}"),
    };
  } catch {
    return { landingPage: "dashboard", showNotificationBadge: true };
  }
};

export const savePreferences = (userId, preferences) => {
  if (!userId) return;
  localStorage.setItem(settingsKey(userId), JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent("flow-preferences-changed", { detail: { userId } }));
};
