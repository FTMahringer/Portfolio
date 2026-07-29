"use client";

import { useState } from "react";
import { useSettings } from "@/context/SettingsContext";
import PublicSettingsPanel, {
  type PublicSettingsSectionKey,
} from "./PublicSettingsPanel";
import PublicSettingsTrigger from "./PublicSettingsTrigger";

export function SettingsDrawer() {
  const { settings, update } = useSettings();
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<PublicSettingsSectionKey>("appearance");

  return (
    <>
      <svg
        style={{ position: "absolute", width: 0, height: 0 }}
        aria-hidden="true"
      >
        <defs>
          <filter id="filter-deuteranopia">
            <feColorMatrix
              type="matrix"
              values="0.367 0.861 -0.228 0 0  0.280 0.673 0.047 0 0  -0.012 0.043 0.969 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="filter-protanopia">
            <feColorMatrix
              type="matrix"
              values="0.152 0.772 -0.040 0 0  0.155 0.793 0.052 0 0  -0.004 -0.040 1.044 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="filter-tritanopia">
            <feColorMatrix
              type="matrix"
              values="1.256 -0.077 -0.180 0 0  -0.078 0.931 0.148 0 0  0.005 0.691 0.304 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      <PublicSettingsTrigger open={open} onClick={() => setOpen((current) => !current)} />

      <PublicSettingsPanel
        open={open}
        section={section}
        onSectionChange={setSection}
        onClose={() => setOpen(false)}
        settings={settings}
        update={update}
      />
    </>
  );
}

export type { PublicSettingsSectionKey } from "./PublicSettingsPanel";
