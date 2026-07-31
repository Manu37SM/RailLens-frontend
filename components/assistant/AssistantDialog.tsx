'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import AssistantHeader from './AssistantHeader';
import AssistantMessages from './AssistantMessages';
import AssistantInput from './AssistantInput';
import QuickActions, { type QuickAction } from './QuickActions';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/stores/favoritesStore';
import { useRecentSearches } from '@/stores/recentSearchStore';
import SuggestionBar from './SuggestionBar';

import { Train, MapPin, Route, Home } from 'lucide-react';
import { ActionChip } from './ActionChips';
import {
  AssistantAction,
  buildAssistantResponse,
  resolveIntent,
} from '@/lib/assistantIntent';

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

// AssistantAction/AssistantResponse and the resolveIntent/
// buildAssistantResponse logic itself now live in lib/assistantIntent.ts
// (extracted so the regex-based intent matching can be unit tested
// without rendering this component - see that file's doc comment).

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
  // Was declared without a setter before (`const [isProcessing] =
  // useState(false)`), so the "typing" indicator this feeds
  // (AssistantMessages' isTyping prop) was permanently dead - fully wired
  // up in the UI but never actually toggled. Now reflects the real
  // navigate() delay below.
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<ActionChip[]>([]);
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSuggestions = () => setSuggestions([]);

  const navigate = (href: string) => {
    setIsProcessing(true);

    navigateTimeoutRef.current = setTimeout(() => {
      navigateTimeoutRef.current = null;
      setIsProcessing(false);
      router.push(href);
      closeAssistant();
    }, 300);
  };

  // Without this, a navigate() fired just before the dialog/component
  // unmounts (fast repeated actions, or the page navigating away some
  // other way) still runs its callback 300ms later against a stale
  // closure - router.push/closeAssistant on an unmounted component.
  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) {
        clearTimeout(navigateTimeoutRef.current);
      }
    };
  }, []);

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

  const addAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, createAssistantMessage(content)]);
  };

  const executeAction = (action: AssistantAction) => {
    switch (action.type) {
      case 'train':
        navigate(`/trains/${action.trainNumber}`);
        break;

      case 'station':
        navigate(`/stations/${action.stationCode}`);
        break;

      case 'journey':
        navigate(
          `/journeys?from=${encodeURIComponent(action.from)}&to=${encodeURIComponent(action.to)}`
        );
        break;
      case 'home':
        navigate('/');
        break;

      case 'trains':
        navigate('/trains');
        break;

      case 'stations':
        navigate('/stations');
        break;

      case 'journeys':
        navigate('/journeys');
        break;

      case 'rankings':
        navigate('/rankings');
        break;

      case 'funFacts':
        navigate('/fun-facts');
        break;

      case 'achievements':
        navigate('/achievements');
        break;

      case 'network':
        navigate('/network');
        break;

      case 'stats':
        navigate('/stats');
        break;

      case 'smartSearch':
        navigate('/smart-search');
        break;

      case 'admin':
        navigate('/admin');
        break;

      case 'account':
        navigate('/account');
        break;

      case 'developers':
        navigate('/developers');
        break;

      case 'savedJourneys':
        navigate('/saved-journeys');
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
    const response = buildAssistantResponse(action, favorites, recentSearches);

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

  const runImmediateAction = (action: AssistantAction) => {
    const response = buildAssistantResponse(action, favorites, recentSearches);

    addAssistantMessage(response.message);

    updateSuggestions(action);

    executeAction(action);
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
    const response = buildAssistantResponse(action, favorites, recentSearches);

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
    <div className="fixed right-6 bottom-24 z-50 flex h-[600px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
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
