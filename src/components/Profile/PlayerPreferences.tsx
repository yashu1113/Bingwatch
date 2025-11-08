import React from 'react';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { usePlayerSettings } from '../../contexts/PlayerSettingsContext';
import { Settings, RotateCcw } from 'lucide-react';

const PlayerPreferences: React.FC = () => {
  const { settings, updateSetting, resetToDefaults } = usePlayerSettings();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Player Preferences</CardTitle>
        </div>
        <CardDescription>
          Customize your video playback experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Autoplay Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Playback Behavior</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoplay-next">Autoplay next episode</Label>
              <p className="text-sm text-muted-foreground">
                Automatically play the next episode in TV series
              </p>
            </div>
            <Switch
              id="autoplay-next"
              checked={settings.autoplayNextEpisode}
              onCheckedChange={(checked) => updateSetting('autoplayNextEpisode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-skip-intro">Show "Skip Intro" button</Label>
              <p className="text-sm text-muted-foreground">
                Display skip intro and recap buttons when available
              </p>
            </div>
            <Switch
              id="show-skip-intro"
              checked={settings.showSkipIntro}
              onCheckedChange={(checked) => updateSetting('showSkipIntro', checked)}
            />
          </div>
        </div>

        {/* Quality Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Video Quality</h3>

          <div className="space-y-2">
            <Label htmlFor="default-quality">Default playback quality</Label>
            <Select
              value={settings.defaultQuality}
              onValueChange={(value: PlayerSettings['defaultQuality']) =>
                updateSetting('defaultQuality', value)
              }
            >
              <SelectTrigger id="default-quality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Recommended)</SelectItem>
                <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                <SelectItem value="720p">720p (HD)</SelectItem>
                <SelectItem value="480p">480p (SD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subtitle Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Subtitle Appearance</h3>

          <div className="space-y-2">
            <Label htmlFor="subtitle-size">Subtitle size</Label>
            <Select
              value={settings.subtitleSize}
              onValueChange={(value: PlayerSettings['subtitleSize']) =>
                updateSetting('subtitleSize', value)
              }
            >
              <SelectTrigger id="subtitle-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="subtitle-background">Subtitle background</Label>
              <p className="text-sm text-muted-foreground">
                Add dark background behind subtitles for better readability
              </p>
            </div>
            <Switch
              id="subtitle-background"
              checked={settings.subtitleBackground}
              onCheckedChange={(checked) => updateSetting('subtitleBackground', checked)}
            />
          </div>
        </div>

        {/* UI Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Interface Preferences</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="video-preview-hover">Video preview on hover</Label>
              <p className="text-sm text-muted-foreground">
                Show muted video previews when hovering over movie cards
              </p>
            </div>
            <Switch
              id="video-preview-hover"
              checked={settings.videoPreviewHover}
              onCheckedChange={(checked) => updateSetting('videoPreviewHover', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="animation-intensity">Animation intensity</Label>
            <Select
              value={settings.animationIntensity}
              onValueChange={(value: PlayerSettings['animationIntensity']) =>
                updateSetting('animationIntensity', value)
              }
            >
              <SelectTrigger id="animation-intensity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full animations</SelectItem>
                <SelectItem value="reduced">Reduced motion</SelectItem>
                <SelectItem value="minimal">Minimal animations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerPreferences;