import React, { useEffect, useRef, useState } from 'react';

// Floating Smart Calculator - Vanilla React, no external libs
export default function SmartCalc() {
  const [expr, setExpr] = useState('');
  const [display, setDisplay] = useState('0');
  const [steps, setSteps] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState<{ right?: number; bottom?: number; left?: number; top?: number }>({ right: 24, bottom: 24 });
  const draggingRef = useRef(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Track last focused input/textarea
  useEffect(() => {
    function onFocus(e: FocusEvent) {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).getAttribute('contenteditable') === 'true') {
        lastFocusedRef.current = target;
      }
    }
    window.addEventListener('focusin', onFocus);
    return () => window.removeEventListener('focusin', onFocus);
  }, []);

  // Drag handlers
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!draggingRef.current || !nodeRef.current) return;
      e.preventDefault();
      const x = e.clientX - dragOffset.current.x;
      const y = e.clientY - dragOffset.current.y;
      // set top/left so we stop using bottom/right when user drags
      setPosition({ left: x, top: y });
    }
    function onMouseUp() {
      draggingRef.current = false;
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  function startDrag(e: React.MouseEvent) {
    const node = nodeRef.current;
    if (!node) return;
    draggingRef.current = true;
    const rect = node.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  // Safe evaluate: only allow numbers, operators, parentheses, decimal and spaces
  function safeEval(input: string): { ok: boolean; result?: number | string; error?: string } {
    const cleaned = input.replace(/\s+/g, '');
    if (!cleaned) return { ok: true, result: 0 };
    if (!/^[0-9+\-*/().]+$/.test(cleaned)) return { ok: false, error: 'Invalid characters' };
    try {
      // eslint-disable-next-line no-new-func
      // Use Function to evaluate arithmetic only
      const fn = new Function(`return (${cleaned});`);
      const res = fn();
      if (typeof res !== 'number' || !isFinite(res)) {
        return { ok: false, error: 'Math error' };
      }
      return { ok: true, result: res };
    } catch (err) {
      return { ok: false, error: 'Parse error' };
    }
  }

  const updateExpression = (nextExpr: string) => {
    const normalized = nextExpr || '';
    setExpr(normalized);
    setDisplay(normalized.length ? normalized : '0');
  };

  function handleButton(val: string) {
    if (val === 'AC') {
      setExpr('');
      setDisplay('0');
      setSteps('');
      return;
    }

    if (val === 'C') {
      const base = expr || display;
      const next = base.length > 1 ? base.slice(0, -1) : '';
      updateExpression(next);
      setSteps('');
      return;
    }

    if (val === '+/-') {
      const base = expr || display || '0';
      const toggled = base.startsWith('-') ? base.slice(1) : `-${base}`;
      updateExpression(toggled);
      return;
    }

    if (val === '=') {
      const source = expr || display;
      const r = safeEval(source);
      if (!r.ok) {
        setDisplay('Err');
        setSteps(source);
      } else {
        const result = String(r.result);
        setSteps(source || '0');
        setDisplay(result);
        setExpr(result);
      }
      return;
    }

    const isOperator = /^[+\-*/]$/.test(val);

    if (isOperator) {
      const base = expr || display || '0';
      const trimmed = base.replace(/\s+/g, '');
      const next = /[+\-*/]$/.test(trimmed) ? `${trimmed.slice(0, -1)}${val}` : `${trimmed}${val}`;
      updateExpression(next);
      return;
    }

    // append digit or decimal
    const nextExpr = `${expr || ''}${val}`;
    updateExpression(nextExpr);
  }

  function applyToField() {
    const target = lastFocusedRef.current as HTMLInputElement | HTMLTextAreaElement | null;
    if (!target) {
      alert('No input selected. Click on an input field first.');
      return;
    }
    const value = display === 'Err' ? '' : display;
    // Focus the target, set value, dispatch events
    try {
      target.focus();
      (target as any).value = value;
      const inputEvent = new Event('input', { bubbles: true });
      target.dispatchEvent(inputEvent);
      const changeEvent = new Event('change', { bubbles: true });
      target.dispatchEvent(changeEvent);
    } catch (e) {
      console.error('Failed to apply to field', e);
      alert('Failed to apply to the selected field. See console.');
    }
  }

  const keypad: (string | null)[][] = [
    ['C', '/', '*', '-'],
    ['7', '8', '9', '+'],
    ['4', '5', '6', null],
    ['1', '2', '3', '='],
    ['0', '.', '+/-', 'AC'],
  ];

  const cls = 'sc-';

  const keyVariant = (val: string | null) => {
    if (!val) return `${cls}key ${cls}key-empty`;
    if (val === 'C') return `${cls}key ${cls}key-danger`;
    if (val === 'AC') return `${cls}key ${cls}key-muted`;
    if (val === '=') return `${cls}key ${cls}key-equal`;
    if (/^[+\-*/]$/.test(val)) return `${cls}key ${cls}key-operator`;
    return `${cls}key ${cls}key-dark`;
  };

  return (
    <div
      ref={nodeRef}
      className={`${cls}container`}
      style={{
        position: 'fixed',
        zIndex: 999999,
        right: position.right !== undefined ? position.right : undefined,
        bottom: position.bottom !== undefined ? position.bottom : undefined,
        left: position.left !== undefined ? position.left : undefined,
        top: position.top !== undefined ? position.top : undefined,
      }}
    >
      <style>{`
        .${cls}container { width: 340px; max-width: 94vw; font-family: 'Inter', system-ui, sans-serif; }
        .${cls}card { background: radial-gradient(120% 120% at 20% 10%, rgba(99,102,241,0.18), transparent), linear-gradient(180deg,#0b0210, #120417); border-radius:18px; box-shadow:0 18px 42px rgba(0,0,0,0.55); overflow:hidden; color:#fff; border:1px solid rgba(139,92,246,0.2); backdrop-filter: blur(10px); }
        .${cls}header { display:flex; align-items:center; justify-content:space-between; padding:12px 14px; cursor:grab; background:linear-gradient(90deg, #7c3aed, #6366f1); box-shadow: inset 0 1px 0 rgba(255,255,255,0.15); }
        .${cls}title { font-weight:800; color:#e8e7ff; letter-spacing:0.6px; font-size:14px; }
        .${cls}controls { display:flex; gap:8px; }
        .${cls}btn { background:rgba(255,255,255,0.12); border:none; color:#fff; padding:6px 10px; border-radius:10px; cursor:pointer; font-weight:700; transition: transform 0.1s ease, background 0.2s ease; }
        .${cls}btn:hover { background:rgba(255,255,255,0.18); transform: translateY(-1px); }
        .${cls}displayWrap { padding:14px; background:linear-gradient(180deg, rgba(0,0,0,0.35), rgba(12,5,24,0.55)); border-bottom:1px solid rgba(255,255,255,0.05); }
        .${cls}steps { font-size:13px; color:rgba(255,255,255,0.65); min-height:18px; text-align:right; }
        .${cls}display { font-size:30px; font-weight:800; margin-top:8px; color:#8bffd8; min-height:34px; text-align:right; letter-spacing:0.5px; }
        .${cls}padWrap { padding:14px; }
        .${cls}pad { display:grid; grid-template-columns: repeat(4,1fr); gap:10px; }
        .${cls}key { border-radius:10px; padding:14px 10px; text-align:center; font-weight:800; cursor:pointer; user-select:none; border:1px solid rgba(255,255,255,0.04); transition: transform 0.08s ease, filter 0.12s ease; font-size:16px; }
        .${cls}key:active { transform: scale(0.98); filter: brightness(0.95); }
        .${cls}key-danger { background:linear-gradient(180deg, #ef4444, #dc2626); color:#fff; box-shadow:0 6px 16px rgba(239,68,68,0.35); }
        .${cls}key-operator { background:linear-gradient(180deg,#fbbf24, #f59e0b); color:#1f1f1f; box-shadow:0 6px 16px rgba(245,158,11,0.35); }
        .${cls}key-equal { background:linear-gradient(180deg,#3b82f6, #2563eb); color:#e7f0ff; box-shadow:0 6px 16px rgba(37,99,235,0.35); grid-row: span 1; }
        .${cls}key-muted { background:linear-gradient(180deg,#1f2937,#111827); color:#d1d5db; border:1px solid rgba(255,255,255,0.06); }
        .${cls}key-dark { background:linear-gradient(180deg,#111827,#0b1224); color:#f9fafb; border:1px solid rgba(255,255,255,0.05); }
        .${cls}key-empty { visibility:hidden; }
        .${cls}apply { margin-top:12px; background:linear-gradient(90deg,#f97316,#eab308); padding:14px; border-radius:12px; text-align:center; font-weight:900; cursor:pointer; letter-spacing:0.5px; color:#0b0b0b; border:none; box-shadow:0 10px 22px rgba(234,179,8,0.35); transition: transform 0.1s ease, box-shadow 0.2s ease; }
        .${cls}apply:hover { transform: translateY(-1px); box-shadow:0 14px 26px rgba(234,179,8,0.4); }
        .${cls}apply:active { transform: translateY(0); box-shadow:0 10px 22px rgba(234,179,8,0.35); }
        .${cls}minimized { width: 180px; }
        @media (max-width:420px){ .${cls}container{ width: 92vw; right:8px; bottom:12px; } }
      `}</style>

      <div className={`${cls}card`}>
        <div className={`${cls}header`} onMouseDown={startDrag} title="Drag to move">
          <div className={`${cls}title`}>Smart Calc</div>
          <div className={`${cls}controls`}>
            <button
              className={`${cls}btn`}
              aria-label="minimize"
              onClick={(e) => {
                e.stopPropagation();
                setMinimized((m) => !m);
              }}
            >
              {minimized ? '🔼' : '🔽'}
            </button>
          </div>
        </div>

        <div className={`${cls}displayWrap`}>
          <div className={`${cls}steps`}>{steps || '\u00A0'}</div>
          <div className={`${cls}display`}>{display}</div>
        </div>

        {!minimized && (
          <div className={`${cls}padWrap`}>
            <div className={`${cls}pad`}>
              {keypad.flatMap((row, rowIndex) =>
                row.map((k, idx) => (
                  <div
                    key={`${rowIndex}-${idx}-${k ?? 'empty'}`}
                    className={keyVariant(k)}
                    onClick={k ? () => handleButton(k) : undefined}
                  >
                    {k ?? ''}
                  </div>
                ))
              )}
            </div>
            <button className={`${cls}apply`} onClick={applyToField}>
              APPLY TO FIELD
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
