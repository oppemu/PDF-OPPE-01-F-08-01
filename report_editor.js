/* สำเนาสำหรับแก้ข้อความก่อนพิมพ์ เก็บในหน่วยความจำของแท็บนี้เท่านั้น */
(function (root) {
    'use strict';
    const drafts = new Map();
    const revisions = new Map();
    const getEdits = rowIndex => ({ ...(drafts.get(String(rowIndex)) || {}) });
    const getRevision = rowIndex => revisions.get(String(rowIndex)) || 0;
    const clear = rowIndex => { drafts.delete(String(rowIndex)); revisions.set(String(rowIndex), getRevision(rowIndex) + 1); };
    const isFooter = key => key === 'letter-footer' || key === 'legacy-footer';
    function prepare(container, rowIndex) {
        container.dataset.editRow = String(rowIndex);
        container.querySelectorAll('[data-edit-key]').forEach(element => {
            // Plain-text paste/format guards below preserve the print layout; Chromium's
            // plaintext-only mode forces pre-wrap even on untouched legacy fields.
            element.contentEditable = 'true';
            element.spellcheck = false;
            element.setAttribute('role', 'textbox');
            element.setAttribute('aria-label', 'ข้อความในสำเนาเอกสาร แก้ไขได้');
            element.setAttribute('aria-multiline', String(!isFooter(element.dataset.editKey)));
        });
        if (container.dataset.editorReady) return;
        container.dataset.editorReady = 'true';
        container.addEventListener('beforeinput', event => {
            if (event.target.closest('[data-edit-key]') && String(event.inputType).startsWith('format')) event.preventDefault();
        });
        container.addEventListener('input', event => {
            const element = event.target.closest('[data-edit-key]');
            if (!element || !container.contains(element)) return;
            const key = element.dataset.editKey;
            element.classList.add('pdf-edited-text');
            let value = element.innerText.replace(/\r\n?/g, '\n');
            if (isFooter(key) && /\n/.test(value)) {
                value = value.replace(/\n+$/, '').replace(/\n/g, ' ');
                element.textContent = value;
            }
            const row = container.dataset.editRow;
            const edits = drafts.get(row) || Object.create(null);
            edits[key] = value;
            drafts.set(row, edits);
            revisions.set(row, getRevision(row) + 1);
            if (isFooter(key)) container.querySelectorAll('[data-edit-key]').forEach(copy => {
                if (copy !== element && copy.dataset.editKey === key) { copy.textContent = value; copy.classList.add('pdf-edited-text'); }
            });
            document.getElementById('editorStatus').textContent = 'มีข้อความที่แก้ไขแล้ว • กดจัดหน้าใหม่เพื่อตรวจตำแหน่งก่อนดาวน์โหลด';
        });
        container.addEventListener('paste', event => {
            const element = event.target.closest('[data-edit-key]');
            if (!element) return;
            event.preventDefault();
            let value = event.clipboardData.getData('text/plain');
            if (isFooter(element.dataset.editKey)) value = value.replace(/[\r\n]+$/, '').replace(/[\r\n]+/g, ' ');
            document.execCommand('insertText', false, value);
        });
        container.addEventListener('keydown', event => {
            const element = event.target.closest('[data-edit-key]');
            if (element && isFooter(element.dataset.editKey) && event.key === 'Enter') event.preventDefault();
        });
        container.addEventListener('drop', event => {
            if (event.target.closest('[data-edit-key]')) event.preventDefault();
        });
    }
    root.ReportEditor = { getEdits, getRevision, clear, prepare };
}(window));
