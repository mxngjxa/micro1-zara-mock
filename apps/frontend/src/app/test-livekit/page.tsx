'use client';

import { useState } from 'react';
import { LiveKitRoom } from '@livekit/components-react';
import { Mic, Phone, PhoneOff } from 'lucide-react';
import { LiveKitService } from '@/lib/livekit.service';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import '@livekit/components-styles';

/**
 * Render a client-side UI for testing a LiveKit audio connection by entering a room name and connecting to an audio-only LiveKit room.
 *
 * Displays a form to enter a room name and a connect button; when connected it shows connection status, a disconnect action, and embeds a LiveKitRoom configured for audio-only mode. The connect action obtains an access token and server URL from the LiveKit service and updates the component state; the disconnect action clears that state.
 *
 * @returns A React element containing the LiveKit connection test interface.
 */
function LiveKitTestContent() {
  const [roomName, setRoomName] = useState('');
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!roomName) {
      setError('Please enter a room name');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { token: livekitToken, url } = await LiveKitService.getToken(roomName);
      setToken(livekitToken);
      setServerUrl(url);
      setConnected(true);
    } catch (err: any) {
      setError(`Failed to connect: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setToken('');
    setServerUrl('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Mic className="h-6 w-6" />
                LiveKit Connection Test
              </CardTitle>
              <CardDescription className="mt-2">
                Test your LiveKit voice connection before starting interviews
              </CardDescription>
            </div>
            {connected && (
              <Badge variant="default" className="gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!connected ? (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => {
                    setRoomName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="test-room-123"
                />
                <p className="text-xs text-muted-foreground">
                  Enter any room name to test your connection
                </p>
              </div>

              <Button
                onClick={handleConnect}
                disabled={loading}
                className="w-full gap-2"
                size="lg"
              >
                {loading ? (
                  <>Connecting...</>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Connect to Room
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-900">Connected to: {roomName}</p>
                  <p className="text-sm text-green-700">Audio connection active</p>
                </div>
                <Button 
                  onClick={handleDisconnect} 
                  variant="outline"
                  className="gap-2"
                >
                  <PhoneOff className="h-4 w-4" />
                  Disconnect
                </Button>
              </div>

              <LiveKitRoom
                token={token}
                serverUrl={serverUrl}
                connect={true}
                audio={true}
                video={false}
                className="rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-center h-64 bg-slate-100 rounded-md">
                  <div className="text-center">
                    <Mic className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-lg font-medium">LiveKit Room Connected</p>
                    <p className="text-sm text-muted-foreground">Audio Only Mode</p>
                  </div>
                </div>
              </LiveKitRoom>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Renders the LiveKit connection tester UI within an authenticated page.
 *
 * @returns A React element containing the LiveKit test UI wrapped with route protection.
 */
export default function LiveKitTestPage() {
  return (
    <ProtectedRoute>
      <LiveKitTestContent />
    </ProtectedRoute>
  );
}