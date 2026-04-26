/**
 * Hardcoded sample conversation data for the chat/messaging screens.
 * Will be replaced with API calls once backend is wired up.
 */

export interface Conversation {
  id: string;
  participantName: string;
  participantGradientFrom: string;
  participantGradientTo: string;
  /** Optional badge pill text (e.g., "Mentor") */
  badgeLabel?: string;
  /** Whether the participant is currently online */
  isOnline: boolean;
  /** Last message preview text */
  lastMessage: string;
  /** Display timestamp (formatted) */
  timestamp: string;
  /** Number of unread messages (0 = none) */
  unreadCount: number;
}

export const sampleConversations: Conversation[] = [
  {
    id: "conv-rajesh",
    participantName: "Rajesh Iyer",
    participantGradientFrom: "#6B6B66",
    participantGradientTo: "#9B9B94",
    badgeLabel: "Mentor",
    isOnline: true,
    lastMessage:
      "Sounds great, let\u2019s lock in next Tuesday at 4pm IST...",
    timestamp: "10:42 AM",
    unreadCount: 2,
  },
  {
    id: "conv-ananya",
    participantName: "Ananya Krishnan",
    participantGradientFrom: "#B8762A",
    participantGradientTo: "#D4A053",
    isOnline: false,
    lastMessage:
      "Thanks for sharing your deck. Quick question on slide 3...",
    timestamp: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "conv-priya",
    participantName: "Priya Reddy",
    participantGradientFrom: "#8B5CF6",
    participantGradientTo: "#A78BFA",
    isOnline: false,
    lastMessage:
      "Have you read the Goldman 2026 outlook? Curious about your...",
    timestamp: "Mon",
    unreadCount: 1,
  },
  {
    id: "conv-rohan",
    participantName: "Rohan Kapoor",
    participantGradientFrom: "#0EA5E9",
    participantGradientTo: "#38BDF8",
    isOnline: false,
    lastMessage: "Will send the pitch deck doc tomorrow am",
    timestamp: "Aug 12",
    unreadCount: 0,
  },
];

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  /** ISO date string */
  date: string;
  /** Display timestamp */
  displayTime: string;
  /** Display date label (e.g., "Sept 14", "Today") */
  displayDate: string;
}

export const sampleMessages: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "rajesh",
    senderName: "Rajesh Iyer",
    text: "Arjun, glad we connected. Saw your note about transitioning into VC. Happy to share what I know about the path from operating roles.",
    date: "2025-09-14T09:02:00",
    displayTime: "9:02 AM",
    displayDate: "Sept 14",
  },
  {
    id: "msg-2",
    senderId: "arjun",
    senderName: "Arjun Mehta",
    text: "Thanks Rajesh. I\u2019ve been thinking about the gap between operating PM work and the kind of pattern recognition VCs hire for. Would love your read on whether to join an early-stage startup first or apply directly.",
    date: "2025-09-14T09:08:00",
    displayTime: "9:08 AM",
    displayDate: "Sept 14",
  },
  {
    id: "msg-3",
    senderId: "rajesh",
    senderName: "Rajesh Iyer",
    text: "It depends. If your goal is later-stage growth investing, direct entry can work \u2014 many of my Bain colleagues went directly. For early-stage, operating experience is a real edge. Can we put a 30-min call on the calendar next week?",
    date: "2025-09-14T09:21:00",
    displayTime: "9:21 AM",
    displayDate: "Sept 14",
  },
  {
    id: "msg-4",
    senderId: "arjun",
    senderName: "Arjun Mehta",
    text: "Yes, definitely. Tuesday 4pm IST works for me.",
    date: "2026-04-27T10:38:00",
    displayTime: "10:38 AM",
    displayDate: "Today",
  },
  {
    id: "msg-5",
    senderId: "rajesh",
    senderName: "Rajesh Iyer",
    text: "Sounds great, let\u2019s lock in next Tuesday at 4pm IST. I\u2019ll send a Google Meet invite.",
    date: "2026-04-27T10:42:00",
    displayTime: "10:42 AM",
    displayDate: "Today",
  },
];
