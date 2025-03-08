// Set today's date as the default start date and generate calendar when the page loads
window.onload = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  document.getElementById("startDate").value = `${year}-${month}-${day}`;

  // Generate calendar with default values
  generateCustomCalendar();

  // Add event listeners to all input fields
  document
    .getElementById("startDate")
    .addEventListener("change", generateCustomCalendar);
  document
    .getElementById("numWeeks")
    .addEventListener("change", generateCustomCalendar);
  document
    .getElementById("videoInterval")
    .addEventListener("change", generateCustomCalendar);

  // Add event listeners to all skip day checkboxes
  const skipDayCheckboxes = document.querySelectorAll(
    '.skip-days-checkboxes input[type="checkbox"]'
  );
  skipDayCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", generateCustomCalendar);
  });
};

const generateCustomCalendar = () => {
  const startDateInput = document.getElementById("startDate").value;
  const numWeeksInput = document.getElementById("numWeeks").value;
  const videoIntervalInput = document.getElementById("videoInterval").value;

  // Get the skip days configuration
  const skipDays = {
    0: document.getElementById("skipSunday").checked, // Sunday is 0
    1: document.getElementById("skipMonday").checked, // Monday is 1
    2: document.getElementById("skipTuesday").checked, // Tuesday is 2
    3: document.getElementById("skipWednesday").checked, // Wednesday is 3
    4: document.getElementById("skipThursday").checked, // Thursday is 4
    5: document.getElementById("skipFriday").checked, // Friday is 5
    6: document.getElementById("skipSaturday").checked, // Saturday is 6
  };

  const startDate = new Date(startDateInput);
  const numWeeks = parseInt(numWeeksInput);
  const videoInterval = parseInt(videoIntervalInput);

  if (isNaN(startDate.getTime())) {
    alert("Please enter a valid start date in YYYY-MM-DD format.");
    return;
  }
  if (isNaN(numWeeks) || numWeeks <= 0) {
    alert("Please enter a valid number of weeks, greater than zero.");
    return;
  }
  if (isNaN(videoInterval) || videoInterval < 1 || videoInterval > 7) {
    alert("Please enter a valid Video Release Interval between 1 and 7 days.");
    return;
  }

  generateCalendar(startDate, numWeeks, videoInterval, skipDays);
};

const generateCalendar = (startDate, numWeeks, videoInterval, skipDays) => {
  const calendarContainer = document.getElementById("calendarContainer");
  const videoReleaseInfoDiv = document.getElementById("videoReleaseInfo");

  calendarContainer.innerHTML = ""; // Clear any previous calendar
  videoReleaseInfoDiv.innerHTML = ""; // Clear any previous info

  const calendarTable = document.createElement("table");
  calendarTable.id = "calendar";
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Table header - Now with abbreviated day names
  thead.innerHTML = `
          <tr>
              <th>W</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th>Sat</th>
              <th>Sun</th>
          </tr>
      `;
  calendarTable.appendChild(thead);

  // Clone the start date to avoid modifying the original
  const currentDate = new Date(startDate);

  // Calculate the end date (exactly numWeeks from start date)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (numWeeks * 7 - 1));

  // Calculate video release dates (every videoInterval days from start date, but starting from startDate + videoInterval)
  const videoReleaseDates = [];
  const manualReleaseDates = []; // Array to store manually added release dates

  let tempDate = new Date(startDate);
  tempDate.setDate(tempDate.getDate() + videoInterval); // Start from startDate + videoInterval

  // Function to find the next available day (not in skipDays)
  const findNextAvailableDay = (date) => {
    const newDate = new Date(date);
    while (skipDays[newDate.getDay()]) {
      newDate.setDate(newDate.getDate() + 1);
    }
    return newDate;
  };

  // Skip days according to skipDays configuration
  while (tempDate <= endDate) {
    // Check if the current day should be skipped
    if (skipDays[tempDate.getDay()]) {
      // Find the next available day
      tempDate = findNextAvailableDay(tempDate);
    }

    // Only add the date if it's still within our range
    if (tempDate <= endDate) {
      videoReleaseDates.push(new Date(tempDate));
    }

    // Move to the next release date
    tempDate.setDate(tempDate.getDate() + videoInterval);
  }

  // Helper function to check if a date is in the videoReleaseDates array
  const isVideoReleaseDate = (date, videoReleaseDates) => {
    return videoReleaseDates.some(
      (videoReleaseDate) =>
        date.getDate() === videoReleaseDate.getDate() &&
        date.getMonth() === videoReleaseDate.getMonth() &&
        date.getFullYear() === videoReleaseDate.getFullYear()
    );
  };

  // Helper function to check if a date is in the manualReleaseDates array
  const isManualReleaseDate = (date, manualReleaseDates) => {
    return manualReleaseDates.some(
      (manualReleaseDate) =>
        date.getDate() === manualReleaseDate.getDate() &&
        date.getMonth() === manualReleaseDate.getMonth() &&
        date.getFullYear() === manualReleaseDate.getFullYear()
    );
  };

  // Function to toggle a date as a video release date
  const toggleVideoReleaseDate = (
    date,
    videoReleaseDates,
    manualReleaseDates
  ) => {
    // Check if the date is already a calculated video release date
    const calculatedIndex = videoReleaseDates.findIndex(
      (releaseDate) =>
        date.getDate() === releaseDate.getDate() &&
        date.getMonth() === releaseDate.getMonth() &&
        date.getFullYear() === releaseDate.getFullYear()
    );

    // Check if the date is in the manual release dates
    const manualIndex = manualReleaseDates.findIndex(
      (releaseDate) =>
        date.getDate() === releaseDate.getDate() &&
        date.getMonth() === releaseDate.getMonth() &&
        date.getFullYear() === releaseDate.getFullYear()
    );

    // If it's a calculated release date
    if (calculatedIndex !== -1) {
      // We don't want to change the color of calculated dates
      // Just toggle its state (on/off)
      if (manualIndex !== -1) {
        // If it's also in manual list, remove it (turning it back to calculated only)
        manualReleaseDates.splice(manualIndex, 1);
        return { isReleaseDate: true, isCalculated: true, isManual: false };
      } else {
        // If it's not in manual list, add it to manual list to mark it as "off"
        manualReleaseDates.push(new Date(date));
        return { isReleaseDate: false, isCalculated: true, isManual: true };
      }
    }
    // If it's only a manual release date (not calculated)
    else if (manualIndex !== -1) {
      // Remove it from the manual release dates
      manualReleaseDates.splice(manualIndex, 1);
      return { isReleaseDate: false, isCalculated: false, isManual: false };
    }
    // If it's not a release date at all
    else {
      // Add it to the manual release dates
      manualReleaseDates.push(new Date(date));
      // Sort the dates chronologically
      manualReleaseDates.sort((a, b) => a - b);
      return { isReleaseDate: true, isCalculated: false, isManual: true };
    }
  };

  // Function to update the video release info
  const updateVideoReleaseInfo = () => {
    // Create a message about skipped days
    const skippedDayNames = [];
    for (let i = 0; i < 7; i++) {
      if (skipDays[i]) {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        skippedDayNames.push(dayNames[i]);
      }
    }

    let skipDaysMessage = "";
    if (skippedDayNames.length > 0) {
      skipDaysMessage = `<p class="smaller-note">Note: Video releases scheduled for ${skippedDayNames.join(
        ", "
      )} are automatically moved to the next available day.</p>`;
    }

    // Format the end date to match the browser's locale format
    const endDateFormatted = endDate.toLocaleDateString();

    // Calculate total number of active release dates
    // (calculated dates that aren't manually toggled off + manually added dates)
    let totalReleaseDates = 0;

    // Count calculated dates that aren't manually toggled off
    for (const calcDate of videoReleaseDates) {
      if (!isManualReleaseDate(calcDate, manualReleaseDates)) {
        totalReleaseDates++;
      }
    }

    // Count manually added dates (that aren't already calculated)
    for (const manualDate of manualReleaseDates) {
      if (!isVideoReleaseDate(manualDate, videoReleaseDates)) {
        totalReleaseDates++;
      }
    }

    videoReleaseInfoDiv.innerHTML = `
      <p>End Date: <strong>${endDateFormatted}</strong></p>
      <p>Number of Video Releases: <strong>${totalReleaseDates}</strong></p>
      ${skipDaysMessage}
      <p class="smaller-note">Tip: Click on a day to toggle it as a video release day.</p>
    `;
  };

  // Initial update of video release info
  updateVideoReleaseInfo();

  // Function to create a day cell with click handler
  const createDayCell = (date) => {
    const dayCell = document.createElement("td");
    dayCell.textContent = date.getDate();

    // Função auxiliar para comparar datas (ignorando horas/minutos/segundos)
    const isSameDay = (date1, date2) => {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    };

    // Verificar se é a data inicial ou final
    if (isSameDay(date, startDate)) {
      dayCell.className = "start-date";
      console.log("Applied start-date class to:", date.toDateString());
    } else if (isSameDay(date, endDate)) {
      dayCell.className = "end-date";
    } else {
      // Resto do código para outras datas
      dayCell.classList.add("clickable");

      // Check if it's a calculated video release date
      const isCalculatedRelease = isVideoReleaseDate(date, videoReleaseDates);

      // Check if it's a manually added/removed release date
      const isManuallyToggled = isManualReleaseDate(date, manualReleaseDates);

      // Apply the appropriate class based on the state
      if (isCalculatedRelease && !isManuallyToggled) {
        dayCell.classList.add("video-release-date");
      } else if (isCalculatedRelease && isManuallyToggled) {
        dayCell.classList.add("disabled-calculated-release");
      } else if (!isCalculatedRelease && isManuallyToggled) {
        dayCell.classList.add("manual-release-date");
      }

      // Add click handler
      dayCell.addEventListener("click", () => {
        // Toggle the date as a video release date
        const result = toggleVideoReleaseDate(
          new Date(date),
          videoReleaseDates,
          manualReleaseDates
        );

        // Update the cell's appearance
        dayCell.classList.remove(
          "video-release-date",
          "manual-release-date",
          "disabled-calculated-release"
        );

        if (result.isReleaseDate) {
          if (result.isCalculated) {
            dayCell.classList.add("video-release-date");
          } else if (result.isManual) {
            dayCell.classList.add("manual-release-date");
          }
        } else if (result.isCalculated && result.isManual) {
          dayCell.classList.add("disabled-calculated-release");
        }

        updateVideoReleaseInfo();
      });
    }

    // Highlight the current date if it's today
    const today = new Date();
    if (isSameDay(date, today)) {
      dayCell.classList.add("current-date");
    }

    // Add class for weekends
    const dayOfWeek = date.getDay();
    const dayOfWeekForStyle = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (dayOfWeekForStyle >= 5) {
      // Saturday and Sunday
      dayCell.classList.add("weekend");
    }

    return dayCell;
  };

  // Get the day of the week for the start date (0 = Sunday, 1 = Monday, etc.)
  // Convert to Monday-based week (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
  let startDayOfWeek = currentDate.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Calculate the week number
  let weekNumber = getWeekNumber(currentDate);

  // Create the first row
  let weekRow = document.createElement("tr");

  // Add week number cell
  const weekNumberCell = document.createElement("td");
  weekNumberCell.textContent = weekNumber;
  weekRow.appendChild(weekNumberCell);

  // Add empty cells for days before the start date
  for (let i = 0; i < startDayOfWeek; i++) {
    const emptyCell = document.createElement("td");
    weekRow.appendChild(emptyCell);
  }

  // Fill in the remaining days of the first week
  for (let i = startDayOfWeek; i < 7; i++) {
    const dayCell = createDayCell(new Date(currentDate));
    weekRow.appendChild(dayCell);
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day

    // If we've reached the end date, break out of the loop
    if (
      currentDate.getDate() > endDate.getDate() &&
      currentDate.getMonth() >= endDate.getMonth() &&
      currentDate.getFullYear() >= endDate.getFullYear()
    ) {
      break;
    }
  }
  tbody.appendChild(weekRow);

  // Generate the remaining weeks
  while (
    currentDate.getDate() <= endDate.getDate() ||
    currentDate.getMonth() < endDate.getMonth() ||
    currentDate.getFullYear() < endDate.getFullYear()
  ) {
    weekRow = document.createElement("tr");

    // Calculate the week number for this row
    weekNumber = getWeekNumber(currentDate);

    // Add week number cell
    const weekNumberCell = document.createElement("td");
    weekNumberCell.textContent = weekNumber;
    weekRow.appendChild(weekNumberCell);

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      // If we've gone past the end date, add empty cells
      if (
        currentDate.getDate() > endDate.getDate() &&
        currentDate.getMonth() >= endDate.getMonth() &&
        currentDate.getFullYear() >= endDate.getFullYear()
      ) {
        const emptyCell = document.createElement("td");
        weekRow.appendChild(emptyCell);
        continue;
      }

      const dayCell = createDayCell(new Date(currentDate));
      weekRow.appendChild(dayCell);
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
    tbody.appendChild(weekRow);

    // If we've gone past the end date, break out of the loop
    if (
      currentDate.getDate() > endDate.getDate() &&
      currentDate.getMonth() >= endDate.getMonth() &&
      currentDate.getFullYear() >= endDate.getFullYear()
    ) {
      break;
    }
  }

  calendarTable.appendChild(tbody);

  // Create and add the legend
  const createLegend = () => {
    const legendContainer = document.createElement("div");
    legendContainer.className = "calendar-legend";

    // Get the actual colors from the CSS
    const getComputedStyle = (className) => {
      const tempElement = document.createElement("div");
      tempElement.className = className;
      document.body.appendChild(tempElement);
      const style = window.getComputedStyle(tempElement);
      const backgroundColor = style.backgroundColor;
      document.body.removeChild(tempElement);
      return backgroundColor;
    };

    const legendItems = [
      { class: "start-date", label: "Start Date" },
      { class: "end-date", label: "End Date" },
      { class: "video-release-date", label: "Calculated Release" },
      { class: "manual-release-date", label: "Additional Release" },
      { class: "disabled-calculated-release", label: "Canceled Release" },
      { class: "", label: "No Action" },
    ];

    legendItems.forEach((item) => {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";

      const colorBox = document.createElement("div");
      colorBox.className = "legend-color";

      // Apply the actual style from the calendar
      if (item.class) {
        colorBox.style.backgroundColor = getComputedStyle(item.class);
      } else {
        colorBox.style.backgroundColor = "transparent";
        colorBox.style.border = "1px solid #ddd";
      }

      const label = document.createElement("span");
      label.textContent = item.label;

      legendItem.appendChild(colorBox);
      legendItem.appendChild(label);
      legendContainer.appendChild(legendItem);
    });

    return legendContainer;
  };

  calendarTable.appendChild(tbody);
  calendarContainer.appendChild(calendarTable);

  // Adicione a legenda depois do calendário
  calendarContainer.appendChild(createLegend());
};

// Helper function to get the ISO week number
const getWeekNumber = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};
