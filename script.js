const filesInput = document.getElementById('files');
const companyInput = document.getElementById('company');
const jobInput = document.getElementById('job');
const resultDiv = document.getElementById('result');

// ✅ FIX: pdf worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

// Extract PDF text
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    text += pageText + '\n';
  }

  return text;
}

// Display result
function displayResult(data) {
  resultDiv.innerHTML = `
    <h2>Score: ${data.score}%</h2>
    <p>${data.summary}</p>
    <h3>Skills</h3>
  `;

  for (const [skill, value] of Object.entries(data.skills)) {
    const p = document.createElement('p');
    p.innerText = `${skill}: ${value}%`;
    resultDiv.appendChild(p);
  }
}

// Main analyze function
async function analyze() {
  const file = filesInput.files[0];

  if (!file) {
    alert("Upload a PDF first");
    return;
  }

  if (!jobInput.value) {
    alert("Paste job description");
    return;
  }

  resultDiv.innerHTML = "Analyzing... ⏳";

  try {
    const text = await extractTextFromPDF(file);

    const res = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        company: companyInput.value,
        job: jobInput.value
      })
    });

    const data = await res.json();
    displayResult(data);

  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "Error analyzing resume ❌";
  }
}

// ✅ FIX: button event
document.getElementById('analyzeBtn')
  .addEventListener('click', analyze);

// UX improvement
filesInput.addEventListener('change', () => {
  if (filesInput.files.length) {
    document.querySelector('.file-label').innerText =
      filesInput.files[0].name;
  }
});