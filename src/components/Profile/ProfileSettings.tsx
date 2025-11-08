import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { usePlayerSettings } from '../../contexts/PlayerSettingsContext';
import { useLanguagePreference } from '../../contexts/LanguagePreferenceContext';
import { useWatchlist } from '../../contexts/WatchlistContext';
import { useContinueWatching } from '../../contexts/ContinueWatchingContext';
import {
  User,
  Globe,
  Shield,
  Eye,
  Heart,
  Clock,
  Settings as SettingsIcon,
  Save,
  Camera
} from 'lucide-react';

const ProfileSettings: React.FC = () => {
  const { settings } = usePlayerSettings();
  const { preferredLanguage, setPreferredLanguage } = useLanguagePreference();
  const { watchlist } = useWatchlist();
  const { continueWatching } = useContinueWatching();

  // Profile state
  const [profileName, setProfileName] = useState('Profile 1');
  const [isEditingName, setIsEditingName] = useState(false);
  const [maturitySettings, setMaturitySettings] = useState({
    showMature: true,
    maxRating: 'R' // G, PG, PG-13, R, NC-17
  });

  const avatars = [
    '/api/placeholder/80/80?text=P1',
    '/api/placeholder/80/80?text=P2',
    '/api/placeholder/80/80?text=P3',
    '/api/placeholder/80/80?text=P4',
    '/api/placeholder/80/80?text=P5',
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  // Calculate viewing statistics
  const watchedCount = continueWatching.length;
  const favoriteCount = watchlist.length;
  const totalHours = Math.floor(watchedCount * 1.5); // Estimate

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your profile and viewing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedAvatar} alt="Profile Avatar" />
                  <AvatarFallback className="text-2xl bg-red-600 text-white">
                    {profileName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              {/* Avatar Selection */}
              <div className="flex flex-wrap gap-2 max-w-32">
                {avatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedAvatar === avatar
                        ? 'border-red-600 scale-110'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                      <AvatarFallback className="text-xs bg-gray-600">
                        {index + 1}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              {/* Name Section */}
              <div className="space-y-2">
                <Label htmlFor="profile-name">Profile Name</Label>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <>
                      <Input
                        id="profile-name"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button
                        size="sm"
                        onClick={() => setIsEditingName(false)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-semibold">{profileName}</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingName(true)}
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Viewing Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{watchedCount}</p>
                    <p className="text-sm text-muted-foreground">Watched</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{favoriteCount}</p>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{totalHours}h</p>
                    <p className="text-sm text-muted-foreground">Total Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content Preferences</TabsTrigger>
          <TabsTrigger value="language">Language</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Maturity</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Content Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="genre-preferences">Favorite Genres</Label>
                <div className="flex flex-wrap gap-2">
                  {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance'].map((genre) => (
                    <Badge key={genre} variant="outline" className="cursor-pointer hover:bg-red-600 hover:text-white">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferred-language">Preferred Audio Language</Label>
                <Select
                  value={preferredLanguage}
                  onValueChange={setPreferredLanguage}
                >
                  <SelectTrigger id="preferred-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                    <SelectItem value="ml">Malayalam</SelectItem>
                    <SelectItem value="bn">Bengali</SelectItem>
                    <SelectItem value="mr">Marathi</SelectItem>
                    <SelectItem value="gu">Gujarati</SelectItem>
                    <SelectItem value="pa">Punjabi</SelectItem>
                    <SelectItem value="kn">Kannada</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Content will play in this language when available. If not available, it will fall back to the original audio.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Maturity Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-mature">Show mature content</Label>
                  <p className="text-sm text-muted-foreground">
                    Include R-rated and TV-MA content in recommendations
                  </p>
                </div>
                <Switch
                  id="show-mature"
                  checked={maturitySettings.showMature}
                  onCheckedChange={(checked) =>
                    setMaturitySettings(prev => ({ ...prev, showMature: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-rating">Maximum content rating</Label>
                <Select
                  value={maturitySettings.maxRating}
                  onValueChange={(value: string) =>
                    setMaturitySettings(prev => ({ ...prev, maxRating: value }))
                  }
                >
                  <SelectTrigger id="max-rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="G">G - All ages</SelectItem>
                    <SelectItem value="PG">PG - Parental guidance</SelectItem>
                    <SelectItem value="PG-13">PG-13 - Teens</SelectItem>
                    <SelectItem value="R">R - Adults</SelectItem>
                    <SelectItem value="NC-17">NC-17 - Adults only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;