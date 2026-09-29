import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

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

type Board = components['schemas']['BoardResponse'];

/** Every change goes to Trello through the API, which answers with the board as Trello now has it. */
function useBoardChange<T>(boardId: string, change: (body: T) => Promise<Board>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: change,
    onSuccess: (board) => {
      queryClient.setQueryData(['trello', 'board', boardId], board);
      // A ticked readiness item changes the booking's readiness too.
      void queryClient.invalidateQueries({ queryKey: ['readiness'] });
    },
  });
}

export const useCreateCard = (boardId: string, listId: string) =>
  useBoardChange(boardId, (body: components['schemas']['CreateCardRequest']) =>
    call(api.POST('/api/trello/boards/{boardId}/lists/{listId}/cards', { params: { path: { boardId, listId } }, body })));

export const useMoveCard = (boardId: string, cardId: string) =>
  useBoardChange(boardId, (listId: string) =>
    call(api.PUT('/api/trello/boards/{boardId}/cards/{cardId}/list', { params: { path: { boardId, cardId } }, body: { listId } })));

export const useCheckItem = (boardId: string, cardId: string) =>
  useBoardChange(boardId, ({ checkItemId, complete }: { checkItemId: string; complete: boolean }) =>
    call(api.PUT('/api/trello/boards/{boardId}/cards/{cardId}/check-items/{checkItemId}', {
      params: { path: { boardId, cardId, checkItemId } }, body: { complete },
    })));
