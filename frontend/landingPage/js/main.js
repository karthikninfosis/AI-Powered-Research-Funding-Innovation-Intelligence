document.addEventListener("DOMContentLoaded", () => {
  const goToFunding = () => {
    window.location.href = "funding.html";
  };

  document.getElementById("exploreIntelligence")?.addEventListener("click", goToFunding);
  document.getElementById("startExploring")?.addEventListener("click", goToFunding);

  // Keep the original landing-page navigation behavior.
  document.querySelectorAll('a[href="#login"]').forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      alert("Sign In will be connected to authentication in the next phase.");
    });
  });
});
