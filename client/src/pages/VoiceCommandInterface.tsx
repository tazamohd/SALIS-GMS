import { useState } from "react";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Settings, Zap, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VoiceCommandInterface() {
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [language, setLanguage] = useState("en-US");
  const [transcript, setTranscript] = useState("");

  const commands = [
    { command: "Show dashboard", description: "Navigate to main dashboard", category: "Navigation" },
    { command: "Create job card", description: "Open new job card form", category: "Actions" },
    { command: "Search customer [name]", description: "Search for a customer by name", category: "Search" },
    { command: "Show appointments", description: "View today's appointments", category: "Navigation" },
    { command: "Add vehicle", description: "Open add vehicle dialog", category: "Actions" },
    { command: "Show reports", description: "Navigate to reports page", category: "Navigation" },
    { command: "Help", description: "Show voice command help", category: "System" },
    { command: "Read notifications", description: "Read out unread notifications", category: "System" },
  ];

  const recentCommands = [
    { time: "2 min ago", command: "Show dashboard", status: "success" },
    { time: "5 min ago", command: "Create job card", status: "success" },
    { time: "10 min ago", command: "Search customer John", status: "success" },
    { time: "15 min ago", command: "Show appointments", status: "failed" },
  ];

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTranscript("Listening...");
    } else {
      setTranscript("");
    }
  };

  const getStatusColor = (status: string) => {
    return status === "success" 
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  };

  return (
    <StandardPageLayout
      title="Voice Command Interface"
      description="Control the system using voice commands"
      icon={Mic}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voice Control Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice Control</CardTitle>
              <CardDescription>Activate and use voice commands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <Label htmlFor="voice-enabled">Enable Voice Commands</Label>
                </div>
                <Switch
                  id="voice-enabled"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                  data-testid="switch-voice-enabled"
                />
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="ar-SA">Arabic (Saudi Arabia)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Button
                  size="lg"
                  variant={isListening ? "destructive" : "default"}
                  onClick={toggleListening}
                  disabled={!isEnabled}
                  className={`w-24 h-24 rounded-full ${isListening ? 'animate-pulse' : ''}`}
                  data-testid="button-mic"
                >
                  {isListening ? (
                    <MicOff className="w-12 h-12" />
                  ) : (
                    <Mic className="w-12 h-12" />
                  )}
                </Button>
                <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  {isListening ? "Listening..." : "Click to start"}
                </p>
                {transcript && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400" data-testid="text-transcript">
                    {transcript}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Available Commands
              </CardTitle>
              <CardDescription>List of supported voice commands</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commands.map((cmd, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    data-testid={`command-${index}`}
                  >
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                        "{cmd.command}"
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{cmd.description}</p>
                    </div>
                    <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-0">
                      {cmd.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="continuous">Continuous Listening</Label>
                <Switch id="continuous" data-testid="switch-continuous" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="feedback">Audio Feedback</Label>
                <Switch id="feedback" defaultChecked data-testid="switch-feedback" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="wakeword">Wake Word Detection</Label>
                <Switch id="wakeword" data-testid="switch-wakeword" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Commands */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Commands</CardTitle>
              <CardDescription>Your command history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCommands.map((cmd, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between"
                    data-testid={`recent-${index}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {cmd.command}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{cmd.time}</p>
                    </div>
                    <Badge className={`${getStatusColor(cmd.status)} border-0 capitalize`}>
                      {cmd.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Speak clearly and at a normal pace</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Use exact command phrases</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Say "Help" for assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Reduce background noise</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
