
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
function previewPdfInstant(rowIndex) {
    selectedRowIndex = rowIndex;
    const item = globalList.find(x => x.rowIndex === rowIndex);
    if (!item) return;

    let rowsHtml = "";
    let shownSections = {};
    let currentSectionTitle = "";

    if (item.fullRowData && item.fullRowData.length > 0) {
        item.fullRowData.forEach((row, index) => {
            const sectionTitle = getSectionTitle(row, index);
            
            if (sectionTitle && !shownSections[sectionTitle]) {
                currentSectionTitle = sectionTitle;
                rowsHtml += '<div style="font-size: 18px; font-weight: bold; color: #000000; margin-top: 15px; margin-bottom: 6px;">' + sectionTitle + '</div>';
                shownSections[sectionTitle] = true;
            }

            // ข้อ 4 และ 5: ล็อกความกว้างฝั่งซ้ายและกล่องเครื่องหมาย : ให้ตรงกันทุกบรรทัด
            if (currentSectionTitle.startsWith("4.") || currentSectionTitle.startsWith("5.")) {
                rowsHtml += '<div style="display: flex; align-items: flex-start; margin-bottom: 6px; font-size: 18px; line-height: 1.4;">' +
                    '<div style="width: 52%; padding-right: 10px; word-break: break-word;">' + (row.label || '') + '</div>' +
                    '<div style="width: 20px; text-align: center; flex-shrink: 0;">:</div>' +
                    '<div style="flex: 1; padding-left: 5px; word-break: break-word;">' + (row.value || '') + '</div>' +
                '</div>';
            } 
            // ข้อ 1, 2, 3: แสดงผลข้อความต่อติดกันตามธรรมชาติ
            else {
                rowsHtml += '<div style="display: flex; align-items: flex-start; margin-bottom: 6px; font-size: 18px; line-height: 1.4;">' +
                    '<div style="white-space: nowrap; margin-right: 5px; flex-shrink: 0;">' + (row.label || '') + ' :</div>' +
                    '<div style="word-break: break-word; flex-grow: 1;">' + (row.value || '') + '</div>' +
                '</div>';
            }
        });
    }

    const previewContainer = document.getElementById('previewContent');
    previewContainer.innerHTML = '<div style="font-family: \'TH Sarabun New\', \'Sarabun\', sans-serif; max-width: 85%; margin: 0 auto 0 0;">' +
        '<div style="text-align: center; font-size: 22px; margin-bottom: 15px; font-weight: bold; color: #000000;">' +
            'การจัดซื้อจัดจ้างและการควบคุมผู้รับเหมา' +
        '</div>' +
        rowsHtml +
    '</div>';

    const previewModal = new bootstrap.Modal(document.getElementById('pdfPreviewModal'));
    previewModal.show();
}

// ==========================================
// ฟังก์ชันดาวน์โหลด / พิมพ์ PDF (แก้ไข Footer ตามที่ต้องการ)
// ==========================================
function downloadPdfFromPreview() {
    if (typeof selectedRowIndex === 'undefined' || typeof globalList === 'undefined') {
        alert("ไม่พบข้อมูลรายการที่เลือก");
        return;
    }

    const item = globalList.find(x => x.rowIndex === selectedRowIndex);
    if (!item || !item.fullRowData) {
        alert("ไม่พบข้อมูลสำหรับการพิมพ์เอกสาร");
        return;
    }

    const fullData = item.fullRowData;

    const measureDiv = document.createElement('div');
    measureDiv.style.position = 'absolute';
    measureDiv.style.visibility = 'hidden';
    measureDiv.style.width = '157mm'; 
    measureDiv.style.fontFamily = '"TH Sarabun New", "Sarabun", sans-serif';
    measureDiv.style.fontSize = '18px';
    measureDiv.style.lineHeight = '1.3';
    document.body.appendChild(measureDiv);

    const maxContentHeightPx = 1010; 
    let pages = [];
    let currentPage = [];
    let currentHeight = 0;
    let shownSections = {};
    let currentSectionTitle = "";

    measureDiv.innerHTML = '<div style="font-size: 22px; font-weight: bold; margin-bottom: 15px; text-align: center;">การจัดซื้อจัดจ้างและการควบคุมผู้รับเหมา</div>';
    currentHeight = measureDiv.offsetHeight || 40;

    fullData.forEach((row, index) => {
        const sectionTitle = getSectionTitle(row, index);
        let htmlBlock = '';

        if (sectionTitle && !shownSections[sectionTitle]) {
            currentSectionTitle = sectionTitle;
            htmlBlock += '<div style="font-size: 18px; font-weight: bold; margin-top: 15px; margin-bottom: 6px;">' + sectionTitle + '</div>';
            shownSections[sectionTitle] = true;
        }

        // ข้อ 4 และ 5
        if (currentSectionTitle.startsWith("4.") || currentSectionTitle.startsWith("5.")) {
            htmlBlock += '<div style="display: flex; align-items: flex-start; margin-bottom: 6px; line-height: 1.4;">' +
                '<div style="width: 52%; padding-right: 10px; word-break: break-word;">' + (row.label || '') + '</div>' +
                '<div style="width: 20px; text-align: center; flex-shrink: 0;">:</div>' +
                '<div style="flex: 1; padding-left: 5px; word-break: break-word;">' + (row.value || '') + '</div>' +
            '</div>';
        } else {
            htmlBlock += '<div style="display: flex; align-items: flex-start; margin-bottom: 6px; line-height: 1.4;">' +
                '<div style="white-space: nowrap; margin-right: 5px; flex-shrink: 0;">' + (row.label || '') + ' :</div>' +
                '<div style="word-break: break-word; flex-grow: 1;">' + (row.value || '') + '</div>' +
            '</div>';
        }
        
        measureDiv.innerHTML = htmlBlock;
        const blockHeight = measureDiv.offsetHeight || 25;
        
        if (currentHeight + blockHeight > maxContentHeightPx && currentPage.length > 0) {
            pages.push(currentPage);
            currentPage = [{ html: htmlBlock }];
            currentHeight = blockHeight; 
        } else {
            currentPage.push({ html: htmlBlock });
            currentHeight += blockHeight;
        }
    });

    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    document.body.removeChild(measureDiv);

    let pagesHtml = '';
    pages.forEach((pageRows, i) => {
        let rowsContent = pageRows.map(r => r.html).join('');
        pagesHtml += '<div class="page">' +
            '<div class="doc-container">' +
                (i === 0 ? '<div class="title">การจัดซื้อจัดจ้างและการควบคุมผู้รับเหมา</div>' : '') +
                rowsContent +
            '</div>' +
            '<div class="footer">' +
                // แก้ไขบรรทัดนี้: นำคำว่า "หน้า " ออกไป เหลือเพียงตัวเลข (i + 1)
                'รหัสเอกสาร(Doc. No.): OPPE-01-F-08-01 | ฉบับที่ (Rev ที่.No.):00 | วันที่บังคับใช้ (Effective Date): 01/10/2026 | ' + (i + 1) +
            '</div>' +
        '</div>';
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("กรุณาเปิดการอนุญาต Pop-up บนเว็บเบราว์เซอร์ของคุณเพื่อพิมพ์เอกสาร");
        return;
    }

    printWindow.document.write('<!DOCTYPE html><html><head><title>พิมพ์เอกสาร</title>' +
        '<style>' +
            '@import url("https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap");' +
            '@page { size: A4; margin: 0; }' +
            'body { margin: 0; padding: 0; font-family: "TH Sarabun New", "Sarabun", sans-serif; background: white; font-size: 18px; line-height: 1.3; color: #000000; }' +
            '.page { width: 210mm; height: 297mm; padding: 15mm 10mm 15mm 15mm; box-sizing: border-box; position: relative; page-break-after: always; overflow: hidden; background: white; }' +
            '.doc-container { width: 85%; }' +
            '.title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 15px; color: #000000; }' +
            '.footer { position: absolute; bottom: 10mm; right: 10mm; font-size: 14px; color: #000000; text-align: right; }' +
            '@media print { body { background: white; } .page { margin: 0; box-shadow: none; page-break-after: always; } }' +
        '</style></head><body>' +
        pagesHtml +
        '<script>' +
            'window.onload = function() { window.print(); };' +
        '<\/script></body></html>');

    printWindow.document.close();
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