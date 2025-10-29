// Simple data for demonstration. Replace or expand with official data.
const mocData = [
  {
    name: "Jane Doe",
    officeNumber: "123",
    building: "Rayburn House Office Building",
    mapImage: "images/rayburn-floor-map.png",
    starPosition: { top: "40%", left: "60%" },
    description: "Office located on the 2nd floor near the central elevator bank."
  },
  {
    name: "John Smith",
    officeNumber: "456",
    building: "Longworth House Office Building",
    mapImage: "images/longworth-floor-map.png",
    starPosition: { top: "65%", left: "30%" },
    description: "Office located on the 3rd floor at the southwest corner."
  },
  {
    name: "Maria Lee",
    officeNumber: "789",
    building: "Hart Senate Office Building",
    mapImage: "images/hart-floor-map.png",
    starPosition: { top: "20%", left: "50%" },
    description: "Office located near the north atrium entrance."
  }
];

// Hook up HTML elements
const memberNameInput = document.getElementById("memberNameInput");
const searchButton = document.getElementById("searchButton");
const errorMessage = document.getElementById("errorMessage");
const resultsSection = document.getElementById("resultsSection");
const memberNameDisplay = document.getElementById("memberNameDisplay");
const officeNumberDisplay = document.getElementById("officeNumberDisplay");
const buildingMapImage = document.getElementById("buildingMapImage");
const starOverlay = document.getElementById("starOverlay");
const buildingDescription = document.getElementById("buildingDescription");

function findMember(memberName) {
  const normalizedInput = memberName.trim().toLowerCase();
  return mocData.find((entry) => entry.name.toLowerCase() === normalizedInput);
}

function showResults(mocEntry) {
  errorMessage.classList.add("hidden");
  resultsSection.classList.remove("hidden");

  memberNameDisplay.textContent = mocEntry.name;
  officeNumberDisplay.textContent = mocEntry.officeNumber;
  buildingMapImage.src = mocEntry.mapImage;
  buildingMapImage.alt = `${mocEntry.building} floor map`;

  starOverlay.style.display = "block";
  starOverlay.style.top = mocEntry.starPosition.top;
  starOverlay.style.left = mocEntry.starPosition.left;

  buildingDescription.textContent = `${mocEntry.building}: ${mocEntry.description}`;
}

function showError(message) {
  resultsSection.classList.add("hidden");
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

// Event handler for searching
searchButton.addEventListener("click", () => {
  const inputValue = memberNameInput.value;
  if (!inputValue.trim()) {
    showError("Please enter a Member of Congress name.");
    return;
  }

  const result = findMember(inputValue);
  if (result) {
    showResults(result);
  } else {
    showError(`No office information found for "${inputValue}". Please check the name or update your data.`);
  }
});

// Allow pressing Enter to search
memberNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchButton.click();
  }
});
