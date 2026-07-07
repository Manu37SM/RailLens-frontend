'use client';

import { useCallback, useEffect, useState } from 'react';

import AssistantHeader from './AssistantHeader';
import AssistantMessages from './AssistantMessages';
import AssistantInput from './AssistantInput';
import QuickActions, { type QuickAction } from './QuickActions';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/stores/favoritesStore';
import { useRecentSearches } from '@/stores/recentSearchStore';
import SuggestionBar from './SuggestionBar';

import { Train, MapPin, Route, Star, History, Home } from 'lucide-react';
import { ActionChip } from './ActionChips';

type ConversationState =
  | {
      type: 'default';
    }
  | {
      type: 'train';
    }
  | {
      type: 'station';
    }
  | {
      type: 'journey';
      from?: string;
    };

export interface AssistantMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

type AssistantAction =
  | {
      type: 'train';
      trainNumber: string;
    }
  | {
      type: 'station';
      stationCode: string;
    }
  | {
      type: 'journey';
      from: string;
      to: string;
    }
  | {
      type: 'favorites';
    }
  | {
      type: 'recent';
    }
  | {
      type: 'help';
    }
  | {
      type: 'home';
    }
  | {
      type: 'trains';
    }
  | {
      type: 'stations';
    }
  | {
      type: 'journeys';
    }
  | {
      type: 'unknown';
      query: string;
    };

interface AssistantResponse {
  message: string;
  closeAfterAction?: boolean;
}

interface AssistantDialogProps {
  open: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGES: AssistantMessage[] = [
  {
    id: crypto.randomUUID(),
    role: 'assistant',
    content:
      'Hi! I can help you find trains, stations, journeys, favorites, and recent searches.',
  },
];

export default function AssistantDialog({
  open,
  onClose,
}: AssistantDialogProps) {
  const router = useRouter();
  const favorites = useFavorites();
  const recentSearches = useRecentSearches();
  const [mode, setMode] = useState<ConversationState>({
    type: 'default',
  });
  const [messages, setMessages] =
    useState<AssistantMessage[]>(INITIAL_MESSAGES);
  const appendMessages = (...messages: AssistantMessage[]) => {
    setMessages((prev) => [...prev, ...messages]);
  };
  const [isProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<ActionChip[]>([]);

  const clearSuggestions = () => setSuggestions([]);

  const getWelcomeMessage = (): AssistantMessage => ({
    id: crypto.randomUUID(),
    role: 'assistant',
    content:
      'Hi! I can help you search trains, stations, journeys, favorites, and recent searches in RailLens.',
  });

  const resetConversation = () => {
    setMode({
      type: 'default',
    });
  };

  const closeAssistant = useCallback(() => {
    resetConversation();
    clearSuggestions();

    setMessages([getWelcomeMessage()]);

    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAssistant();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, closeAssistant]);

  const suggestionConfig: Partial<
    Record<AssistantAction['type'], ActionChip[]>
  > = {
    help: [
      {
        icon: Train,
        label: 'Find Train',
        action: 'train',
      },
      {
        icon: MapPin,
        label: 'Search Station',
        action: 'station',
      },
      {
        icon: Route,
        label: 'Plan Journey',
        action: 'journey',
      },
    ],

    favorites: [
      {
        icon: Home,
        label: 'Home',
        action: 'home',
      },
      {
        icon: Train,
        label: 'Trains',
        action: 'trains',
      },
    ],

    recent: [
      {
        icon: Train,
        label: 'Find Train',
        action: 'train',
      },
      {
        icon: Route,
        label: 'Plan Journey',
        action: 'journey',
      },
    ],
  };

  const updateSuggestions = (action: AssistantAction) => {
    setSuggestions(suggestionConfig[action.type] ?? []);
  };

  const createAssistantMessage = (content: string): AssistantMessage => ({
    id: crypto.randomUUID(),
    role: 'assistant',
    content,
  });

  const createUserMessage = (content: string): AssistantMessage => ({
    id: crypto.randomUUID(),
    role: 'user',
    content,
  });

  const helpResponses: Record<string, string> = {
    trains:
      'Use the Train Search page to search by train number or train name. Select a train to view its schedule, route, running days, and other details.',

    stations:
      'Use the Station Search page to search by station name or station code. You can view station details and trains passing through that station.',

    journey:
      'Use Journey Search to find trains between two stations. Enter your source and destination stations to see available trains.',

    favorites:
      'Click the star icon on a train or station to save it as a favorite. Your favorites are stored locally on your device.',

    recent:
      'RailLens automatically saves your recent train, station, and journey searches for quick access.',

    railLens:
      'RailLens is an Indian Railway Information System that helps you search trains, stations, journeys, favorites, and recent searches.',
  };

  const resolveIntent = (query: string): AssistantAction => {
    const input = query.trim();

    if (/^\d{5}$/.test(input)) {
      return {
        type: 'train',
        trainNumber: input,
      };
    }

    if (/^[A-Za-z]{2,5}$/.test(input)) {
      return {
        type: 'station',
        stationCode: input.toUpperCase(),
      };
    }

    const journeyMatch = input.match(/^(.+?)\s+to\s+(.+)$/i);

    if (journeyMatch) {
      return {
        type: 'journey',
        from: journeyMatch[1].trim(),
        to: journeyMatch[2].trim(),
      };
    }

    if (/favorite/i.test(input)) {
      return {
        type: 'favorites',
      };
    }

    if (/recent/i.test(input)) {
      return {
        type: 'recent',
      };
    }

    if (/help|what can you do/i.test(input)) {
      return { type: 'help' };
    }

    if (/search.*train|find.*train|train search/i.test(input)) {
      return {
        type: 'unknown',
        query: 'help:trains',
      };
    }

    if (/station search|search.*station|find.*station/i.test(input)) {
      return {
        type: 'unknown',
        query: 'help:stations',
      };
    }

    if (/journey|plan.*trip|plan.*journey/i.test(input)) {
      return {
        type: 'unknown',
        query: 'help:journey',
      };
    }

    if (/favorite/i.test(input)) {
      return {
        type: 'unknown',
        query: 'help:favorites',
      };
    }

    if (/recent/i.test(input)) {
      return {
        type: 'unknown',
        query: 'help:recent',
      };
    }

    if (/raillens/i.test(input)) {
      return {
        type: 'unknown',
        query: 'help:raillens',
      };
    }

    return {
      type: 'unknown',
      query: input,
    };
  };

  const buildAssistantResponse = (
    action: AssistantAction
  ): AssistantResponse => {
    switch (action.type) {
      case 'train':
        return {
          message: `Opening train ${action.trainNumber}...`,
          closeAfterAction: true,
        };

      case 'station':
        return {
          message: `Opening station ${action.stationCode}...`,
          closeAfterAction: true,
        };

      case 'journey':
        return {
          message: `Searching journeys from ${action.from} to ${action.to}...`,
          closeAfterAction: true,
        };

      case 'home':
        return {
          message: 'Opening Home...',
          closeAfterAction: true,
        };

      case 'trains':
        return {
          message: 'Opening Train Search...',
          closeAfterAction: true,
        };

      case 'stations':
        return {
          message: 'Opening Station Search...',
          closeAfterAction: true,
        };

      case 'journeys':
        return {
          message: 'Opening Journey Search...',
          closeAfterAction: true,
        };

      case 'favorites':
        return {
          message:
            favorites.length === 0
              ? 'You have no favorite trains or stations.'
              : favorites
                  .map((item) =>
                    item.type === 'train'
                      ? `🚆 ${item.trainNumber} • ${item.trainName}`
                      : `📍 ${item.stationCode} • ${item.stationName}`
                  )
                  .join('\n'),
        };

      case 'recent':
        return {
          message:
            recentSearches.length === 0
              ? 'You have no recent searches.'
              : recentSearches
                  .map((item) => {
                    switch (item.type) {
                      case 'train':
                        return `🚆 ${item.trainNumber} • ${item.trainName}`;

                      case 'station':
                        return `📍 ${item.stationCode} • ${item.stationName}`;

                      case 'journey':
                        return `🗺 ${item.fromName} → ${item.toName}`;
                    }
                  })
                  .join('\n'),
        };

      case 'help':
        return {
          message:
            'I can help you with:\n\n' +
            '• Search trains\n' +
            '• Search stations\n' +
            '• Plan journeys\n' +
            '• View favorites\n' +
            '• View recent searches\n\n' +
            'You can also ask:\n' +
            '"How do I search trains?"',
        };

      case 'unknown': {
        switch (action.query) {
          case 'help:trains':
            return { message: helpResponses.trains };

          case 'help:stations':
            return { message: helpResponses.stations };

          case 'help:journey':
            return { message: helpResponses.journey };

          case 'help:favorites':
            return { message: helpResponses.favorites };

          case 'help:recent':
            return { message: helpResponses.recent };

          case 'help:raillens':
            return { message: helpResponses.railLens };

          default:
            return {
              message:
                "I didn't quite understand that.\n\nI can help you search trains, stations, journeys, favorites, recent searches, and navigate RailLens.",
            };
        }
      }

      default:
        return {
          message:
            "Sorry, I didn't understand that.\n\nTry:\n• 12141\n• KYN\n• Mumbai to Pune\n• Show favorites\n• Recent searches",
        };
    }
  };

  const addAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, createAssistantMessage(content)]);
  };

  const executeAction = (action: AssistantAction) => {
    switch (action.type) {
      case 'train':
        setTimeout(() => {
          router.push(`/trains/${action.trainNumber}`);
          closeAssistant();
        }, 300);
        break;

      case 'station':
        setTimeout(() => {
          router.push(`/stations/${action.stationCode}`);
          closeAssistant();
        }, 300);
        break;

      case 'journey':
        setTimeout(() => {
          router.push(
            `/journeys?from=${encodeURIComponent(action.from)}&to=${encodeURIComponent(action.to)}`
          );
          closeAssistant();
        }, 300);
        break;
      case 'home':
        setTimeout(() => {
          router.push('/');
          closeAssistant();
        }, 300);
        break;

      case 'trains':
        setTimeout(() => {
          router.push('/trains');
          closeAssistant();
        }, 300);
        break;

      case 'stations':
        setTimeout(() => {
          router.push('/stations');
          closeAssistant();
        }, 300);
        break;

      case 'journeys':
        setTimeout(() => {
          router.push('/journeys');
          closeAssistant();
        }, 300);
        break;

      case 'favorites':
      case 'recent':
      case 'unknown':
        break;
    }
  };

  const handleSend = (message: string) => {
    if (!message.trim()) return;

    if (mode.type !== 'default') {
      handleModeInput(message);
      return;
    }

    const action = resolveIntent(message);
    const response = buildAssistantResponse(action);

    appendMessages(
      createUserMessage(message),
      createAssistantMessage(response.message)
    );

    executeAction(action);
  };

  const quickActionConfig: Record<
    Extract<QuickAction, 'train' | 'station' | 'journey'>,
    {
      mode: ConversationState;
      message: string;
    }
  > = {
    train: {
      mode: { type: 'train' },
      message: 'Please enter a train number or train name.',
    },
    station: {
      mode: { type: 'station' },
      message: 'Please enter a station code or station name.',
    },
    journey: {
      mode: { type: 'journey' },
      message: 'Which station are you travelling from?',
    },
  };

  const runImmediateAction = async (action: AssistantAction) => {
    const response = buildAssistantResponse(action);

    addAssistantMessage(response.message);

    updateSuggestions(action);

    await executeAction(action);
  };

  const handleQuickAction = (action: QuickAction) => {
    const immediateActions: Record<
      Extract<
        QuickAction,
        | 'home'
        | 'trains'
        | 'stations'
        | 'journeys'
        | 'favorites'
        | 'recent'
        | 'help'
      >,
      AssistantAction
    > = {
      home: { type: 'home' },
      trains: { type: 'trains' },
      stations: { type: 'stations' },
      journeys: { type: 'journeys' },
      favorites: { type: 'favorites' },
      recent: { type: 'recent' },
      help: { type: 'help' },
    };

    if (action in immediateActions) {
      runImmediateAction(
        immediateActions[action as keyof typeof immediateActions]
      );
      return;
    }

    if (action === 'train' || action === 'station' || action === 'journey') {
      const config = quickActionConfig[action];
      clearSuggestions();
      setMode(config.mode);
      addAssistantMessage(config.message);
    }
  };

  const completeModeAction = (action: AssistantAction, userInput: string) => {
    const response = buildAssistantResponse(action);

    appendMessages(
      createUserMessage(userInput),
      createAssistantMessage(response.message)
    );

    executeAction(action);

    resetConversation();
  };

  const handleModeInput = (message: string): void => {
    const value = message.trim();

    switch (mode.type) {
      case 'train': {
        if (!value) {
          addAssistantMessage('Please enter a train number or train name.');
          return;
        }

        completeModeAction(
          {
            type: 'train',
            trainNumber: value,
          },
          value
        );

        return;
      }

      case 'station': {
        if (!value) {
          addAssistantMessage('Please enter a station code or station name.');
          return;
        }

        completeModeAction(
          {
            type: 'station',
            stationCode: value.toUpperCase(),
          },
          value
        );

        return;
      }

      case 'journey': {
        if (!mode.from) {
          if (!value) {
            addAssistantMessage('Please enter your source station.');
            return;
          }

          setMode({
            type: 'journey',
            from: value,
          });

          appendMessages(
            createUserMessage(value),
            createAssistantMessage('Where are you travelling to?')
          );
          return;
        }

        if (!value) {
          addAssistantMessage('Please enter your destination station.');
          return;
        }

        completeModeAction(
          {
            type: 'journey',
            from: mode.from,
            to: value,
          },
          value
        );

        return;
      }

      default:
        return;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed right-6 bottom-24 z-50 flex h-[600px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      <AssistantHeader onClose={onClose} />

      <AssistantMessages messages={messages} isTyping={isProcessing} />

      {suggestions.length > 0 ? (
        <SuggestionBar suggestions={suggestions} onAction={handleQuickAction} />
      ) : (
        <QuickActions onAction={handleQuickAction} />
      )}

      <AssistantInput onSend={handleSend} autoFocus={open} />
    </div>
  );
}
