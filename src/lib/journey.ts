// src/lib/journey.ts
// Pure derivation of the five-step journey shown on Studio and Design pages.
export type JourneyStepId = 'style' | 'fabrics' | 'render' | 'room' | 'share';
export type JourneyStepState = 'done' | 'current' | 'todo';

export interface JourneyStep {
  id: JourneyStepId;
  label: string;
  hint: string;
  state: JourneyStepState;
}

export interface JourneyInput {
  page: 'studio' | 'design';
  zoneCount: number;
  assignedCount: number;
  hasPhotoreal: boolean;
  roomPreviewCount: number;
}

export function deriveJourney(input: JourneyInput): JourneyStep[] {
  const remaining = Math.max(0, input.zoneCount - input.assignedCount);
  const fabricsDone = input.zoneCount > 0 && remaining === 0;
  const renderDone = input.hasPhotoreal;
  const roomDone = input.roomPreviewCount > 0;

  const done: Record<JourneyStepId, boolean> = {
    style: true,
    fabrics: fabricsDone,
    render: renderDone,
    room: roomDone,
    share: false,
  };

  const order: JourneyStepId[] = ['style', 'fabrics', 'render', 'room', 'share'];
  const currentId = order.find((id) => !done[id]) ?? 'share';

  const hints: Record<JourneyStepId, string> = {
    style: 'Pick the curtain style you want to work on.',
    fabrics:
      remaining > 0
        ? `Choose a fabric for ${remaining} ${remaining === 1 ? 'zone' : 'zones'}.`
        : 'Every zone has a fabric. Change any zone at any time.',
    render: renderDone
      ? 'Render saved.'
      : 'Save the design, then create a render.',
    room: roomDone ? 'Curtain staged in a room.' : 'Stage the curtain in a real room photo.',
    share: 'Copy a link, download the image, or print the spec sheet.',
  };

  const labels: Record<JourneyStepId, string> = {
    style: 'Style',
    fabrics: 'Fabrics',
    render: 'Render',
    room: 'Room',
    share: 'Share',
  };

  return order.map((id) => ({
    id,
    label: labels[id],
    hint: hints[id],
    state: id === currentId ? 'current' : done[id] ? 'done' : 'todo',
  }));
}
