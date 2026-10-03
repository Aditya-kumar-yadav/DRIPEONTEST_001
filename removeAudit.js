const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');
const startIdx = content.indexOf('{activeTab === \'audit\' && (');
const endStr = '{/* VIEW TAB I: CUSTOMER INQUIRIES CONTROL PANEL */}';
const endIdx = content.indexOf(endStr);
if(startIdx !== -1 && endIdx !== -1) {
    fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', content.substring(0, startIdx) + content.substring(endIdx));
    console.log('Successfully removed audit section');
} else {
    console.log('Could not find indices', startIdx, endIdx);
}
