document.addEventListener('DOMContentLoaded', () => {
  const microlinksForm = document.getElementById('microlinks-form');
  const microlinksUrl = document.getElementById('mlf-url');
  const microlinksMicro = document.getElementById('mlf-micro');
  const microlinksLabel = document.getElementById('mlf-label');
  const microlinksPasscode = document.getElementById('mlf-passcode');
  const microlinksResult = document.getElementById('microlinks-result');
  const microlinksError = document.getElementById('microlinks-error');
  const microlinksCopy = document.getElementById('microlinks-copy');
  const microlinksShare = document.getElementById('microlinks-share');
  const microlinksWhat = document.getElementById('microlinks-what');
  const microlinksBtnAnother = document.getElementById('makeAnotherMicrolink');
  const microlinksCardForm = document.getElementById('cardForm');
  const microlinksCardFormReopener = document.getElementById('formCardReopener');
  const microlinksCardResult = document.getElementById('cardResult');
  const microlinksCardHistory = document.getElementById('cardHistory');
  const microlinksHistoryList = document.getElementById('microlinks-history-list');

  function createHistoryItem(micro, link, microUrl) {
    const item = document.createElement('li');
    item.classList.add('mlhist__item');
    item.innerHTML = `
      <a href="${microUrl}" target="_blank">
        <span class="mlhist__item__micro">${micro}</span>
        <span class="mlhist__item__link">${link}</span>
      </a>
    `;
    return item;
  }

  microlinksForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const fd = new FormData(microlinksForm);
    const textLink = fd.get('mlf-url');
    const paramLink = encodeURIComponent(textLink);

    microlinksResult.textContent = "http://microlinks.io/5HRT3N";
    microlinksResult.href = '';
    microlinksCopy.href = '';
    microlinksShare.href = '';
    microlinksWhat.href = '';

    microlinksCardForm.classList.add('hidden');
    microlinksCardResult.classList.remove('hidden');

    fetch(`/api/micro/${paramLink}`, {
      method: 'POST',
      body: fd,
    })
      .then((response) => response.text())
      .then((response) => {
        try {
          const resPayload = JSON.parse(response);
          if (!resPayload.success || !resPayload.data) {
            throw resPayload;
          }
          const microUrl = (resPayload.data || {}).microUrl || (location.href + '/MICRO').replace(/\/+/gi, '/');
          microlinksResult.textContent = microUrl;
          microlinksResult.href = microUrl;
          microlinksCopy.href = microUrl;
          microlinksShare.href = microUrl;
          microlinksWhat.href = microUrl;
          
          microlinksCardHistory.classList.remove('hidden');
          microlinksCardFormReopener.classList.remove('hidden');

          const historyItem = createHistoryItem(resPayload.data.micro, textLink, resPayload.data.microUrl);
          microlinksHistoryList.appendChild(historyItem);
        } catch (errData) {
          console.log({ errData });
          if (errData.error) {
            microlinksError.textContent = String(errData.error);
            return;
          }
          if (errData.message) {
            microlinksError.textContent = String(errData.message);
            return;
          }
          if (errData) {
            microlinksError.textContent = String(errData);
            return;
          }
          microlinksError.textContent = String('Something happened, microfication is weird today.');
        }
      });
  });

  microlinksMicro.addEventListener('input', () => {
    // TODO
  });

  microlinksBtnAnother.addEventListener('click', () => {
    microlinksCardFormReopener.classList.add('hidden');
    microlinksCardForm.classList.remove('hidden');
    microlinksCardResult.classList.add('hidden');
  });
});

// TODO: debounce the inputs on the MICRO input and check if it's available
// TODO: validate
// TODO: handle errors from backend
