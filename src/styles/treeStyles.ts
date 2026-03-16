import { NODE_W, NODE_H, LEVEL_H, LABEL_W } from '../useTreeLayout';

export function injectTreeStyles(): void {
  const styleId = 'tree-styles';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    .node-card {
       display: flex;
       flex-direction: column;
       justify-content: center;
       align-items: center;
       border: 1.5px solid #e2e8f0;
       border-radius: 12px;
       padding: 6px 10px;
       background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
       width: ${NODE_W}px;
       min-height: ${NODE_H}px;
       cursor: pointer;
       transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
       box-shadow: 0 1px 3px rgb(0 0 0 / 0.06), 0 1px 2px rgb(0 0 0 / 0.04);
       box-sizing: border-box;
       position: absolute;
    }
    .node-card:hover {
       border-color: #818cf8;
       box-shadow: 0 8px 25px -5px rgb(99 102 241 / 0.15), 0 4px 10px -3px rgb(0 0 0 / 0.05);
       transform: translateY(-1px);
    }
    .node-card.selected {
       border-color: #6366f1;
       background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
       box-shadow: 0 0 0 3px rgb(99 102 241 / 0.2), 0 4px 12px rgb(99 102 241 / 0.1);
    }
    .node-card.drag-over {
       border-color: #34d399 !important;
       background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important;
       box-shadow: 0 0 0 3px rgb(52 211 153 / 0.2) !important;
    }

    .node-title {
       font-size: 0.6rem;
       color: #6366f1;
       font-weight: 700;
       letter-spacing: 0.08em;
       text-transform: uppercase;
       pointer-events: none;
       text-align: center;
       margin-bottom: 1px;
       line-height: 1.2;
       opacity: 0.85;
    }
    .node-name {
       font-weight: 700;
       color: #0f172a;
       font-size: 0.95rem;
       pointer-events: none;
       max-width: 100%;
       text-align: center;
       word-wrap: break-word;
       overflow-wrap: break-word;
       line-height: 1.3;
       letter-spacing: 0.02em;
    }
    .node-spouse {
       font-size: 0.7rem;
       color: #94a3b8;
       margin-top: 4px;
       padding-top: 4px;
       border-top: 1px solid #f1f5f9;
       pointer-events: none;
       width: 100%;
       text-align: center;
       word-wrap: break-word;
       overflow-wrap: break-word;
       line-height: 1.3;
    }

    .gen-label {
      position: absolute;
      width: ${LABEL_W}px;
      height: ${NODE_H}px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      color: #94a3b8;
      font-weight: 500;
      letter-spacing: 0.06em;
      user-select: none;
      pointer-events: none;
    }
    .gen-stripe {
      position: absolute;
      left: ${LABEL_W}px;
      height: ${LEVEL_H}px;
      pointer-events: none;
    }
    .gen-stripe:nth-child(odd) { background: rgba(99,102,241,0.015); }

    @keyframes fade-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slide-in-right { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
    .animate-slide-in { animation: slide-in-right 0.25s ease-out; }
    .animate-slide-up { animation: slide-up 0.3s ease-out; }
  `;
  document.head.appendChild(style);
}
