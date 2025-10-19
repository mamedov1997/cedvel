// 4-cü ADDIMDA GOOGLE APPS SCRIPT-DƏN ALDIĞINIZ DEPLOY URL-İ BURAYA YAPIŞDIRIN
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzZgaZ1EUIT36_IF7r-CSLW9Qxc-l372tKDXHW1m6V2OqPK1H_Mo542I2F8mkyV-OaHHA/exec"; 

const form = document.getElementById('dataForm');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchFaktura');
const resultsDiv = document.getElementById('searchResults');

// Formu göndərmə (Yaddaşda Saxla)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    setLoading(saveButton, true);
    showStatus('Məlumat göndərilir...', 'loading');

    const formData = {
        faktura: document.getElementById('faktura').value,
        musteriKod: document.getElementById('musteriKod').value,
        musteriAd: document.getElementById('musteriAd').value,
        muqavileTarixi: document.getElementById('muqavileTarixi').value,
        imzalanmaTarixi: document.getElementById('imzalanmaTarixi').value,
        imzalayanSexs: document.getElementById('imzalayanSexs').value
    };

    fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script üçün adətən 'no-cors' lazım olur
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        // 'no-cors' istifadə etdikdə ətraflı cavab ala bilmirik,
        // ona görə də uğurlu olduğunu güman edirik.
        showStatus('Məlumat uğurla yadda saxlandı!', 'success');
        form.reset();
    })
    .catch(error => {
        console.error('Xəta:', error);
        showStatus('Xəta baş verdi. Məlumat saxlanmadı.', 'error');
    })
    .finally(() => {
        setLoading(saveButton, false);
    });
});

// Axtarış Düyməsi
searchButton.addEventListener('click', () => {
    const fakturaValue = searchInput.value.trim();
    if (!fakturaValue) {
        showStatus('Axtarış üçün faktura nömrəsi daxil edin.', 'error', resultsDiv);
        return;
    }

    setLoading(searchButton, true);
    resultsDiv.innerHTML = '<div class="status-message show">Axtarılır...</div>';

    const searchUrl = `${WEB_APP_URL}?action=search&faktura=${encodeURIComponent(fakturaValue)}`;

    fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            displayResults(data.data);
        } else {
            showStatus(data.message || 'Məlumat tapılmadı.', 'error', resultsDiv);
        }
    })
    .catch(error => {
        console.error('Axtarış xətası:', error);
        showStatus('Axtarış zamanı xəta baş verdi.', 'error', resultsDiv);
    })
    .finally(() => {
        setLoading(searchButton, false);
    });
});

// Nəticələri göstərmək
function displayResults(results) {
    if (results.length === 0) {
        showStatus('Bu faktura nömrəsinə uyğun məlumat tapılmadı.', 'error', resultsDiv);
        return;
    }

    resultsDiv.innerHTML = ''; // Köhnə nəticələri təmizlə
    results.forEach(row => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `
            <p><span>Faktura:</span> ${row.faktura}</p>
            <p><span>Müştəri:</span> ${row.musteriKod} - ${row.musteriAd}</p>
            <p><span>Müqavilə tarixi:</span> ${new Date(row.muqavileTarixi).toLocaleDateString()}</p>
            <p><span>İmzalanma tarixi:</span> ${new Date(row.imzalanmaTarixi).toLocaleDateString()}</p>
            <p><span>İmzalayan:</span> ${row.imzalayanSexs}</p>
        `;
        resultsDiv.appendChild(item);
    });
}

// Status mesajları
function showStatus(message, type, element = statusDiv) {
    element.innerHTML = message;
    element.className = `status-message ${type} show`;
    
    if(element === statusDiv) {
        setTimeout(() => {
            element.className = 'status-message';
        }, 3000);
    }
}

// Yükləmə animasiyası
function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.classList.remove('loading');
    }
}
