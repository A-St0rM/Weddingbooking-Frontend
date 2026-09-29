import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, call } from '@/lib/api/client';

export function useTrelloStatus() {
  return useQuery({ queryKey: ['trello', 'status'], queryFn: () => call(api.GET('/api/trello/status')) });
}

export interface ImportSource {
  files: File[];
  boardIds: string;
}

function form({ files, boardIds }: ImportSource) {
  const body = new FormData();
  for (const file of files) body.append('files', file);
  if (boardIds.trim()) body.append('boardIds', boardIds.trim());
  return body;
}

// The generated type describes the fields; the browser builds the multipart body.
const multipart = { bodySerializer: (body: unknown) => body as FormData };

export function useTrelloImport() {
  const queryClient = useQueryClient();
  return {
    preview: useMutation({
      mutationFn: (source: ImportSource) =>
        call(api.POST('/api/trello/preview', { body: form(source) as never, ...multipart })),
    }),
    run: useMutation({
      mutationFn: (source: ImportSource) =>
        call(api.POST('/api/trello/import', { body: form(source) as never, ...multipart })),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ['bookings'] });
        void queryClient.invalidateQueries({ queryKey: ['customers'] });
      },
    }),
  };
}
