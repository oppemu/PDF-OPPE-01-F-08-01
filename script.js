
const API_URL = CONFIG.API_URL;
let globalList = []; 
let selectedRowIndex = null;

document.addEventListener("DOMContentLoaded", () => {
    loadData();
});

async function loadData() {
    try {
        const response = await fetch(`${API_URL}?action=getData`, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow' 
        });
        
        const data = await response.json();
        
        if (data.status === "success") {
            globalList = data.list; // เก็บข้อมูลทั้งหมดไว้ทำ Instant Preview
            renderTable(data.list);
        } else {
            console.error("API Error:", data.message);
            document.getElementById('loading').innerHTML = `<span class="text-danger">เกิดข้อผิดพลาด: ${data.message}</span>`;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        document.getElementById('loading').innerHTML = `<span class="text-danger">ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (CORS / Network Error)</span>`;
    }
}

function renderTable(list) {
    document.getElementById('loading').style.display = 'none';
    const docList = document.getElementById('docList');
    docList.style.display = 'flex';
    docList.innerHTML = "";

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'doc-card';
        
        const colC = (item.colC && item.colC !== "undefined") ? item.colC : "-";
        const colH = (item.colH && item.colH !== "undefined") ? item.colH : "-";
        const colI = (item.colI && item.colI !== "undefined") ? item.colI : "-";

        card.innerHTML = `
            <div class="doc-info" style="flex: 1; padding-right: 20px;">
                <div style="font-size: 1.3rem; font-weight: 600; color: #00246B; margin-bottom: 8px;">
                    ${item.colA || '-'}
                </div>
                
                <div style="font-size: 1.05rem; line-height: 1.7;">
                    <div>
                        <span style="color: #00246B; font-weight: 500;">ผู้กรอกข้อมูล:</span> 
                        <span style="color: #000000; font-weight: 400;">${colC}</span>
                    </div>
                    <div>
                        <span style="color: #00246B; font-weight: 500;">รหัส-ระเบียบปฏิบัติ:</span> 
                        <span style="color: #000000; font-weight: 400;">${colH}</span>
                    </div>
                    <div>
                        <span style="color: #00246B; font-weight: 500;">เรื่องที่ดำเนินการ:</span> 
                        <span style="color: #000000; font-weight: 400;">${colI}</span>
                    </div>
                </div>
            </div>
            
            <div class="d-flex flex-column align-items-end justify-content-center" style="min-width: 150px;">
                <button class="btn btn-mahidol px-4 py-2 rounded-pill w-100" onclick="previewPdfInstant(${item.rowIndex})">
                    ดูตัวอย่าง PDF
                </button>
            </div>
        `;
        docList.appendChild(card);
    });
}



// ==========================================
// 1. ฟังก์ชันช่วยเช็คหัวข้อหมวดหมู่ 1-5
// ==========================================
function getDocumentRowValue(row) {
    const label = String(row.label || '').replace(/\s+/g, '');
    return (label === 'หน่วยงาน' || label === 'หน่วยงานต้นสังกัด')
        ? ReportLetter.expandDepartment(row.value)
        : row.value;
}

function getLegacyDocumentRows(rows) {
    // fullRowData preserves physical sheet order starting at column A.
    // Hide AS (45) through BF (58) ONLY in document 2. Keep the source intact
    // for document 1, readiness, snapshots and any future columns after BF.
    return (Array.isArray(rows) ? rows : []).filter((row, index) =>
        (index < 44 || index > 57) &&
        !String(row && row.label || '').trim().startsWith('__') &&
        // This is the timestamp field titled “คอลัมน์ 1”, not column A/ID.
        String(row && row.label || '').replace(/\s+/g, '') !== 'คอลัมน์1'
    );
}

function getSectionTitle(row, index) {
    if (!row || !row.label) return "";
    const label = row.label.toString().trim();

    if (index === 0) {
        return "1. ข้อมูลผู้กรอกแบบฟอร์ม";
    }
    if (label.includes("สถานที่") || label.includes("หมวดหมู่งาน")) {
        return "2. รายละเอียดงานและสัญญา";
    }
    if (label.includes("ตรวจสุขภาพ")) {
        return "3. การคัดกรองบุคคลก่อนเข้าพื้นที่และการควบคุมความปลอดภัย";
    }
    if (label.includes("การเปลี่ยนแปลง")) {
        return "4. การจัดการการเปลี่ยนแปลง Management of Change (MOC)";
    }
    if (label.startsWith("สถานะงาน") || label.includes("ซ่อมแซม")) {
        return "5. สถานะและรายละเอียดเพิ่มเติม";
    }

    return "";
}

// ==========================================
// 2. ฟังก์ชันพรีวิวเอกสาร (จุด : ของข้อ 4-5 ตรงกันทุกบรรทัด)
// ==========================================
let previewRequestId = 0;
let printInProgress = false;
function previewMessage(item) {
    const missing = ReportLetter.missingFields(item);
    return 'คลิกข้อความเพื่อแก้ไขได้ทั้งสองเอกสาร แล้วกดจัดหน้าใหม่หรือดาวน์โหลด PDF • แก้เฉพาะสำเนาในแท็บนี้ ไม่บันทึกกลับชีต' +
        (missing.length ? ' • ข้อมูลที่ยังไม่ครบหรือควรตรวจสอบ: ' + missing.join(', ') : '');
}
function showPdfPreview(result, rowIndex) {
    if (selectedRowIndex !== rowIndex) return;
    document.getElementById('letterPreview').innerHTML = result.letterHtml;
    document.getElementById('previewContent').innerHTML = result.legacyHtml;
    document.getElementById('pdfFilenameHint').textContent = 'ชื่อไฟล์แนะนำ: ' + result.fileName;
    ReportEditor.prepare(document.getElementById('pdfPreviewModal'), rowIndex);
}
async function previewPdfInstant(rowIndex) {
    selectedRowIndex = rowIndex;
    const requestId = ++previewRequestId;
    const item = globalList.find(x => x.rowIndex === rowIndex);
    if (!item) return;
    document.getElementById('letterPreview').innerHTML = '';
    document.getElementById('previewContent').innerHTML = '';
    document.getElementById('pdfFilenameHint').textContent = '';
    document.getElementById('letterNotice').textContent = 'กำลังจัดหน้าเอกสาร…';
    document.getElementById('editorStatus').textContent = '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('pdfPreviewModal')).show();
    try {
        const result = await createPdfDocument(item, ReportEditor.getEdits(rowIndex));
        if (selectedRowIndex !== rowIndex || requestId !== previewRequestId) return;
        showPdfPreview(result, rowIndex);
        document.getElementById('letterNotice').textContent = previewMessage(item);
    } catch (error) {
        if (selectedRowIndex === rowIndex && requestId === previewRequestId) document.getElementById('letterNotice').textContent = error.message;
    }
}
async function reflowDocumentPreview() {
    const rowIndex = selectedRowIndex, requestId = ++previewRequestId;
    const revision = ReportEditor.getRevision(rowIndex);
    const item = globalList.find(x => x.rowIndex === rowIndex);
    if (!item) return;
    try {
        const result = await createPdfDocument(item, ReportEditor.getEdits(rowIndex));
        if (selectedRowIndex !== rowIndex || requestId !== previewRequestId) return;
        if (revision !== ReportEditor.getRevision(rowIndex)) { document.getElementById('editorStatus').textContent = 'มีข้อความแก้ไขเพิ่มระหว่างจัดหน้า กรุณากดจัดหน้าใหม่อีกครั้ง'; return; }
        showPdfPreview(result, rowIndex);
        document.getElementById('letterNotice').textContent = previewMessage(item);
        document.getElementById('editorStatus').textContent = 'จัดหน้าจากข้อความที่แก้ไขแล้ว';
    } catch (error) { if (selectedRowIndex === rowIndex) document.getElementById('editorStatus').textContent = error.message; }
}
async function resetDocumentEdits() {
    if (!confirm('คืนข้อความของเอกสารรายการนี้ตามข้อมูลต้นฉบับ? ข้อความที่แก้ในสำเนานี้จะถูกล้าง โดยไม่แก้ชีต')) return;
    ReportEditor.clear(selectedRowIndex);
    await previewPdfInstant(selectedRowIndex);
}
async function createPdfDocument(item, edits = {}) {
    const fileName = ReportLetter.getPdfFilename(item);
    for (const key of ['legacy-footer']) {
        if (Object.prototype.hasOwnProperty.call(edits, key) && /[\r\n]/.test(edits[key])) throw new Error('ข้อความ footer ต้องอยู่ในบรรทัดเดียว กรุณาตรวจข้อความก่อนพิมพ์');
    }
    const fullData = getLegacyDocumentRows(item.fullRowData);
    const edit = (key, value) => ReportLetter.editText(key, ReportLetter.escapeHtml(String(value)), edits);
    const letter = await ReportLetter.renderPaginated(item, edits);
    if (document.fonts) await Promise.all([
        document.fonts.load('18px "Sarabun"'), document.fonts.load('bold 22px "Sarabun"')
    ]);
    const measureDiv = document.createElement('div');
    measureDiv.style.position = 'absolute';
    measureDiv.style.visibility = 'hidden';
    measureDiv.style.width = '160mm';
    measureDiv.style.fontFamily = '"TH Sarabun New", "Sarabun", sans-serif';
    measureDiv.style.fontSize = '18px';
    measureDiv.style.lineHeight = '1.3';
    document.body.appendChild(measureDiv);

    // A4: ขอบบน 20 มม. ล่าง 5 มม. กันพื้นที่ footer และช่องว่างอีก 8 px
    const maxContentHeightPx = (297 - 20 - 5) * 96 / 25.4 - 14 * 1.3 - 8;
    const pageHeaderSpace = index => letter.pageCount + index + 1 === 2 ? 40 : 0;
    let pages = [];
    let currentPage = [];
    let currentHeight = 0;
    let shownSections = {};
    let currentSectionTitle = "";

    measureDiv.innerHTML = '<div style="font-size: 22px; font-weight: bold; margin-bottom: 15px; text-align: center;">' + edit('legacy-title', 'การจัดซื้อจัดจ้างและการควบคุมผู้รับเหมา') + '</div>';
    currentHeight = (measureDiv.offsetHeight || 40) + pageHeaderSpace(0);

    for (const [index, row] of fullData.entries()) {
        const sectionTitle = getSectionTitle(row, index);
        let htmlBlock = '';

        if (sectionTitle && !shownSections[sectionTitle]) {
            currentSectionTitle = sectionTitle;
            htmlBlock += '<div style="font-size: 18px; font-weight: bold; margin-top: 15px; margin-bottom: 6px;">' + edit('legacy-section-' + index, sectionTitle) + '</div>';
            shownSections[sectionTitle] = true;
        }

        // ข้อ 4 และ 5
        if (currentSectionTitle.startsWith("4.") || currentSectionTitle.startsWith("5.")) {
            htmlBlock += '<div style="display: flex; align-items: flex-start; margin-bottom: 6px; line-height: 1.4;">' +
                '<div style="width: 52%; padding-right: 10px; word-break: break-word;">' + edit('legacy-label-' + index, row.label || '') + '</div>' +
                '<div style="width: 20px; text-align: center; flex-shrink: 0;">' + edit('legacy-colon-' + index, ':') + '</div>' +
                '<div style="flex: 1; padding-left: 5px; word-break: break-word;">' + edit('legacy-value-' + index, getDocumentRowValue(row) || '') + '</div>' +
            '</div>';
        } else {
            htmlBlock += '<div style="display: flex; align-items: flex-start; margin-bottom: 6px; line-height: 1.4;">' +
                '<div style="white-space: nowrap; margin-right: 5px; flex-shrink: 0;">' + edit('legacy-label-' + index, row.label || '') + edit('legacy-colon-' + index, ' :') + '</div>' +
                '<div style="word-break: break-word; flex-grow: 1;">' + edit('legacy-value-' + index, getDocumentRowValue(row) || '') + '</div>' +
            '</div>';
        }
        
        measureDiv.innerHTML = htmlBlock;
        // หน้าพิมพ์ไม่ได้ใช้ Bootstrap: วัดด้วย content-box เช่นเดียวกับเอกสารจริง
        measureDiv.querySelectorAll('*').forEach(element => { element.style.boxSizing = 'content-box'; });
        const blockHeight = measureDiv.offsetHeight || 25;
        if (blockHeight > maxContentHeightPx - pageHeaderSpace(pages.length) ||
            (currentPage.length === 0 && currentHeight + blockHeight > maxContentHeightPx)) {
            measureDiv.remove();
            throw new Error('ข้อมูลรายละเอียดรายการหนึ่งยาวเกินหนึ่งหน้า กรุณาตรวจข้อความก่อนพิมพ์');
        }
        
        if (currentHeight + blockHeight > maxContentHeightPx && currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = [{ html: htmlBlock }];
            currentHeight = blockHeight + pageHeaderSpace(pages.length);
        } else {
            currentPage.push({ html: htmlBlock });
            currentHeight += blockHeight;
        }
    }

    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    measureDiv.innerHTML = '<span style="font-size:14px;line-height:1.3;white-space:pre;">' + edit('legacy-footer', 'รหัสเอกสาร(Doc. No.): OPPE-01-F-08-01 | ฉบับที่ (Rev ที่.No.):00 | วันที่บังคับใช้ (Effective Date): 01/10/2026 | ') + String(pages.length) + '</span>';
    measureDiv.querySelector('[data-edit-key]').style.whiteSpace = 'pre';
    if (measureDiv.firstElementChild.getBoundingClientRect().width > 190 * 96 / 25.4) {
        measureDiv.remove();
        throw new Error('ข้อความ footer ของแบบฟอร์มเดิมยาวเกินขอบกระดาษ กรุณาย่อข้อความก่อนพิมพ์');
    }
    document.body.removeChild(measureDiv);

    let pagesHtml = '';
    pages.forEach((pageRows, i) => {
        let rowsContent = pageRows.map(r => r.html).join('');
        pagesHtml += '<div class="page pdf-legacy-page">' +
            '<div class="doc-container">' +
                (i === 0 ? '<div class="title">' + edit('legacy-title', 'การจัดซื้อจัดจ้างและการควบคุมผู้รับเหมา') + '</div>' : '') +
                rowsContent +
            '</div>' +
            '<div class="footer">' +
                // แก้ไขบรรทัดนี้: นำคำว่า "หน้า " ออกไป เหลือเพียงตัวเลข (i + 1)
                edit('legacy-footer', 'รหัสเอกสาร(Doc. No.): OPPE-01-F-08-01 | ฉบับที่ (Rev ที่.No.):00 | วันที่บังคับใช้ (Effective Date): 01/10/2026 | ') + '<span data-pdf-page-number>' + (i + 1) + '</span>' +
            '</div>' +
        '</div>';
    });

    // เอกสารที่ 2 เริ่ม footer ที่ 1; เลข -2- ด้านบนยังอิงหน้าจริงของ PDF ตามเดิม
    const numberedPages = document.createElement('div');
    numberedPages.innerHTML = pagesHtml;
    ReportLetter.numberPages(numberedPages, 1, letter.pageCount + 1);
    pagesHtml = numberedPages.innerHTML;

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + ReportLetter.escapeHtml(fileName.slice(0, -4)) + '</title>' +
        '<base href="' + ReportLetter.escapeHtml(new URL('.', document.baseURI).href) + '">' +
        '<style>' +
            '@import url("https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap");' +
            '@page { size: A4; margin: 0; }' +
            'body { margin: 0; padding: 0; font-family: "TH Sarabun New", "Sarabun", sans-serif; background: white; font-size: 18px; line-height: 1.3; color: #000000; }' +
            '.page { width: 210mm; height: 297mm; padding: 20mm 20mm 5mm 30mm; box-sizing: border-box; position: relative; page-break-after: always; overflow: hidden; background: white; }' +
            '.doc-container { width: 100%; }' +
            '.title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 15px; color: #000000; }' +
            '.footer { position: absolute; bottom: 5mm; right: 10mm; font-size: 14px; color: #000000; text-align: right; }' +
            '@media print { body { background: white; } .page { margin: 0; box-shadow: none; page-break-after: always; } }' +
        '</style><link rel="stylesheet" href="report_letter.css?v=1.3.0"></head><body>' +
        letter.html + pagesHtml +
        '<script>' +
            'window.onload = async function() { if (document.fonts) await document.fonts.ready; await Promise.all(Array.from(document.images).map(function(img) { return img.complete ? Promise.resolve() : new Promise(function(resolve) { img.onload = img.onerror = resolve; }); })); window.print(); };' +
        '<\/script></body></html>';
    return {letterHtml: letter.html, legacyHtml: pagesHtml, fileName, html};
}
async function downloadPdfFromPreview() {
    if (printInProgress) return;
    const rowIndex = selectedRowIndex;
    const revision = ReportEditor.getRevision(rowIndex);
    const item = globalList.find(x => x.rowIndex === rowIndex);
    if (!item || !item.fullRowData) { alert('ไม่พบข้อมูลสำหรับการพิมพ์เอกสาร'); return; }
    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert('กรุณาเปิดการอนุญาต Pop-up บนเว็บเบราว์เซอร์ของคุณเพื่อพิมพ์เอกสาร'); return; }
    printInProgress = true;
    try {
        const result = await createPdfDocument(item, ReportEditor.getEdits(rowIndex));
        if (revision !== ReportEditor.getRevision(rowIndex)) throw new Error('มีข้อความแก้ไขเพิ่มระหว่างจัดหน้า กรุณากดดาวน์โหลด PDF อีกครั้ง');
        showPdfPreview(result, rowIndex);
        printWindow.document.open();
        printWindow.document.write(result.html);
        printWindow.document.close();
    } catch (error) {
        if (printWindow.close) printWindow.close();
        alert(error.message);
        if (selectedRowIndex === rowIndex) document.getElementById('editorStatus').textContent = error.message;
    } finally { printInProgress = false; }
}
// ---- ฟังก์ชันค้นหาเอกสาร ----
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('searchName');
    const searchBtn = document.getElementById('btnSearch');

    // ฟังก์ชันสำหรับกรองข้อมูล
    function filterDocuments() {
        let searchValue = searchInput.value.toLowerCase().trim();
        
        // ค้นหาการ์ดเอกสารทั้งหมดด้วยคลาส .doc-card ที่สร้างใน renderTable()
        let documentCards = document.querySelectorAll('.doc-card');

        documentCards.forEach(function(card) {
            let cardText = card.textContent || card.innerText;
            if (cardText.toLowerCase().includes(searchValue)) {
                card.style.display = "flex"; // ใช้ flex ตามสไตล์เดิมของการ์ด
            } else {
                card.style.display = "none"; 
            }
        });
    }

    // ทำงานเมื่อคลิกปุ่ม "ค้นหา"
    searchBtn.addEventListener('click', filterDocuments);

    // ทำงานเมื่อกดปุ่ม Enter ในช่องพิมพ์
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            filterDocuments();
        }
    });
});
