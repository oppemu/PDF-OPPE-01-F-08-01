// report_script.js

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (!reportId) {
        showError("❌ ไม่พบรหัสเอกสาร (ID) ใน URL");
        return;
    }

    // ยิง API ดึงข้อมูล
    const apiUrl = `${CONFIG.WEB_APP_URL}?action=getReportById&id=${encodeURIComponent(reportId)}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(result => {
            document.getElementById('loadingMsg').style.display = 'none';

            if (result.status === "success" && result.data) {
                document.getElementById('documentContent').style.display = 'block';
                renderReport(result.data);
            } else {
                showError(result.message || "❌ ไม่พบข้อมูลสำหรับรหัสเอกสารนี้");
            }
        })
        .catch(error => {
            document.getElementById('loadingMsg').style.display = 'none';
            showError("❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล");
            console.error("Error:", error);
        });
});

// ฟังก์ชันแปลงวันที่
function formatThaiDate(dateString) {
    if (!dateString || dateString === '-' || dateString === '') return ' - ';
    const months = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    try {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj.getTime())) return dateString; 
        
        const day = dateObj.getDate();
        const month = months[dateObj.getMonth()];
        const year = dateObj.getFullYear() + 543;
        
        return `${day} ${month} ${year}`;
    } catch (e) {
        return dateString;
    }
}

// นำข้อมูลไปใส่ในโครงสร้าง A4
function renderReport(data) {
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = (text === "" || text === undefined || text === null) ? "-" : text;
    };

    // ส่วนหัวเอกสาร
    setText('docId', data.id);
    setText('docIdRef', data.id);
    setText('reportDate', formatThaiDate(data.entryDate));
    
    // 💡 ดึงชื่อหน่วยงานเต็มมาจากคอลัมน์ M (ถ้าไม่มีข้อมูลให้แสดงขีด -)
    setText('departmentNameDisplay', data.departmentFullName);

    // วันที่ในเนื้อหา
    setText('contractStart', formatThaiDate(data.contractStart));
    setText('contractEnd', formatThaiDate(data.contractEnd));
    setText('workStart', formatThaiDate(data.workStart));
    setText('workEnd', formatThaiDate(data.workEnd));

    // ข้อความทั่วไป
    const textKeys = [
        'subject', 'companyName', 'category', 'location', 
        'contractDays', 'contractValue', 'recorderName', 'workDays', 
        'actualWorkers', 'expectedWorkers', 'currentVisit', 'accumulatedMoney', 
        'coshem', 'criminalCheck', 'drugTest', 'healthCheck', 
        'workPermit', 'riskAssessment', 'ohsImpact', 'envImpact', 
        'typeOfChange', 'ppe', 'sds', 'jobStatus', 'hseStatus', 
        'jobDetails', 'repairDetails', 'remark'
    ];

    textKeys.forEach(key => setText(key, data[key]));
}

function showError(msg) {
    const errorEl = document.getElementById('errorMsg');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
}