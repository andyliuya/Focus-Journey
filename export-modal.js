// 成就圖片預覽彈窗 - 讓使用者右鍵另存為
function showExportModal(imgDataUrl) {
    const old = document.getElementById('export-preview-modal');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'export-preview-modal';
    Object.assign(overlay.style, {
        position: 'fixed', inset: '0',
        background: 'rgba(0,0,0,0.85)',
        zIndex: '99999',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column',
        gap: '16px', padding: '20px', boxSizing: 'border-box'
    });

    const hint = document.createElement('p');
    hint.textContent = '\u{1F4F8} \u5728\u5716\u7247\u4E0A\u300C\u53F3\u9375 \u2192 \u5716\u7247\u53E6\u5B58\u70BA\u300D\u5373\u53EF\u5132\u5B58\uFF01\u9EDE\u64CA\u5716\u7247\u4EE5\u5916\u5340\u57DF\u53EF\u95DC\u9589\u3002';
    Object.assign(hint.style, {
        color: '#e2e8f0', fontSize: '16px',
        textAlign: 'center', margin: '0', lineHeight: '1.7'
    });

    const img = document.createElement('img');
    img.src = imgDataUrl;
    Object.assign(img.style, {
        maxWidth: 'min(90vw, 560px)', maxHeight: '65vh',
        borderRadius: '16px',
        boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
        objectFit: 'contain', cursor: 'context-menu'
    });

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '\u2715 \u95DC\u9589';
    Object.assign(closeBtn.style, {
        background: 'rgba(255,255,255,0.1)', color: '#e2e8f0',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '10px 36px', borderRadius: '30px',
        cursor: 'pointer', fontSize: '15px', fontFamily: 'inherit'
    });
    closeBtn.onmouseover = function () { this.style.background = 'rgba(255,255,255,0.25)'; };
    closeBtn.onmouseout = function () { this.style.background = 'rgba(255,255,255,0.1)'; };

    overlay.append(hint, img, closeBtn);
    document.body.appendChild(overlay);

    function close() { overlay.remove(); }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    closeBtn.addEventListener('click', close);
}
