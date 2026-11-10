/* หนังสือรายงานส่วนแรก: อ่านข้อมูลจาก item ของแถวที่เลือกเท่านั้น */
(function (root) {
    'use strict';

    const BLANK = '................................';
    // รหัสในชีตคงเดิม แปลงเฉพาะการแสดงผลเอกสาร ตามรายชื่อที่ผู้ใช้ยืนยัน
    const DEPARTMENT_NAMES = Object.freeze({
        ASD: 'งานบริหารและพัฒนาระบบ',
        MLC: 'งานบริหารและพัฒนาระบบ',
        SVD: 'งานบริหารและพัฒนาระบบ',
        DMP: 'งานออกแบบและผังแม่บท',
        UBS: 'งานสาธารณูปโภคและระบบอาคาร',
        TAS: 'งานจราจรและความปลอดภัย',
        LSE: 'งานภูมิทัศน์และสิ่งแวดล้อม',
        PMH: 'งานบริหารอาคารมหิดลสิทธาคาร',
        SUD: 'งานพัฒนาเพื่อความยั่งยืน'
    });
    const DEPARTMENT_EXTENSIONS = Object.freeze({
        'งานภูมิทัศน์และสิ่งแวดล้อม': '1211',
        'งานจราจรและความปลอดภัย': '1253',
        'งานบริหารและพัฒนาระบบ': '1112',
        'งานออกแบบและผังแม่บท': '1138',
        'งานพัฒนาเพื่อความยั่งยืน': '1121',
        'งานบริหารอาคารมหิดลสิทธาคาร': '6602'
    });
    // เติมเฉพาะคำนำหน้าที่ตรวจยืนยันจากฐานบุคลากร ไม่เดาจากชื่อหรือตำแหน่ง
    const PERSON_PREFIXES = Object.freeze({
        "อิทธิโชติ จักรไพวงศ์": "ผศ.ดร.",
        "พุฒิเศรษฐ์ ตันติเมฆิน": "นาย",
        "สุพจน์ ภาษีรอด": "นาย",
        "เนตรา แย้มเดช": "นางสาว",
        "อรวรรณ ไพรี": "นางสาว",
        "ปิยนุช ถาวร": "นางสาว",
        "ฤทัยรัตน์ พิเชฐบวรกุล": "นางสาว",
        "อิสสรียา จิตวรานนท์": "นางสาว",
        "รรินทิพย์ จักรพันธุ์ ณ อยุธยา": "นางสาว",
        "พรหมสิทธิ์ แคฝอย": "นาย",
        "นงนุช คนมั่น": "นางสาว",
        "พิรดาณัฐ พยุง": "นางสาว",
        "วรวัฒน์ ภมรพล": "นาย",
        "พิรญาณ์ ณ น่าน": "นางสาว",
        "วรัญญา การะเวก": "นาง",
        "วริษฐา จันทร์เจือศิริ": "นางสาว",
        "ธิระพงศ์ เหมทานนท์": "นาย",
        "นิภาพร พูลเพิ่ม": "นางสาว",
        "ลินทศักดิ์ จักรพันธุ์": "ม.ล.",
        "อมรรัตน์ โคตรวงค์": "นาง",
        "ศรีวิตรา ปิ่นตบแต่ง": "นางสาว",
        "วิษณุ สว่างใจธรรม": "นาย",
        "พร้อมพงศ์ ผุงเพิ่มตระกูล": "นาย",
        "ปราศรัย เพ็งปรีชา": "นาย",
        "สมชาย มิตรเทวิน": "นาย",
        "ครรชิต ยอดแก้ว": "นาย",
        "ศุภวรรณ อารีจิตรานุสรณ์": "นางสาว",
        "สาธร เบญจชาด": "นาย",
        "สุภาดา ศรีสารคาม": "นางสาว",
        "ณัฐ ตรีลักษณวิลัย": "นาย",
        "มนตรี แสงทวี": "นาย",
        "ศุภชัย เด่นไตรรัตน์": "นาย",
        "ยุทธวัชร อภิวาทนสิริ": "นาย",
        "อัจฉรา กิตติอภินันท์": "นางสาว",
        "อัครนันท์ เซี่ยงเห็น": "ว่าที่ร.ต.",
        "วราลักษณ์ นามเสถียร": "นางสาว",
        "สุรินทร์ วงษ์ตา": "นาย",
        "ฐิตารีย์ วรรณาภรณ์สกุล": "นางสาว",
        "พิสิษฐ์ พยุง": "ว่าที่ร.ต.",
        "พนอ เปียทอง": "นาย",
        "วีระศักดิ์ บัวพันธ์": "นาย",
        "สุพัฒน์ ศรีเอี่ยมจันทร์": "นาย",
        "สุระเชน มะลิงาม": "นาย",
        "สุริยัน จันทร์เงิน": "นาย",
        "สัญชัย สถิตย์สารธรรม": "นาย",
        "พิชยนันท์ พิมพ์ชื่น": "นาย",
        "กมลพรรณ จงคงคาวุฒิ": "นางสาว",
        "ประวิทย์ ไชยชุมภู": "นาย",
        "ณัฐวัฒน์ จันทร์แปลง": "นาย",
        "ฤทธิพร เพียรจันทร์": "นาย",
        "นราธิป เขียวคำรพ": "นาย",
        "กบินทร์ จงขะวะดี": "นาย",
        "วรรษชล แก้วมณี": "นาย",
        "เมธาวี ชาบัญ": "นาย",
        "ชัยวัฒน์ วิริยะกุล": "นาย",
        "วรทัต หงส์วาณิชวงศ์": "นาย",
        "ทศพร ศรีไกรรส": "นาย",
        "นวพล ยอดภักดี": "นาย",
        "ประพันธ์ ชื่นชมเชาวน์": "นาย",
        "ชนะโชติ เกษาภรณ์": "ว่าที่ร.ต.",
        "อนพัทย์ จันทร์ปราง": "นาย",
        "วีระชน อยู่สำราญ": "นาย",
        "พันธกานต์ แจ่มแจ้ง": "นาย",
        "ไตรภูมิ สุจจิตร์จูล": "นาย",
        "ชลกานต์ เจริญสุข": "นาย",
        "เทิดศักดิ์ ช้างหล่อ": "นาย",
        "สมยศ ลบล้ำเลิศ": "นาย",
        "สรวุฒิ เหล่าสิม": "นาย",
        "ทวี ทัดเทียม": "นาย",
        "ธนชาติ เศรษฐบุตร": "นาย",
        "ภัทรพล ไชยมาตย์": "นาย",
        "ยุทธภูมิ ญานเพิ่ม": "นาย",
        "พิชญา ดลมินทร์": "นางสาว",
        "ศักดิ์นรินทร์ คัญทัพ": "นาย",
        "วิฑูรย์ สุวรรณกิจ": "นาย",
        "พีรพงษ์ จินดานิล": "นาย",
        "บัญชา ฟักเฟื่อง": "นาย",
        "พรชัย โพธิ์ไซย์": "นาย",
        "สถาพร แจ่มใจ": "นาย",
        "ตะวัน ทรัพย์อบรมย์": "นาย",
        "สุรศักดิ์ ต้วมสี": "นาย",
        "โสภาณา จันทร์ทวีนุช": "นางสาว",
        "ทรงกลด สุดตา": "นาย",
        "นพกร เมืองแก้ว": "นาย",
        "ไกรสอน คชมิตร": "นาย",
        "ชนสรณ์ เนียมสุภาพ": "นาย",
        "อำนาจ แม้นพรม": "นาย",
        "นฤเดช เวชบุญ": "นาย",
        "ศุภชัย เรืองเพชร": "นาย",
        "สุรชัย สุวรรณราฐ": "นาย",
        "อนิน นาควัชระ": "นาย",
        "ปิยนันท์ ศรีชุมพวง": "นาย",
        "พชร สาธร": "นาย",
        "อนุชา สิทธิขำ": "นาย",
        "ชัยเทพ เจียมวีระบรรยง": "นาย",
        "บุญฤทธิ์ สายลือนาม": "นาย",
        "ศักดิ์นรินทร์ แก้วหานาม": "นาย",
        "มนัสชาย ประเดิมชัย": "นาย",
        "อุทัยวรรณ เกิดบุญ": "นางสาว",
        "วรพจน์ เฉลิมกลิ่น": "นาย",
        "สมพงษ์ พิเชฐบวรกุล": "นาย",
        "กรรณิการ์ ศรีราณี": "นางสาว",
        "สมชาย สุวิมล": "นาย",
        "สมพล คงอยู่": "นาย",
        "จวน แก่นละออ": "นาย",
        "ชาย ศรีสุริยวงษ์": "นาย",
        "พรภพ ยาเณร": "นาย",
        "อนนท์ ปรางค์แก้ว": "นาย",
        "ธีรพงษ์ การะเกตุ": "นาย",
        "สมหมาย เรืองยศ": "นาย",
        "มนตรี นาคไร่ขิง": "นาย",
        "ศราวุธ เนียมหมวด": "นาย",
        "จีรวัฒน์ หลีล้วน": "นาย",
        "จักรี โพธิ์ทอง": "นาย",
        "ไตรรงค์ นาคไร่ขิง": "นาย",
        "ธนดล เรืองสุภาพ": "นาย",
        "ศิริ โตโสภณ": "นาย",
        "อนันต์ ฤทธิ์คำรพ": "นาย",
        "สราวุฒิ โตสัมพันธ์": "นาย",
        "ธนกฤต เพ็งนาเรนทร์": "นาย",
        "วิทวัฒน์ กิจคงชีพ": "นาย",
        "อัครเดช ดนุดิษฐ": "นาย",
        "อภิชาติ มอญสะแก": "นาย",
        "หนึ่ง เที่ยงราตรี": "นาย",
        "ศุภชัย เนียมสุภาพ": "นาย",
        "อนุรักษ์ สีสดใส": "นาย",
        "ศราวุธ พรศรี": "นาย",
        "วีรยุทธ ทัศนดี": "นาย",
        "วันชนะ พลายจันทร์": "นาย",
        "กฤษณ ทองศรีเมือง": "นาย",
        "อำนาจ ศรีสัมพันธ์": "นาย",
        "จักรยศนันท์ เตียวตระกูล": "นาย",
        "อุทุมพร สุดสวาสดิ์": "นางสาว",
        "วรพจน์ ปัญจมานนท์": "นาย",
        "บัณฑิต โอษคลัง": "นาย",
        "กฤตนันท์ วิจิตรกูล": "นาย",
        "ธีรพงศ์ เกียรติกมลชัย": "นาย",
        "อภิวัฒน์ เศรษฐจารุรักษ์": "นาย",
        "จิรศักดิ์ ทับทิมหอม": "นาย",
        "อภิรักษ์ ฟักภู่": "นาย",
        "อรรถพร ประกอบเพชร": "นาย",
        "วสันต์ รัตนนิธาน": "นาย",
        "ศิริพร ศรีเพ็ญแก้ว": "นางสาว",
        "อคิราภ์ ภูริรักษ์พิติกร": "นางสาว",
        "ศศิวิมล ผุงเพิ่มตระกูล": "นางสาว",
        "มะลุลี เลี่ยมแหลม": "นางสาว",
        "ศันสณีย์ ศิริลักษณ์": "นางสาว",
        "รุ่งทิวา บัวดี": "นางสาว",
        "วราทิพย์ วัฒนวินิจฉัย": "นางสาว",
        "สุฑานาศ สุยพงษ์พันธ์": "นางสาว",
        "เจริญชัย แสงอุทัย": "นาย",
        "สุเทพ วงษ์คำ": "นาย",
        "สวัสดิ์ อาจมาก": "นาย",
        "สมนึก แจ้งเจียนหัด": "นาย",
        "บุญเลิศ ต่ายกระทึก": "นาย",
        "เสน่ห์ ทองศรีเมือง": "นาย",
        "สุดารัตน์ คำภิมูล": "นางสาว",
        "รวี จำเนียร": "นาย",
        "วศิน แสวงสุข": "นาย",
        "นิรมล กมลยชาติ": "นางสาว",
        "วัชระ วัดครุฑ": "นาย",
        "กัญญาณัฐ อุณชาติ": "นางสาว",
        "อดิศักดิ์ อุทัย": "นาย",
        "ปรเมธ เผือกทอง": "นาย",
        "ป้อม แจ่มจรูญ": "นาย",
        "วุฒิชัย แสงเจริญเกียรติ": "นาย",
        "นนทนันท์ ศรีจันทร์": "นาย",
        "ศิริชัย สว่างชม": "นาย",
        "วิชญ์พงศ์ วรรธนะโกวินท์": "นาย"
});
    const PERSON_PREFIX_OVERRIDES = Object.freeze({
        'อิทธิโชติ จักรไพวงศ์': 'ผศ.ดร.'
    });
    function expandDepartment(value) {
        const code = String(value === undefined || value === null ? '' : value).trim().toUpperCase();
        return Object.prototype.hasOwnProperty.call(DEPARTMENT_NAMES, code) ? DEPARTMENT_NAMES[code] : value;
    }
    function departmentExtension(value) {
        const department = String(expandDepartment(value) || '').trim();
        return Object.prototype.hasOwnProperty.call(DEPARTMENT_EXTENSIONS, department) ? DEPARTMENT_EXTENSIONS[department] : '';
    }
    function text(value) {
        if (value === undefined || value === null) return '';
        const result = String(value).trim();
        return /^(?:-|undefined|null)$/i.test(result) ? '' : result;
    }
    function personNameParts(value) {
        const source = text(value).replace(/\s+/g, ' ');
        let bare = source;
        const prefix = /^(?:รองศาสตราจารย์|ผู้ช่วยศาสตราจารย์|ศาสตราจารย์|นายแพทย์|แพทย์หญิง|ทันตแพทย์หญิง|ทันตแพทย์|นางสาว|น\.\s*ส\.|ด\.\s*ช\.|ด\.\s*ญ\.|ว่าที่\s*ร\.\s*ต\.|ม\.\s*ร\.\s*ว\.|ม\.\s*ล\.|ผศ\.|รศ\.|ศ\.|ดร\.|นพ\.|พญ\.|ทพญ\.|ทพ\.|ภญ\.|ภก\.|นาง|นาย|อาจารย์|Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s*/i;
        while (prefix.test(bare)) bare = bare.replace(prefix, '').trim();
        return {source, bare, hasPrefix: source !== bare};
    }
    function formatPersonName(value) {
        const person = personNameParts(value);
        if (!person.source) return '';
        if (Object.prototype.hasOwnProperty.call(PERSON_PREFIX_OVERRIDES, person.bare)) {
            return PERSON_PREFIX_OVERRIDES[person.bare] + person.bare;
        }
        if (person.hasPrefix) return person.source;
        return (Object.prototype.hasOwnProperty.call(PERSON_PREFIXES, person.bare) ? PERSON_PREFIXES[person.bare] : '') + person.source;
    }
    function hasVerifiedPrefix(value) {
        const person = personNameParts(value);
        return !person.source || person.hasPrefix || Object.prototype.hasOwnProperty.call(PERSON_PREFIX_OVERRIDES, person.bare) ||
            (Object.prototype.hasOwnProperty.call(PERSON_PREFIXES, person.bare) && !!PERSON_PREFIXES[person.bare]);
    }
    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[char]));
    }
    function normalize(label) {
        return text(label).replace(/[\s\u200b\u200c\u200d\ufeff]+/g, '').toLowerCase();
    }
    function formatInstallment(value) {
        const source = text(value);
        // เปลี่ยนเฉพาะข้อความในหนังสือ เช่น 3/12 เป็น 3 ไม่แก้ค่าต้นทาง
        const match = source.match(/^([0-9๐-๙]+)\s*[/／]\s*[0-9๐-๙]+$/);
        return match ? match[1] : source;
    }
    function formatSubject(value) {
        // ตัดเฉพาะเลขลำดับหน้าชื่อ ไม่ตัดตัวเลขหรือเครื่องหมายในชื่อโครงการ/งาน
        return text(value).replace(/^(?:\([0-9๐-๙]+\)|[0-9๐-๙]+[.)])\s*/, '')
            .replace(/^[0-9๐-๙]+\s+(?=งาน|โครงการ)/, '');
    }
    function rawField(item, labels, directKeys) {
        for (const label of labels) {
            const match = (item.fullRowData || []).find(row => normalize(row.label) === normalize(label));
            if (match && text(match.value)) return match.value;
        }
        for (const key of directKeys || []) {
            if (text(item[key])) return item[key];
        }
        return '';
    }
    function field(item, labels, directKeys) { return text(rawField(item, labels, directKeys)); }
    function parsePeople(value) {
        if (typeof value === 'string') {
            const source = text(value);
            if (!source) return [];
            try { value = JSON.parse(source); } catch (_) {
                if (/^[\[{]/.test(source)) return [];
                value = source.split(/[,;\n]+/);
            }
        }
        if (!Array.isArray(value)) return [];
        return value.map(person => text(typeof person === 'string' ? person : person && person.name)).filter(Boolean);
    }
    function getPersonnel(item) {
        const chiefs = rawField(item, ['ชื่อหัวหน้าผู้ควบคุมงาน'], ['chiefSupervisor', 'colAV']);
        const roster = rawField(item, ['ชื่อผู้ควบคุมงาน'], ['supervisorsData', 'colAW']);
        const details = (item.fullRowData || []).find(row => normalize(row.label) === normalize('ข้อมูลผู้ควบคุมงาน'));
        // AW เป็นรายชื่อในรายการนั้น ใช้ BA สำรองเฉพาะเมื่อไม่มี AW ไม่ดึงชื่อผู้กรอกมาแทน
        return {
            chair: field(item, ['ชื่อประธานตรวจรับ'], ['committeeChair', 'colAU']),
            chiefs: parsePeople(chiefs),
            supervisors: parsePeople(roster || (details && details.value) || item.supervisorsPeople || item.colBA)
        };
    }
    function editText(key, html, edits = {}) {
        const changed = Object.prototype.hasOwnProperty.call(edits, key);
        const content = changed ? escapeHtml(String(edits[key])) : html;
        return `<span class="pdf-edit-text${changed ? ' pdf-edited-text' : ''}" data-edit-key="${escapeHtml(key)}">${content}</span>`;
    }
    const FOOTER_TEXT = 'รหัสเอกสาร(Doc. No.): OPPE-01-F-08-01 | ฉบับที่ (Rev ที่.No.):00 | วันที่บังคับใช้ (Effective Date): 01/10/2026 | ';
    function footerHtml(pageNumber, edits = {}) {
        return `<div class="letter-footer">${editText('letter-footer', FOOTER_TEXT, edits)}<span data-pdf-page-number>${pageNumber}</span></div>`;
    }
    function signaturesHtml(item, edits = {}) {
        const personnel = getPersonnel(item);
        const signature = (name, role, key, id) => `<div class="letter-signature-person" data-person-role="${key}"><div class="letter-signature-space" aria-label="พื้นที่สำหรับลงลายมือชื่อ"></div><div class="letter-signature-name">${editText('letter-name-' + id, `( ${escapeHtml(formatPersonName(name) || BLANK)} )`, edits)}</div><div>${editText('letter-role-' + id, role, edits)}</div></div>`;
        const chiefs = personnel.chiefs.length ? personnel.chiefs : [''];
        const supervisors = personnel.supervisors.length ? personnel.supervisors : [''];
        // เรียงต่อเนื่องจากซ้ายไปขวา: หัวหน้า แล้วผู้ควบคุมทุกคน ไม่ล็อกผู้ควบคุมไว้คอลัมน์ขวา
        const people = chiefs.map(name => ({name, role: 'หัวหน้าผู้ควบคุมงาน', key: 'chief'}))
            .concat(supervisors.map(name => ({name, role: 'ผู้ควบคุมงาน', key: 'supervisor'})));
        const rows = [];
        for (let i = 0; i < people.length; i += 2) {
            const left = people[i], right = people[i + 1];
            rows.push(`<div class="letter-signature-row">${signature(left.name, left.role, left.key, i)}${right ? signature(right.name, right.role, right.key, i + 1) : '<div></div>'}</div>`);
        }
        return `<div class="letter-signatures"><div class="letter-signature-primary"><div class="letter-signature-chair">${signature(personnel.chair, 'ประธานกรรมการตรวจรับพัสดุ', 'chair', 'chair')}</div>${rows.shift() || ''}</div>${rows.length ? `<div class="letter-signature-remaining">${rows.join('')}</div>` : ''}</div>`;
    }
    function formatDate(value) {
        value = text(value);
        if (!value) return '';
        // API ปัจจุบันส่งวันที่ภาษาไทยมาแล้ว ไม่แปลงซ้ำเป็นปี พ.ศ. อีกครั้ง
        if (/[ก-๙]/.test(value)) return value;
        const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
        const local = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:\s.*)?$/);
        if (!iso && !local) return value;
        const year = Number(iso ? iso[1] : local[3]);
        const month = Number(iso ? iso[2] : local[2]);
        const day = Number(iso ? iso[3] : local[1]);
        const ce = year > 2400 ? year - 543 : year;
        if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(ce, month, 0)).getUTCDate()) return value;
        const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
            'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        return `${day} ${months[month - 1]} ${ce + 543}`;
    }
    function getFields(item) {
        const get = (labels, keys) => field(item, labels, keys);
        const department = expandDepartment(get(['หน่วยงาน', 'หน่วยงานต้นสังกัด'], ['colD']));
        return {
            department,
            company: get(['ชื่อบริษัทดำเนินการ'], ['colJ']),
            subject: formatSubject(get(['เรื่องที่ดำเนินการ'], ['colI'])),
            // ต้นแบบลิงก์ P และ C โดยตรง จึงไม่สลับไปใช้ BB หรือ AW/BA
            installment: formatInstallment(get(['เข้าดำเนินการครั้งที่'], ['colP'])),
            signer: get(['ชื่อผู้กรอกข้อมูล'], ['colC']),
            contractNumber: get(['เลขที่สัญญา'], ['colAT']),
            contractDate: formatDate(get(['วันที่ลงนามในสัญญา'], ['colAX'])),
            // วันที่บนหนังสือกับวันที่ส่งงานจริงเป็นคนละข้อมูล ห้ามใช้แทนกัน
            // คอลัมน์ใหม่ค้นหาจากหัวคอลัมน์ ไม่ผูกกับตำแหน่งที่อาจเปลี่ยนได้
            companyLetterDate: formatDate(get(['วันที่บนหนังสือบริษัท'], ['submissionLetterDate'])),
            submissionDate: formatDate(get(['วันที่บริษัทส่งงาน', 'วันที่บริษัทส่งงานจริง'], ['submissionDate', 'colBC'])),
            reportDate: '', // ออกวันที่เอกสารในระบบภายหลัง ไม่ดึงจากชีต
            completionDate: formatDate(get(['วันที่ดำเนินการแล้วเสร็จ'], ['colS'])),
            recipientName: formatPersonName(get(['ชื่อประธานตรวจรับ'], ['colAU'])),
            recipientPosition: get(['ตำแหน่งประธานตรวจรับ'], ['colAY']),
            status: get(['สถานะงาน'], ['colAM']),
            // ช่องที่ไม่มีข้อมูลให้เว้นจุดไว้ ไม่ใช้ ID/เลขสัญญาหรือวันที่อื่นแทน
            memoNumber: '', // ออกเลขที่เอกสารในระบบภายหลัง
            phoneExtension: departmentExtension(department) || get(['เบอร์โทรภายใน', 'เบอร์ต่อ']),
            companyLetterNumber: get(['เลขที่หนังสือส่งงานของบริษัท', 'เลขที่หนังสือส่งมอบงาน', 'เลขที่หนังสือบริษัท'], ['submissionLetterNo'])
        };
    }
    function statusKind(status) {
        if (!status) return 'unknown';
        if (/(?:ไม่|ยังไม่)\s*แล้วเสร็จ|ไม่เป็นไปตาม|ไม่ครบ|ไม่ผ่าน|ระหว่างดำเนิน|ยังดำเนิน|ค้าง|รอแก้|มีข้อบกพร่อง/.test(status)) return 'incomplete';
        return /^แล้วเสร็จ\s*เป็นไปตามเงื่อนไขของสัญญา$/.test(status) ? 'complete' : 'unknown';
    }
    function buildHtml(item, edits = {}) {
        const fields = getFields(item);
        const value = key => `<span data-field="${key}">${escapeHtml(fields[key] || BLANK)}</span>`;
        const installment = value('installment');
        const companyPrefix = /^บริษัท/.test(fields.company) ? '' : 'บริษัท ';
        let finding;
        if (statusKind(fields.status) === 'complete') {
            finding = `บัดนี้ ผู้ควบคุมงานได้ตรวจสอบการดำเนินงานดังกล่าวเรียบร้อยแล้ว พบว่าผู้รับจ้างได้ดำเนินงานงวดที่ ${installment} แล้วเสร็จครบถ้วนตามสัญญาจ้างทุกประการ ตั้งแต่วันที่ ${value('completionDate')} โดยมีรายละเอียดตามเอกสารแนบ จึงเห็นสมควรตรวจรับงานงวดที่ ${installment} ได้`;
        } else if (statusKind(fields.status) === 'incomplete') {
            finding = `บัดนี้ ผู้ควบคุมงานได้ตรวจสอบการดำเนินงานงวดที่ ${installment} แล้ว พบว่าสถานะการดำเนินงานคือ ${value('status')} โดยมีรายละเอียดตามเอกสารแนบ ทั้งนี้ ผลการพิจารณาตรวจรับงานงวดที่ ${installment} ${BLANK}`;
        } else {
            finding = `บัดนี้ การดำเนินงานงวดที่ ${installment} มีสถานะตามข้อมูลว่า ${value('status')} โดยมีรายละเอียดตามเอกสารแนบ ทั้งนี้ ผลการพิจารณาตรวจรับงานงวดที่ ${installment} ${BLANK}`;
        }
        const edit = (key, html) => editText(key, html, edits);
        return `<section class="letter-page" lang="th" aria-label="หนังสือรายงานผลการตรวจสอบการส่งมอบงาน" data-row-index="${escapeHtml(item.rowIndex)}">
            <div class="letter-content"><div class="letter-opening">
            <img class="letter-logo" src="report-logo.png" alt="ตรามหาวิทยาลัยมหิดล">
            <div class="letter-header">
                <div class="letter-department">${edit('letter-department', value('department'))}</div>
                <div>${edit('letter-division', 'กองกายภาพและสิ่งแวดล้อม')}</div>
                <div>${edit('letter-university', 'สำนักงานอธิการบดี มหาวิทยาลัยมหิดล')}</div>
                <div class="letter-phone">${edit('letter-phone', `โทร. 02-441-4400 ต่อ ${value('phoneExtension')}`)}</div>
            </div>
            <div class="letter-meta">
                <div data-field="memo-number-line">${edit('letter-number', '<span class="letter-label">ที่</span>')}</div>
                <div data-field="memo-date-line">${edit('letter-date', '<span class="letter-label">วันที่</span>')}</div>
                <div class="letter-subject">${edit('letter-subject', `<span class="letter-label">เรื่อง</span><span>รายงานผลการตรวจสอบการส่งมอบงาน งวดที่ ${installment} ${value('subject')}</span>`)}</div>
            </div>
            <div class="letter-recipient">${edit('letter-recipient', '<span class="letter-label">เรียน</span>ประธานกรรมการตรวจรับพัสดุ')}</div></div>
            <div class="letter-body">
                <p>${edit('letter-body-0', `ตามที่ ${companyPrefix}${value('company')} ได้มีหนังสือเลขที่ ${value('companyLetterNumber')} ลงวันที่ ${value('companyLetterDate')} แจ้งขอส่งมอบงานงวดที่ ${installment} ตามสัญญาที่ ${value('contractNumber')} ลงวันที่ ${value('contractDate')} นั้น`)}</p>
                <p>${edit('letter-body-1', finding)}</p>
                <p>${edit('letter-body-2', 'จึงเรียนมาเพื่อโปรดพิจารณา โดยเห็นสมควรนัดประชุมคณะกรรมการตรวจรับพัสดุ เพื่อพิจารณาตรวจรับงานดังกล่าวต่อไป จักขอบคุณยิ่ง')}</p>
            </div>
            ${signaturesHtml(item, edits)}</div>
            ${footerHtml(1, edits)}
        </section>`;
    }
    function paginate(container) {
        const first = container.querySelector('.letter-page');
        if (!first) return 0;
        const body = first.querySelector('.letter-body');
        const signatures = first.querySelector('.letter-signatures');
        const blocks = [...body.children].map(node => ({node, kind: 'body'}));
        const footerTemplate = first.querySelector('.letter-footer').outerHTML;
        const primary = signatures.querySelector('.letter-signature-primary');
        const remaining = signatures.querySelector('.letter-signature-remaining');
        body.remove(); signatures.remove();
        let page = first;
        let section = null;
        let kind = '';
        const fits = node => {
            const footer = page.querySelector('.letter-footer').getBoundingClientRect();
            // เลื่อนเฉพาะ footer ลง แต่คงพื้นที่เนื้อหาและการแบ่งหน้าลายเซ็นเดิม
            const contentLimit = page.getBoundingClientRect().bottom - (10 * 96 / 25.4) - footer.height - 8;
            return node.getBoundingClientRect().bottom <= Math.min(footer.top - 8, contentLimit);
        };
        const newPage = () => {
            page = first.cloneNode(false);
            page.classList.add('letter-continuation');
            page.innerHTML = '<div class="letter-content"></div>' + footerTemplate;
            container.appendChild(page);
            numberPages(container); // เผื่อพื้นที่เลข -2- ก่อนวัดความสูงเนื้อหาหน้าถัดไป
            section = null; kind = '';
        };
        const append = block => {
            if (kind !== block.kind || !section) {
                section = document.createElement('div');
                section.className = block.kind === 'body' ? 'letter-body' : 'letter-signatures';
                page.querySelector('.letter-content').appendChild(section);
                kind = block.kind;
            }
            section.appendChild(block.node);
        };
        const fitSignatures = group => {
            if (fits(group)) return true;
            // ลดเฉพาะพื้นที่ว่าง โดยคงฟอนต์และช่องสำหรับเซ็นอย่างน้อยหนึ่งบรรทัด
            const spacing = ratio => {
                group.style.setProperty('--signature-space', `${20 + 20 * ratio}pt`);
                group.style.setProperty('--signature-gap', `${8 + 24.89 * ratio}pt`);
            };
            spacing(0);
            if (!fits(group)) return false;
            let low = 0, high = 1;
            for (let i = 0; i < 12; i++) {
                const middle = (low + high) / 2;
                spacing(middle);
                if (fits(group)) low = middle; else high = middle;
            }
            spacing(low);
            return true;
        };
        if (!fits(first.querySelector('.letter-opening'))) throw new Error('ส่วนหัวหนังสือยาวเกินพื้นที่หนึ่งหน้า กรุณาตรวจข้อมูลก่อนพิมพ์');
        for (const block of blocks) {
            append(block);
            if (!fits(block.node)) {
                block.node.remove();
                newPage();
                append(block);
                if (!fits(block.node)) throw new Error('ข้อความหรือรายชื่อยาวเกินพื้นที่หนึ่งหน้า กรุณาตรวจข้อมูลก่อนพิมพ์');
            }
        }
        if (page !== first) throw new Error('เนื้อหาหนังสือยาวเกินกว่าจะวางลายเซ็น 3 คนในหน้าแรก กรุณาตรวจความยาวข้อมูลก่อนพิมพ์');
        append({node: primary, kind: 'signatures'});
        if (!fitSignatures(primary)) throw new Error('เนื้อหาหรือชื่อยาวเกินกว่าจะวางลายเซ็น 3 คนในหน้าแรก โดยคงฟอนต์และขอบกระดาษ กรุณาตรวจข้อมูลก่อนพิมพ์');
        if (remaining) {
            newPage();
            append({node: remaining, kind: 'signatures'});
            if (!fitSignatures(remaining)) throw new Error('รายชื่อที่เหลือยาวหรือมีจำนวนมากเกินพื้นที่หน้า 2 กรุณาตรวจรายชื่อก่อนพิมพ์ โปรแกรมไม่ตัดชื่อหรือซ้อนข้อความ');
        }
        return numberPages(container);
    }
    function numberPages(container, startNumber = 1) {
        const pages = container.querySelectorAll('.letter-page, .page');
        pages.forEach((page, i) => {
            const number = startNumber + i;
            page.classList.toggle('has-second-page-marker', number === 2);
            page.querySelectorAll('[data-pdf-page-number]').forEach(label => { label.textContent = number; });
            page.querySelectorAll('.pdf-second-page-marker').forEach(marker => marker.remove());
            if (number === 2) {
                const marker = document.createElement('div');
                marker.className = 'pdf-second-page-marker';
                marker.textContent = '-2-';
                page.insertBefore(marker, page.firstChild);
            }
        });
        return pages.length;
    }
    async function renderPaginated(item, edits = {}) {
        const container = document.createElement('div');
        container.style.cssText = 'position:absolute;left:-10000px;top:0;width:816px;visibility:hidden;';
        container.innerHTML = buildHtml(item, edits);
        document.body.appendChild(container);
        try {
            if (document.fonts) await document.fonts.ready;
            await Promise.all([...container.querySelectorAll('img')].map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = img.onerror = resolve; })));
            const pageCount = paginate(container);
            for (const footer of container.querySelectorAll('.letter-footer')) {
                if (footer.scrollWidth > footer.clientWidth + 1) throw new Error('ข้อความ footer ของหนังสือยาวเกินขอบกระดาษ กรุณาย่อข้อความก่อนพิมพ์');
            }
            return {html: container.innerHTML, pageCount};
        } finally { container.remove(); }
    }
    function missingFields(item) {
        const fields = getFields(item);
        const labels = { department: 'หน่วยงาน', subject: 'เรื่องที่ดำเนินการ', installment: 'งวดงาน', completionDate: 'วันที่ดำเนินการแล้วเสร็จ', company: 'ชื่อบริษัทดำเนินการ', status: 'สถานะงาน', phoneExtension: 'เบอร์ต่อ', companyLetterNumber: 'เลขที่หนังสือบริษัท',
            companyLetterDate: 'วันที่บนหนังสือบริษัท', contractNumber: 'เลขที่สัญญา', contractDate: 'วันที่ลงนามในสัญญา' };
        const missing = Object.keys(labels).filter(key => !fields[key]).map(key => labels[key]);
        const personnel = getPersonnel(item);
        if (!personnel.chair) missing.push('ชื่อประธานตรวจรับ');
        if (!personnel.chiefs.length) missing.push('ชื่อหัวหน้าผู้ควบคุมงาน');
        if (!personnel.supervisors.length) missing.push('ชื่อผู้ควบคุมงาน');
        [...new Set([personnel.chair, ...personnel.chiefs, ...personnel.supervisors])].filter(name => name && !hasVerifiedPrefix(name))
            .forEach(name => missing.push('คำนำหน้า ' + name));
        return missing;
    }
    root.ReportLetter = { editText, buildHtml, getFields, getPersonnel, parsePeople, formatPersonName, hasVerifiedPrefix, paginate, renderPaginated, numberPages, footerHtml, missingFields, formatDate, formatInstallment, formatSubject, statusKind, escapeHtml, expandDepartment, departmentExtension };
    if (typeof module !== 'undefined' && module.exports) module.exports = root.ReportLetter;
}(typeof window !== 'undefined' ? window : globalThis));
