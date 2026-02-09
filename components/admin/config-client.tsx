/**
 * Admin Config Client Component
 * ──────────────────────────────
 * Interactive settings editor, feature flag toggles,
 * and waitlist management table.
 */

"use client";

import { useState } from "react";
import {
  Settings,
  ToggleLeft,
  Mail,
  Loader2,
  Trash2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import {
  updateAppSetting,
  toggleFeatureFlag,
  deleteWaitlistEntry,
} from "@/lib/admin/actions";

interface Setting {
  id: string;
  key: string;
  value: any;
  description: string | null;
}

interface WaitlistEntry {
  id: string;
  email: string;
  source: string | null;
  createdAt: string;
}

interface ConfigClientProps {
  settings: Setting[];
  waitlist: WaitlistEntry[];
  waitlistTotal: number;
}

export function ConfigClient({
  settings,
  waitlist,
  waitlistTotal,
}: ConfigClientProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Separate feature flags from other settings
  const featureFlags = settings.filter((s) => s.key.startsWith("feature."));
  const siteSettings = settings.filter((s) => s.key.startsWith("site."));

  // ── Save Setting ─────────────────────────
  async function handleSaveSetting(key: string, value: string) {
    setLoading(key);
    const formData = new FormData();
    formData.set("key", key);
    formData.set("value", JSON.stringify(value));

    const result = await updateAppSetting(formData);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: result.success, variant: "success" });
    }
    setLoading(null);
  }

  // ── Toggle Feature ───────────────────────
  async function handleToggleFeature(key: string, currentValue: any) {
    setLoading(key);
    const formData = new FormData();
    formData.set("key", key);
    formData.set("enabled", String(currentValue === true));

    const result = await toggleFeatureFlag(formData);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: result.success, variant: "success" });
    }
    setLoading(null);
  }

  // ── Delete Waitlist Entry ────────────────
  async function handleDeleteWaitlist(id: string) {
    setLoading(id);
    const formData = new FormData();
    formData.set("id", id);

    const result = await deleteWaitlistEntry(formData);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Removed", description: result.success });
    }
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">App Configuration</h2>
        <p className="text-muted-foreground">
          Changes take effect immediately. No redeployment needed.
        </p>
      </div>

      {/* ── Site Settings ─────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Branding and SEO configuration.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {siteSettings.map((setting) => (
            <SettingRow
              key={setting.key}
              setting={setting}
              loading={loading === setting.key}
              onSave={handleSaveSetting}
            />
          ))}
          {siteSettings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No site settings configured. Run the seed script to create defaults.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Feature Flags ─────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Toggle features on or off without code changes.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {featureFlags.map((flag) => {
            const isEnabled = flag.value === true;
            return (
              <div
                key={flag.key}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="font-medium text-sm">{flag.key}</p>
                  {flag.description && (
                    <p className="text-xs text-muted-foreground">
                      {flag.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isEnabled ? "success" : "secondary"}>
                    {isEnabled ? "ON" : "OFF"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading === flag.key}
                    onClick={() => handleToggleFeature(flag.key, flag.value)}
                  >
                    {loading === flag.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isEnabled ? (
                      "Disable"
                    ) : (
                      "Enable"
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
          {featureFlags.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No feature flags configured.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Waitlist ──────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Waitlist</CardTitle>
              <CardDescription>
                {waitlistTotal} email{waitlistTotal !== 1 ? "s" : ""} collected
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {waitlist.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No waitlist signups yet. Enable the waitlist feature flag and add
              a waitlist form to your landing page.
            </p>
          ) : (
            <div className="space-y-2">
              {waitlist.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{entry.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.source || "Direct"} &middot;{" "}
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    disabled={loading === entry.id}
                    onClick={() => handleDeleteWaitlist(entry.id)}
                  >
                    {loading === entry.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Individual setting row with inline edit + save.
 */
function SettingRow({
  setting,
  loading,
  onSave,
}: {
  setting: Setting;
  loading: boolean;
  onSave: (key: string, value: string) => void;
}) {
  // Parse the stored value to display as string
  const displayValue =
    typeof setting.value === "string"
      ? setting.value
      : JSON.stringify(setting.value);

  const [value, setValue] = useState(displayValue);
  const hasChanged = value !== displayValue;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground font-mono">
          {setting.key}
        </Label>
        {setting.description && (
          <span className="text-xs text-muted-foreground">
            {setting.description}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="text-sm"
        />
        <Button
          variant={hasChanged ? "default" : "outline"}
          size="sm"
          disabled={!hasChanged || loading}
          onClick={() => onSave(setting.key, value)}
          className="shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
