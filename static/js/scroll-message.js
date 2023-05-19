window.addEventListener('load', function () {
  const elm = document.getElementById('message-area');
  const bottom = elm.scrollHeight - elm.clientHeight;
  elm.scrollTop = bottom;
});
