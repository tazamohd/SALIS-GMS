import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, Activity, CheckCircle, XCircle } from "lucide-react";
import type { VoiceCommand } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VoiceCommands() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const { data: commands, isLoading } = useQuery<VoiceCommand[]>({
    queryKey: ["/api/voice-commands"],
  });

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice commands are not supported in this browser. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Voice command recognition started",
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
        title: "Recognition Error",
        description: `Error: ${event.error}`,
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
  }, [toast]);

  const processCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase().trim();
    
    try {
      // Send command to backend for processing
      const result: any = await apiRequest("/api/voice-commands/process", "POST", {
        command: lowerCommand,
        rawTranscript: command,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/voice-commands"] });

      if (result.actionExecuted) {
        toast({
          title: "Command Executed",
          description: result.message || `Executed: ${result.actionExecuted}`,
        });

        // Execute the action based on the result
        if (result.intent === 'navigate' && result.path) {
          window.location.href = result.path;
        }
      } else {
        toast({
          title: "Command Not Recognized",
          description: "Please try a different command.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing command:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process voice command.",
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-salis-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-montserrat flex items-center gap-3">
            <Volume2 className="h-8 w-8 text-purple-600" />
            Voice Commands
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Hands-free operations using voice recognition
          </p>
        </div>

        {/* Voice Control Card */}
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Voice Control</CardTitle>
            <CardDescription>
              Click the microphone to start voice commands. Try saying "Open job cards" or "Create new appointment"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Microphone Button */}
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
                {isListening ? "Listening..." : "Click to Start"}
              </p>
            </div>

            {/* Transcript Display */}
            {(transcript || interimTranscript) && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transcript:
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

            {/* Available Commands */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Example Commands:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Open job cards",
                  "Create new appointment",
                  "Show customers",
                  "View inventory",
                  "Open settings",
                  "Show reports",
                  "Create invoice",
                  "Search parts",
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Commands
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
                Recognized
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
                Successful
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
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.failed}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Commands */}
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Recent Commands</CardTitle>
            <CardDescription>Your latest voice command history</CardDescription>
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
                          Action: {String(command.actionExecuted)}
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
                        {command.success === true ? "executed" : command.success === false ? "failed" : "pending"}
                      </Badge>
                      {command.confidence && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {command.confidence}% confidence
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
                  No voice commands yet.
                  <br />
                  Start using voice commands to see your history here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
