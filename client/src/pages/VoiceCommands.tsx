import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TabsPageLayout, type TabConfig } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Activity, CheckCircle, XCircle } from "lucide-react";
import type { VoiceCommand } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VoiceCommands() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const { data: commands, isLoading } = useQuery<VoiceCommand[]>({
    queryKey: ["/api/voice-commands"],
  });

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: t('voiceCommands.notSupported', 'Not Supported'),
        description: t('voiceCommands.browserNotSupported', 'Voice commands are not supported in this browser. Please use Chrome or Edge.'),
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: t('voiceCommands.listening', 'Listening...'),
        description: t('voiceCommands.recognitionStarted', 'Voice command recognition started'),
      });
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);
      
      if (final) {
        setTranscript(final);
        processCommand(final);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast({
        title: t('voiceCommands.recognitionError', 'Recognition Error'),
        description: `${t('common.error', 'Error')}: ${event.error}`,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast, t]);

  const processCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    try {
      const result: any = await apiRequest("/api/voice-commands/process", "POST", {
        command: lowerCommand,
        rawTranscript: command,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/voice-commands"] });

      if (result.actionExecuted) {
        toast({
          title: t('voiceCommands.commandExecuted', 'Command Executed'),
          description: result.message || `${t('voiceCommands.executed', 'Executed')}: ${result.actionExecuted}`,
        });

        if (result.intent === 'navigate' && result.path) {
          window.location.href = result.path;
        }
      } else {
        toast({
          title: t('voiceCommands.commandNotRecognized', 'Command Not Recognized'),
          description: t('voiceCommands.tryDifferentCommand', 'Please try a different command.'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing command:', error);
      toast({
        title: t('voiceCommands.processingError', 'Processing Error'),
        description: t('voiceCommands.failedToProcess', 'Failed to process voice command.'),
        variant: "destructive",
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setInterimTranscript("");
      recognitionRef.current?.start();
    }
  };

  const stats = {
    total: commands?.length || 0,
    successful: commands?.filter((c) => c.success === true).length || 0,
    failed: commands?.filter((c) => c.success === false).length || 0,
    recognized: commands?.filter((c) => c.confidence && parseFloat(String(c.confidence)) > 50).length || 0,
  };

  const recentCommands = commands?.slice(0, 10) || [];

  const voiceControlContent = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{t('voiceCommands.voiceControl', 'Voice Control')}</CardTitle>
        <CardDescription>
          {t('voiceCommands.clickMicToStart', 'Click the microphone to start voice commands. Try saying "Open job cards" or "Create new appointment"')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Button
            onClick={toggleListening}
            className={`h-32 w-32 rounded-full ${
              isListening
                ? "bg-red-600 hover:bg-red-700 animate-pulse"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white shadow-lg transition-all`}
            data-testid="button-toggle-listening"
          >
            {isListening ? (
              <MicOff className="h-16 w-16" />
            ) : (
              <Mic className="h-16 w-16" />
            )}
          </Button>
          <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {isListening ? t('voiceCommands.listening', 'Listening...') : t('voiceCommands.clickToStart', 'Click to Start')}
          </p>
        </div>

        {(transcript || interimTranscript) && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('voiceCommands.transcript', 'Transcript')}:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md min-h-[100px]">
              <p className="text-gray-900 dark:text-white">
                {transcript}
                {interimTranscript && (
                  <span className="text-gray-500 dark:text-gray-400 italic">
                    {' '}{interimTranscript}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('voiceCommands.exampleCommands', 'Example Commands')}:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              t('voiceCommands.openJobCards', 'Open job cards'),
              t('voiceCommands.createNewAppointment', 'Create new appointment'),
              t('voiceCommands.showCustomers', 'Show customers'),
              t('voiceCommands.viewInventory', 'View inventory'),
              t('voiceCommands.openSettings', 'Open settings'),
              t('voiceCommands.showReports', 'Show reports'),
              t('voiceCommands.createInvoice', 'Create invoice'),
              t('voiceCommands.searchParts', 'Search parts'),
            ].map((cmd, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-gray-600 dark:text-gray-400 justify-start"
              >
                <Mic className="h-3 w-3 mr-2" />
                "{cmd}"
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const statsContent = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('voiceCommands.totalCommands', 'Total Commands')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('voiceCommands.recognized', 'Recognized')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.recognized}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('voiceCommands.successful', 'Successful')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.successful}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('common.failed', 'Failed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.failed}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const historyContent = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{t('voiceCommands.recentCommands', 'Recent Commands')}</CardTitle>
        <CardDescription>{t('voiceCommands.latestVoiceHistory', 'Your latest voice command history')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : recentCommands.length > 0 ? (
          <div className="space-y-3">
            {recentCommands.map((command) => (
              <div
                key={command.id}
                className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-md"
                data-testid={`command-${command.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {command.success === true ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : command.success === false ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-blue-600" />
                    )}
                    <p className="font-medium text-gray-900 dark:text-white">
                      {String(command.transcript)}
                    </p>
                  </div>
                  {command.actionExecuted && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('voiceCommands.action', 'Action')}: {String(command.actionExecuted)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    className={
                      command.success === true
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : command.success === false
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                    }
                  >
                    {command.success === true ? t('voiceCommands.executed', 'executed') : command.success === false ? t('common.failed', 'failed') : t('common.pending', 'pending')}
                  </Badge>
                  {command.confidence && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {command.confidence}% {t('voiceCommands.confidence', 'confidence')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Mic className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {t('voiceCommands.noCommandsYet', 'No voice commands yet.')}
              <br />
              {t('voiceCommands.startUsingVoice', 'Start using voice commands to see your history here.')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const tabs: TabConfig[] = [
    {
      id: "voice-control",
      label: t('voiceCommands.voiceControl', 'Voice Control'),
      icon: Mic,
      content: voiceControlContent,
    },
    {
      id: "stats",
      label: t('voiceCommands.statistics', 'Statistics'),
      icon: Activity,
      content: statsContent,
    },
    {
      id: "history",
      label: t('voiceCommands.history', 'History'),
      icon: CheckCircle,
      badge: stats.total,
      content: historyContent,
    },
  ];

  return (
    <TabsPageLayout
      title={t('voiceCommands.title', 'Voice Commands')}
      description={t('voiceCommands.description', 'Hands-free operations using voice recognition')}
      icon={Volume2}
      tabs={tabs}
      defaultTab="voice-control"
    />
  );
}
