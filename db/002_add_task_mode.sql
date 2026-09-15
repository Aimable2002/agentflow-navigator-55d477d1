-- Persist whether a task was requested as a conversational reply or an agent run.
create type public.task_mode as enum ('chat', 'agent');

alter table public.tasks
  add column mode public.task_mode not null default 'chat';