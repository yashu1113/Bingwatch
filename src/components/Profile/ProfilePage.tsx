import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ProfileSettings from './ProfileSettings';
import PlayerPreferences from './PlayerPreferences';
import { useWatchlist } from '../../contexts/WatchlistContext';
import { useContinueWatching } from '../../contexts/ContinueWatchingContext';
import { useLanguagePreference } from '../../contexts/LanguagePreferenceContext';
import { usePlayerSettings } from '../../contexts/PlayerSettingsContext';
import MediaCard from '../MediaCard';
import {
  User,
  Settings,
  Play,
  Heart,
  Clock,
  Globe,
  Tv,
  Film,
  ChevronRight
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { watchlist } = useWatchlist();
  const { continueWatching } = useContinueWatching();
  const { preferredLanguage } = useLanguagePreference();
  const { settings } = usePlayerSettings();

  // Recent activity calculations
  const recentlyWatched = continueWatching.slice(0, 6);
  const favorites = watchlist.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-background via-background/95 to-background">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-red-600" />
            <h1 className="text-4xl font-bold">My Profile</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage your preferences and viewing activity
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Profile Settings</TabsTrigger>
            <TabsTrigger value="player">Player Settings</TabsTrigger>
            <TabsTrigger value="activity">Viewing Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <Card>
                <CardContent className="p-6 text-center">
                  <Play className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold">{continueWatching.length}</div>
                  <p className="text-sm text-muted-foreground">Continue Watching</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold">{watchlist.length}</div>
                  <p className="text-sm text-muted-foreground">My List</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-lg font-bold">{preferredLanguage.toUpperCase()}</div>
                  <p className="text-sm text-muted-foreground">Preferred Language</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-lg font-bold capitalize">{settings.animationIntensity}</div>
                  <p className="text-sm text-muted-foreground">Animation Level</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Settings</CardTitle>
                  <CardDescription>
                    Commonly used settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Autoplay Next Episode</h4>
                          <p className="text-sm text-muted-foreground">
                            {settings.autoplayNextEpisode ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Video Preview on Hover</h4>
                          <p className="text-sm text-muted-foreground">
                            {settings.videoPreviewHover ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Default Quality</h4>
                          <p className="text-sm text-muted-foreground">{settings.defaultQuality.toUpperCase()}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Subtitle Size</h4>
                          <p className="text-sm text-muted-foreground capitalize">{settings.subtitleSize}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Continue Watching
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recentlyWatched.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {recentlyWatched.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                          >
                            <MediaCard
                              key={item.id}
                              id={item.id}
                              title={item.title || item.name || ''}
                              posterPath={item.poster_path || item.backdrop_path || ''}
                              mediaType={item.type || (item.title ? 'movie' : 'tv')}
                              voteAverage={item.vote_average}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recently watched content</p>
                        <p className="text-sm">Start watching to see your continue list</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      My List
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {favorites.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {favorites.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                          >
                            <MediaCard
                              key={item.id}
                              id={item.id}
                              title={item.title || item.name || ''}
                              posterPath={item.poster_path || item.backdrop_path || ''}
                              mediaType={item.type || (item.title ? 'movie' : 'tv')}
                              voteAverage={item.vote_average}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No favorites yet</p>
                        <p className="text-sm">Add content to your list to see it here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Profile Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <ProfileSettings />
            </motion.div>
          </TabsContent>

          {/* Player Settings Tab */}
          <TabsContent value="player">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <PlayerPreferences />
            </motion.div>
          </TabsContent>

          {/* Viewing Activity Tab */}
          <TabsContent value="activity" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Viewing Activity</CardTitle>
                  <CardDescription>
                    Your complete viewing history and activity statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {continueWatching.length > 0 ? (
                        continueWatching.map((item, index) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="w-16 h-24 bg-muted rounded-md flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.title || item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.type === 'movie' ? 'Movie' : 'TV Series'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Last watched: {new Date().toLocaleDateString()}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Film className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>No viewing activity yet</p>
                          <p className="text-sm">Start watching to build your viewing history</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;