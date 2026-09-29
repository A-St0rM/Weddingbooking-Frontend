import { useQuery } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';

export function useTrelloBoards() {
  return useQuery({ queryKey: ['trello', 'boards'], queryFn: () => call(api.GET('/api/trello/boards')) });
}

/** Asked for again every 30 seconds; the API holds a board for 20 — a change in Trello shows within a minute. */
export function useTrelloBoard(boardId: string | undefined) {
  return useQuery({
    queryKey: ['trello', 'board', boardId],
    queryFn: () => call(api.GET('/api/trello/boards/{boardId}', { params: { path: { boardId: boardId! } } })),
    enabled: Boolean(boardId),
    refetchInterval: 30_000,
    staleTime: 0,
  });
}

export const trelloCardUrl = (cardId: string) => `https://trello.com/c/${cardId}`;
