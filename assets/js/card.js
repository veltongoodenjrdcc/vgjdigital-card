(function () {
  var link = document.getElementById('saveCardLink');
  var modal = document.getElementById('dlModal');
  var backdrop = document.getElementById('dlBackdrop');
  var closeBtn = document.getElementById('dlClose');
  var doneBtn = document.getElementById('dlDone');

  if (!link || !modal || !backdrop || !closeBtn || !doneBtn) return;

  function openModal() {
    modal.removeAttribute('hidden');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
      });
    });
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.addEventListener('transitionend', function () {
      modal.setAttribute('hidden', '');
    }, { once: true });
  }

  link.addEventListener('click', function () {
    setTimeout(openModal, 700);
  });
  backdrop.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  doneBtn.addEventListener('click', closeModal);
})();
