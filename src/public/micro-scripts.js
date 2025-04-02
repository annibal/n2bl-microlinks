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

  microlinksForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const fd = new FormData(microlinksForm);

    microlinksCopy.href = '';
    microlinksShare.href = '';
    microlinksWhat.href = '';

    fetch('/api/micro', {
      method: 'POST',
      body: fd,
    })
      .then((response) => response.text())
      .then((data) => {
        if (data.includes('\n')) {
          microlinksError.textContent = data;
        } else {
          microlinksResult.textContent = data.micro;
          microlinksCopy.href = `https://micro.link/${data.micro}`;
          microlinksShare.href = `https://micro.link/${data.micro}`;
          microlinksWhat.href = `https://micro.link/${data.micro}`;
        }
      });
  });



  microlinksMicro.addEventListener('input', () => {
    // TODO
  });
});

// TODO: debounce the inputs on the MICRO input and check if it's available
// TODO: validate
// TODO: handle errors from backend