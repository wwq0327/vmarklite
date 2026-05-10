/**
 * Sidebar Component — Read-Only Preview Mode
 *
 * Simplified sidebar showing only the document outline.
 */

import { useTranslation } from "react-i18next";
import { PanelLeftClose } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { OutlineView } from "./OutlineView";
import "./Sidebar.css";

// Constants
const TRAFFIC_LIGHTS_SPACER_PX = 28;

/** Simplified navigation sidebar showing only the document outline. */
export function Sidebar() {
  const { t } = useTranslation("sidebar");

  return (
    <div className="sidebar" style={{ width: "100%", height: "100%" }}>
      {/* Spacer for traffic lights area */}
      <div style={{ height: TRAFFIC_LIGHTS_SPACER_PX, flexShrink: 0, padding: 0, margin: 0 }} />
      <div className="sidebar-header">
        <span className="sidebar-title">{t("viewOutline")}</span>
      </div>

      <div className="sidebar-content">
        <OutlineView />
      </div>

      <div className="sidebar-footer">
        <button
          className="sidebar-btn"
          onClick={() => useUIStore.getState().toggleSidebar()}
          title={t("closeSidebar")}
          aria-label={t("closeSidebar")}
          aria-expanded={true}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
