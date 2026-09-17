document.addEventListener("DOMContentLoaded", () => {
  const goToFunding = () => {
    window.location.href = "funding.html";
  };

  document.getElementById("exploreIntelligence")?.addEventListener("click", goToFunding);
  document.getElementById("startExploring")?.addEventListener("click", goToFunding);
});