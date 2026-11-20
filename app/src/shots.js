// Shot scenes for the screenshots the dossier carries. Each shot sets the
// editor to a state, waits for the canvas to settle, and signals readiness
// through window.__shotReady. The screenshots are real renders of the app.

export const SHOTS = [
  {
    id: '1-cover',
    name: 'Golden Hour cover (square)',
    coverOnly: true,
    apply: (api) => {
      api.setPreset('golden');
      api.setExportSize('square');
    },
  },
  {
    id: '2-editor',
    name: 'Editor with a photo loaded',
    coverOnly: false,
    apply: (api) => {
      api.setPreset('golden');
      api.selectSlot(0);
      api.loadSample('boulevard');
    },
  },
  {
    id: '3-story',
    name: 'Story size (portrait)',
    coverOnly: true,
    apply: (api) => {
      api.setPreset('neon');
      api.setExportSize('story');
    },
  },
  {
    id: '4-tilt',
    name: 'Tilted snapshots, Poster Ink',
    coverOnly: true,
    apply: (api) => {
      api.setLayout('tilt');
      api.setGrade('poster');
      api.setExportSize('square');
    },
  },
];
