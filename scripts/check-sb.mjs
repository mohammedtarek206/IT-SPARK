async function checkSafeBrowsing() {
    try {
        const url = 'https://transparencyreport.google.com/transparencyreport/api/v3/safebrowsing/status?site=https://www.itsparkacademy.com';
        const res = await fetch(url);
        const text = await res.text();
        console.log('Safe Browsing Status response:');
        console.log(text);
    } catch (e) {
        console.error('Error fetching Safe Browsing status:', e.message);
    }
}

checkSafeBrowsing();
