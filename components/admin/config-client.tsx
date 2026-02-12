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
  CreditCard,
  Send,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Palette,
  Upload,
  Infinity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  saveIntegrationKeys,
  saveAppSettings,
} from "@/lib/admin/actions";
import type { AppConfig } from "@/lib/app-config";

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

interface IntegrationStatus {
  configured: boolean;
  message: string;
  keys: Record<string, string>;
}

interface ConfigClientProps {
  settings: Setting[];
  waitlist: WaitlistEntry[];
  waitlistTotal: number;
  integrations: {
    stripe: IntegrationStatus;
    resend: IntegrationStatus;
  };
  appConfig: AppConfig;
}

export function ConfigClient({
  settings,
  waitlist,
  waitlistTotal,
  integrations,
  appConfig,
}: ConfigClientProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [restartNeeded, setRestartNeeded] = useState(false);

  // Application settings state
  const [appName, setAppName] = useState(appConfig.name);
  const [appTagline, setAppTagline] = useState(appConfig.tagline);
  const [appDescription, setAppDescription] = useState(appConfig.description);
  const [logoUrl, setLogoUrl] = useState<string | null>(appConfig.logoUrl);
  const [logoUploading, setLogoUploading] = useState(false);

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

  // ── Save Application Settings ────────
  async function handleSaveAppSettings() {
    setLoading("app-settings");
    const formData = new FormData();
    formData.set("name", appName);
    formData.set("tagline", appTagline);
    formData.set("description", appDescription);

    const result = await saveAppSettings(formData);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: result.success, variant: "success" });
    }
    setLoading(null);
  }

  // ── Upload Logo ─────────────────────
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);

    const formData = new FormData();
    formData.set("logo", file);

    try {
      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLogoUrl(data.url);
      toast({ title: "Uploaded", description: "Logo uploaded successfully.", variant: "success" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLogoUploading(false);
  }

  // ── Save Integration Keys ─────────────
  async function handleSaveIntegration(service: string, formData: FormData) {
    setLoading(service);
    const result = await saveIntegrationKeys(formData);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: result.success, variant: "success" });
      setRestartNeeded(true);
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

      {/* ── Application Settings ─────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Logo, name, and description. Changes apply across the entire app.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg border flex items-center justify-center bg-muted/50 overflow-hidden shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <Infinity className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors">
                    {logoUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {logoUploading ? "Uploading..." : "Upload Logo"}
                  </div>
                </Label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={logoUploading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPEG, WebP, or SVG. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* App Name */}
          <div className="space-y-1.5">
            <Label htmlFor="app-name">App Name</Label>
            <Input
              id="app-name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="My SaaS App"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <Label htmlFor="app-tagline">Tagline</Label>
            <Input
              id="app-tagline"
              value={appTagline}
              onChange={(e) => setAppTagline(e.target.value)}
              placeholder="Build something amazing"
            />
            <p className="text-xs text-muted-foreground">
              Displayed in the hero section of the landing page.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="app-description">Description</Label>
            <Textarea
              id="app-description"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="A brief description of your application..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Used for SEO meta description, footer, and hero section.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveAppSettings}
              disabled={loading === "app-settings"}
            >
              {loading === "app-settings" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {/* ── Integrations ─────────────────── */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Integrations</h3>

        {restartNeeded && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Restart required
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Stop the dev server (Ctrl+C) and run <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">npm run dev</code> to apply the new keys.
              </p>
            </div>
          </div>
        )}

        {/* Stripe */}
        <IntegrationCard
          title="Stripe"
          description="Payment processing for subscriptions and one-time charges."
          icon={CreditCard}
          configured={integrations.stripe.configured}
          statusMessage={integrations.stripe.message}
          loading={loading === "stripe"}
          onSave={(fd) => handleSaveIntegration("stripe", fd)}
          fields={[
            {
              key: "STRIPE_SECRET_KEY",
              label: "Secret Key",
              placeholder: "sk_test_...",
              masked: integrations.stripe.keys.STRIPE_SECRET_KEY,
              type: "password",
            },
            {
              key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
              label: "Publishable Key",
              placeholder: "pk_test_...",
              masked: integrations.stripe.keys.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
              type: "text",
            },
            {
              key: "STRIPE_WEBHOOK_SECRET",
              label: "Webhook Secret",
              placeholder: "whsec_...",
              masked: integrations.stripe.keys.STRIPE_WEBHOOK_SECRET,
              type: "password",
            },
          ]}
        />

        {/* Resend */}
        <IntegrationCard
          title="Resend"
          description="Transactional emails for verification, welcome, and billing."
          icon={Send}
          configured={integrations.resend.configured}
          statusMessage={integrations.resend.message}
          loading={loading === "resend"}
          onSave={(fd) => handleSaveIntegration("resend", fd)}
          fields={[
            {
              key: "RESEND_API_KEY",
              label: "API Key",
              placeholder: "re_...",
              masked: integrations.resend.keys.RESEND_API_KEY,
              type: "password",
            },
            {
              key: "RESEND_FROM_EMAIL",
              label: "From Email",
              placeholder: "noreply@yourdomain.com",
              masked: integrations.resend.keys.RESEND_FROM_EMAIL,
              type: "email",
            },
          ]}
        />
      </div>

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

/**
 * Integration card with status badge, key fields, and save button.
 */
interface IntegrationField {
  key: string;
  label: string;
  placeholder: string;
  masked: string;
  type: string;
}

function IntegrationCard({
  title,
  description,
  icon: Icon,
  configured,
  statusMessage,
  loading,
  onSave,
  fields,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  configured: boolean;
  statusMessage: string;
  loading: boolean;
  onSave: (formData: FormData) => void;
  fields: IntegrationField[];
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Only include fields that have actual values (not empty)
    const filtered = new FormData();
    for (const field of fields) {
      const val = formData.get(field.key) as string;
      if (val) filtered.set(field.key, val);
    }
    let hasEntries = false;
    filtered.forEach(() => { hasEntries = true; });
    if (!hasEntries) return;
    onSave(filtered);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <Badge variant={configured ? "success" : "warning"} className="shrink-0">
            {configured ? (
              <><CheckCircle className="mr-1 h-3 w-3" /> Connected</>
            ) : (
              <><XCircle className="mr-1 h-3 w-3" /> Not configured</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key} className="text-xs">
                {field.label}
                {field.masked && (
                  <span className="ml-2 font-mono text-muted-foreground">
                    ({field.masked})
                  </span>
                )}
              </Label>
              <Input
                id={field.key}
                name={field.key}
                type={field.type}
                placeholder={field.placeholder}
                className="text-sm font-mono"
                autoComplete="off"
              />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save {title} Keys
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
