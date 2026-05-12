const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const get  = (url) => fetch(`${BASE}${url}`).then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); });
const post = (url, data) => fetch(`${BASE}${url}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); });

export const api = {
  predict:           (d) => post('/predict', d),
  predictDetailed:   (d) => post('/predict-detailed', d),
  metrics:           ()  => get('/analytics/metrics'),
  modelComparison:   ()  => get('/analytics/model-comparison'),
  confusionMatrix:   ()  => get('/analytics/confusion-matrix'),
  rocCurve:          ()  => get('/analytics/roc-curve'),
  prCurve:           ()  => get('/analytics/pr-curve'),
  featureImportance: ()  => get('/analytics/feature-importance'),
  classDistribution: ()  => get('/analytics/class-distribution'),
  calibration:       ()  => get('/analytics/calibration'),
  systemInfo:        ()  => get('/analytics/system-info'),
  health:            ()  => get('/health'),
};

export default { post: (url, data) => post(url, data), get };
