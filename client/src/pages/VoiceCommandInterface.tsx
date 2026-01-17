import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, Settings, Zap, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function VoiceCommandInterface() {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [language, setLanguage] = useState("en-US");
  const [transcript, setTranscript] = useState("");

  const commands = [
    { command: t('voiceCommands.showDashboard', 'Show dashboard'), description: t('voiceCommands.navigateToDashboard', 'Navigate to main dashboard'), category: t('voiceCommands.navigation', 'Navigation') },
    { command: t('voiceCommands.createJobCard', 'Create job card'), description: t('voiceCommands.openJobCardForm', 'Open new job card form'), category: t('voiceCommands.actions', 'Actions') },
    { command: t('voiceCommands.searchCustomerName', 'Search customer [name]'), description: t('voiceCommands.searchCustomerDesc', 'Search for a customer by name'), category: t('common.search', 'Search') },
    { command: t('voiceCommands.showAppointments', 'Show appointments'), description: t('voiceCommands.viewTodayAppointments', 'View today\'s appointments'), category: t('voiceCommands.navigation', 'Navigation') },
    { command: t('voiceCommands.addVehicle', 'Add vehicle'), description: t('voiceCommands.openAddVehicleDialog', 'Open add vehicle dialog'), category: t('voiceCommands.actions', 'Actions') },
    { command: t('voiceCommands.showReports', 'Show reports'), description: t('voiceCommands.navigateToReports', 'Navigate to reports page'), category: t('voiceCommands.navigation', 'Navigation') },
    { command: t('voiceCommands.help', 'Help'), description: t('voiceCommands.showVoiceHelp', 'Show voice command help'), category: t('voiceCommands.system', 'System') },
    { command: t('voiceCommands.readNotifications', 'Read notifications'), description: t('voiceCommands.readUnreadNotifications', 'Read out unread notifications'), category: t('voiceCommands.system', 'System') },
  ];

  const recentCommands = [
    { time: t('voiceCommands.twoMinAgo', '2 min ago'), command: t('voiceCommands.showDashboard', 'Show dashboard'), status: "success" },
    { time: t('voiceCommands.fiveMinAgo', '5 min ago'), command: t('voiceCommands.createJobCard', 'Create job card'), status: "success" },
    { time: t('voiceCommands.tenMinAgo', '10 min ago'), command: t('voiceCommands.searchCustomerJohn', 'Search customer John'), status: "success" },
    { time: t('voiceCommands.fifteenMinAgo', '15 min ago'), command: t('voiceCommands.showAppointments', 'Show appointments'), status: "failed" },
  ];

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTranscript(t('voiceCommands.listening', 'Listening...'));
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
      title={t('voiceCommands.interfaceTitle', 'Voice Command Interface')}
      description={t('voiceCommands.interfaceDescription', 'Control the system using voice commands')}
      icon={Mic}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('voiceCommands.voiceControl', 'Voice Control')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('voiceCommands.activateVoiceCommands', 'Activate and use voice commands')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-[#64748B]" />
                  <Label htmlFor="voice-enabled" className="text-[#0B1F3B] dark:text-white">{t('voiceCommands.enableVoiceCommands', 'Enable Voice Commands')}</Label>
                </div>
                <Switch
                  id="voice-enabled"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                  data-testid="switch-voice-enabled"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#0B1F3B] dark:text-white">{t('voiceCommands.language', 'Language')}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <SelectItem value="en-US">{t('voiceCommands.englishUS', 'English (US)')}</SelectItem>
                    <SelectItem value="en-GB">{t('voiceCommands.englishUK', 'English (UK)')}</SelectItem>
                    <SelectItem value="ar-SA">{t('voiceCommands.arabicSA', 'Arabic (Saudi Arabia)')}</SelectItem>
                    <SelectItem value="es-ES">{t('voiceCommands.spanish', 'Spanish')}</SelectItem>
                    <SelectItem value="fr-FR">{t('voiceCommands.french', 'French')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                <Button
                  size="lg"
                  variant={isListening ? "destructive" : "default"}
                  onClick={toggleListening}
                  disabled={!isEnabled}
                  className={`w-24 h-24 rounded-full ${isListening ? 'animate-pulse bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90'}`}
                  data-testid="button-mic"
                >
                  {isListening ? (
                    <MicOff className="w-12 h-12" />
                  ) : (
                    <Mic className="w-12 h-12" />
                  )}
                </Button>
                <p className="mt-4 text-lg font-medium text-[#0B1F3B] dark:text-white">
                  {isListening ? t('voiceCommands.listening', 'Listening...') : t('voiceCommands.clickToStart', 'Click to start')}
                </p>
                {transcript && (
                  <p className="mt-2 text-sm text-[#64748B]" data-testid="text-transcript">
                    {transcript}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Zap className="w-5 h-5 text-[#F97316]" />
                {t('voiceCommands.availableCommands', 'Available Commands')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">{t('voiceCommands.listOfCommands', 'List of supported voice commands')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commands.map((cmd, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`command-${index}`}
                  >
                    <div className="flex-1">
                      <p className="font-mono text-sm font-semibold text-[#0B1F3B] dark:text-white">
                        "{cmd.command}"
                      </p>
                      <p className="text-sm text-[#64748B]">{cmd.description}</p>
                    </div>
                    <Badge className="bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 text-[#0A5ED7] dark:text-[#0BB3FF] border-0">
                      {cmd.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Settings className="w-5 h-5 text-[#64748B]" />
                {t('common.settings', 'Settings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="continuous" className="text-[#0B1F3B] dark:text-white">{t('voiceCommands.continuousListening', 'Continuous Listening')}</Label>
                <Switch id="continuous" data-testid="switch-continuous" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="feedback" className="text-[#0B1F3B] dark:text-white">{t('voiceCommands.audioFeedback', 'Audio Feedback')}</Label>
                <Switch id="feedback" defaultChecked data-testid="switch-feedback" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="wakeword" className="text-[#0B1F3B] dark:text-white">{t('voiceCommands.wakeWordDetection', 'Wake Word Detection')}</Label>
                <Switch id="wakeword" data-testid="switch-wakeword" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('voiceCommands.recentCommands', 'Recent Commands')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('voiceCommands.commandHistory', 'Your command history')}</CardDescription>
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
                      <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                        {cmd.command}
                      </p>
                      <p className="text-xs text-[#64748B]">{cmd.time}</p>
                    </div>
                    <Badge className={`${getStatusColor(cmd.status)} border-0 capitalize`}>
                      {cmd.status === "success" ? t('common.success', 'success') : t('common.failed', 'failed')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('voiceCommands.quickTips', 'Quick Tips')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#64748B]">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#0A5ED7]" />
                  <span>{t('voiceCommands.tipSpeakClearly', 'Speak clearly and at a normal pace')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#0A5ED7]" />
                  <span>{t('voiceCommands.tipExactPhrases', 'Use exact command phrases')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#0A5ED7]" />
                  <span>{t('voiceCommands.tipSayHelp', 'Say "Help" for assistance')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#0A5ED7]" />
                  <span>{t('voiceCommands.tipReduceNoise', 'Reduce background noise')}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
