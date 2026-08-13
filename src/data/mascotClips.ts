/** Short Bade–Chote joke clips via YouTube (no music / songs). */
export type MascotClip = {
  id: string
  /** Cap playback so clicks stay punchy */
  endSeconds: number
}

export const MASCOT_CLIPS: MascotClip[] = [
  { id: 'CSthg8sEh7s', endSeconds: 21 }, // Dost Ko Bhejo
  { id: '66RXXB0kus0', endSeconds: 23 }, // Teacher joke
  { id: 'LXp8kwTAXxk', endSeconds: 31 }, // Full speed bakwaas
  { id: 'Y-lhA3zVTwg', endSeconds: 40 }, // Bank Wale Maar Dalenge
  { id: 'cgJdTPNXWjM', endSeconds: 40 }, // Chote ki Chemist
  { id: 'dPbubRMPjC8', endSeconds: 40 }, // Chota Aadmi Joke
  { id: 'sTUqyWLvktE', endSeconds: 40 }, // SRK ghar pe nahi so sakta
]
