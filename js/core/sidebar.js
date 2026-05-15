document.addEventListener('DOMContentLoaded', function () {
  const currentPage = window.location.pathname.split('/').pop();

  const links = document.querySelectorAll('.sidebar a');

  links.forEach((link) => {
    const linkPage = link.getAttribute('href');
    if (!linkPage) return;

    const cleanLink = linkPage.split('/').pop();

    if (cleanLink === currentPage) {
      link.classList.add('active');
    }
  });
});
