document.addEventListener('DOMContentLoaded', async () => {
  await DB.load();
  Auth.init();
});