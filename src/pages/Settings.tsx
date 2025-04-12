
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings as SettingsIcon, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Settings = () => {
  const { isAdmin } = useAuth();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully");
  };

  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-2 text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your application settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" defaultValue="Laminate Masters" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                type="number"
                id="lowStockThreshold"
                defaultValue="2"
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Items with stock levels at or below this value will trigger a low
                stock alert.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="notifications" defaultChecked />
              <Label htmlFor="notifications">
                Enable email notifications for low stock
              </Label>
            </div>

            <div className="pt-4">
              <Button type="submit">
                <SettingsIcon className="mr-1 h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Export Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultExportFormat">Default Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportDateFormat">Export Date Format</Label>
              <Select defaultValue="mdy">
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="includeHeaders" defaultChecked />
              <Label htmlFor="includeHeaders">
                Include column headers in exports
              </Label>
            </div>

            <div className="pt-4">
              <Button>Save Export Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Backup & Restore</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Backup your inventory and transaction data for safekeeping, or
              restore from a previous backup.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button onClick={() => toast.success("Backup initiated")}>
                Export Backup
              </Button>
              <Button variant="outline">Import Data</Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Data Reset</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action will permanently delete all inventory and transaction
              data. Use with extreme caution.
            </p>
            <Button
              variant="destructive"
              onClick={() => toast.error("This would permanently delete all data!")}
            >
              Reset All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
