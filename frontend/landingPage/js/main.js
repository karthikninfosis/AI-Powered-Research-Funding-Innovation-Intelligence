<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", function () {

    const exploreButton = document.getElementById("exploreIntelligence");

    if (exploreButton) {
        exploreButton.addEventListener("click", function () {
            window.location.href = "funding.html";
        });
    }

    const startButton = document.getElementById("startExploring");

    if (startButton) {
        startButton.addEventListener("click", function () {
            window.location.href = "funding.html";
        });
    }

});
=======
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
>>>>>>> 236792483dc5e29de5d5850d3c985e871938f9c0
