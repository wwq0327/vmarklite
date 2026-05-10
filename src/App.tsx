import { Component, lazy, Suspense, type ReactNode } from "react";
import { useTranslation, withTranslation, type WithTranslation } from "react-i18next";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { CheckCircle, XCircle, Info, AlertTriangle, Loader2 } from "lucide-react";
import { Editor } from "@/components/Editor";
import { Sidebar } from "@/components/Sidebar";
import { StatusBar } from "@/components/StatusBar";
import { TitleBar } from "@/components/TitleBar";

// Lazy-load page routes so non-document windows don't evaluate stores they don't need.
const SettingsPage = lazy(() => import("@/pages/Settings").then(m => ({ default: m.SettingsPage })));
import { WindowProvider, useIsDocumentWindow, useWindowLabel } from "@/contexts/WindowContext";
import { appError } from "@/utils/debug";

// Error Boundary to catch and display React errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<
  { children: ReactNode } & WithTranslation<"dialog">,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    appError("Caught error:", error);
    appError("Error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ color: "#dc2626", marginBottom: 16 }}>{t("errorBoundary.title")}</h1>
          <pre style={{
            padding: 16,
            background: "#fef2f2",
            borderRadius: 8,
            overflow: "auto",
            fontSize: 14,
          }}>
            {this.state.error?.message}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const ErrorBoundary = withTranslation("dialog")(ErrorBoundaryInner);
import { useUIStore } from "@/stores/uiStore";
import { useMenuEvents } from "@/hooks/useMenuEvents";
import { useViewMenuEvents } from "@/hooks/useViewMenuEvents";
import { useRecentFilesMenuEvents } from "@/hooks/useRecentFilesMenuEvents";
import { useExportMenuEvents } from "@/hooks/useExportMenuEvents";
import { useWorkspaceMenuEvents } from "@/hooks/useWorkspaceMenuEvents";
import { useWorkspaceBootstrap } from "@/hooks/useWorkspaceBootstrap";
import { useFileOperations } from "@/hooks/useFileOperations";
import { useTheme } from "@/hooks/useTheme";
import { useSettingsSync } from "@/hooks/useSettingsSync";
import { useConfirmQuitSync } from "@/hooks/useConfirmQuitSync";
import { useRecentFilesSync } from "@/hooks/useRecentFilesSync";
import { useRecentWorkspacesSync } from "@/hooks/useRecentWorkspacesSync";
import { useRecentWorkspacesMenuEvents } from "@/hooks/useRecentWorkspacesMenuEvents";
import { useWindowClose } from "@/hooks/useWindowClose";
import { useWindowTitle } from "@/hooks/useWindowTitle";
import { useViewShortcuts } from "@/hooks/useViewShortcuts";
import { useTabShortcuts } from "@/hooks/useTabShortcuts";
import { useReloadGuard } from "@/hooks/useReloadGuard";
import { useDragDropOpen } from "@/hooks/useDragDropOpen";
import { useExternalFileChanges } from "@/hooks/useExternalFileChanges";
import { useWindowFileWatcher } from "@/hooks/useWindowFileWatcher";
import { useSidebarResize } from "@/hooks/useSidebarResize";
import { useFormatSettingsBridge } from "@/utils/formatSettingsBridge";
import { useUpdateChecker } from "@/hooks/useUpdateChecker";
import { useUpdateBroadcast } from "@/hooks/useUpdateSync";
import { useFinderFileOpen } from "@/hooks/useFinderFileOpen";
import { useHotExitCapture } from "@/utils/hotExit/useHotExitCapture";
import { useHotExitRestore } from "@/utils/hotExit/useHotExitRestore";
import { useHotExitStartup } from "@/utils/hotExit/useHotExitStartup";
import { useCrashRecoveryWriter } from "@/hooks/useCrashRecoveryWriter";
import { useCrashRecoveryStartup } from "@/hooks/useCrashRecoveryStartup";
import { useCrashRecoveryCleanup } from "@/hooks/useCrashRecoveryCleanup";

/** Height of the title bar area in pixels */
const TITLEBAR_HEIGHT = 40;

// Separate component for window lifecycle hooks to avoid conditional hook calls
function DocumentWindowHooks() {
  useWindowClose();
  useWindowTitle();
  useDragDropOpen(); // Open dropped markdown files
  useWindowFileWatcher(); // Start file watcher for this window
  useExternalFileChanges(); // Handle external file changes (auto-reload or prompt)
  useHotExitCapture(); // Respond to hot exit capture requests
  useHotExitRestore(); // Handle hot exit restore on restart
  useCrashRecoveryWriter(); // Periodically snapshot dirty docs for crash recovery
  useCrashRecoveryCleanup(); // Clean up recovery files on save/close/exit
  useFormatSettingsBridge(); // Re-bootstrap registry on format-toggle change
  return null;
}

// Main window specific hooks (only for "main" window, not doc-*)
function MainWindowHooks() {
  useUpdateChecker(); // Check for updates on startup
  useUpdateBroadcast(); // Broadcast update state to other windows
  useHotExitStartup(); // Check for saved session and restore if present (MUST run before Finder)
  useCrashRecoveryStartup(); // Restore docs from crash recovery (waits for hot exit)
  useFinderFileOpen(); // Handle files opened from Finder (waits for hot exit to complete)
  return null;
}

function MainLayout() {
  const { t } = useTranslation();
  const sidebarVisible = useUIStore((state) => state.sidebarVisible);
  const sidebarWidth = useUIStore((state) => state.sidebarWidth);
  const isDocumentWindow = useIsDocumentWindow();
  const windowLabel = useWindowLabel();
  const handleResizeStart = useSidebarResize();
  const sidebarOffset = sidebarVisible ? `${sidebarWidth}px` : "0px";

  // Initialize hooks
  useWorkspaceBootstrap(); // Load config from disk on startup (must be first)
  useMenuEvents();
  useViewMenuEvents();
  useRecentFilesMenuEvents();
  useExportMenuEvents();
  useWorkspaceMenuEvents();
  useFileOperations();
  useSettingsSync(); // Sync settings across windows
  useConfirmQuitSync(); // Push confirmQuit setting to Rust
  useTheme();
  useRecentFilesSync(); // Sync recent files to native menu
  useRecentWorkspacesSync(); // Sync recent workspaces to native menu
  useRecentWorkspacesMenuEvents(); // Handle recent workspace menu events
  useViewShortcuts(); // View shortcuts
  useTabShortcuts(); // Cmd+T, Cmd+W tab shortcuts
  useReloadGuard(); // Prevent reload when dirty

  return (
    <div
      className="app-layout"
      style={{
        display: "flex",
        height: "100vh",
        overflow: "clip",
        position: "relative",
        backgroundColor: "var(--bg-color)",
        ["--sidebar-offset" as string]: sidebarOffset,
      }}
    >
      {/* Window lifecycle hooks for document windows */}
      {isDocumentWindow && <DocumentWindowHooks />}
      {/* Main window specific hooks */}
      {windowLabel === "main" && <MainWindowHooks />}

      {/* Title bar with drag region and filename display */}
      <TitleBar />

      {sidebarVisible && (
        <aside
          aria-label={t("aria.sidebar")}
          style={{
            width: sidebarWidth,
            minWidth: sidebarWidth,
            height: "100%",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <Sidebar />
          {/* Resize handle - positioned at right edge of sidebar */}
          <div
            className="sidebar-resize-handle"
            onMouseDown={handleResizeStart}
          />
        </aside>
      )}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "clip",
          minWidth: 0,
        }}
      >
        {/* Spacer for title bar area */}
        <div style={{ height: TITLEBAR_HEIGHT, flexShrink: 0 }} />
        {/* Editor column */}
        <div role="main" aria-label={t("aria.mainContent")} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }}>
          {/* Editor area */}
          <div style={{ flex: 1, minHeight: 0, minWidth: 0 }}>
            <Editor />
          </div>
          {/* Status bar */}
          <StatusBar />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WindowProvider>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/settings" element={<Suspense fallback={null}><SettingsPage /></Suspense>} />
        </Routes>
        <Toaster
          position="top-center"
          closeButton
          icons={{
            success: <CheckCircle size={16} />,
            error: <XCircle size={16} />,
            info: <Info size={16} />,
            warning: <AlertTriangle size={16} />,
            loading: <Loader2 size={16} className="animate-spin" />,
          }}
        />
      </WindowProvider>
    </ErrorBoundary>
  );
}

export default App;
