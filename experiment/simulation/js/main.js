document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container');
  const messageContainer = document.getElementById('message-container');
  const startButton = document.getElementById('start-button');
  const resetButton = document.getElementById('reset-button');

  const searchDisplays = 10;
  const minItems = 30;
  const maxItems = 200;
  const itemsStep = 5;
  const uprightTColor = 'orange';
  let searchTimeout;

  let currentTrial = 0;
  let simulationStarted = false;
  let startTime;

  // Track separate search times
  let singletonSearchTimes = [];
  let conjunctiveSearchTimes = [];
  let correctSelections = 0;
  let timeoutTrials = 0;

  // Ensure container dimensions are set
  function setContainerDimensions() {
    gameContainer.style.width = '80vw';
    gameContainer.style.height = '50vh';
    gameContainer.style.position = 'relative';
    gameContainer.style.border = '1px solid #ccc';
    gameContainer.style.margin = '0 auto';
    gameContainer.style.overflow = 'hidden';
    gameContainer.style.backgroundColor = '#000000';
  }

  // Create a single search display
  function createSearchDisplay(itemsCount) {
    gameContainer.innerHTML = '';
    const colors = ['orange', 'blue'];
    const orientations = ['upright', 'inverted'];
    const items = [];

    // Decide if the trial contains an upright orange T
    const trialHasTarget = Math.random() < 0.75;

    // Randomize whether it's a singleton or conjunctive search
    const isSingletonSearch = Math.random() < 0.5;

    // Add the target T if this trial has one
    if (trialHasTarget) {
      const target = createTLetter(uprightTColor, 'upright');
      items.push(target);
      gameContainer.appendChild(target);
    }

    // Add distractors based on search type
    for (let i = trialHasTarget ? 1 : 0; i < itemsCount; i++) {
      const color = isSingletonSearch ? 'blue' : colors[Math.floor(Math.random() * colors.length)];
      let orientation = isSingletonSearch ? 'upright' : orientations[Math.floor(Math.random() * orientations.length)];
      orientation = (color == 'orange' && !trialHasTarget ? 'inverted' : orientation);
      const tLetter = createTLetter(color, orientation);
      items.push(tLetter);
      gameContainer.appendChild(tLetter);
    }

    shuffleArray(items); // Shuffle items visually
    positionItemsWithoutOverlap(items);
    gameContainer.dataset.searchType = isSingletonSearch ? 'singleton' : 'conjunctive';
    gameContainer.dataset.hasTarget = trialHasTarget;
    startTime = Date.now();

    // Start timeout for 5 seconds
    searchTimeout = setTimeout(() => handleTimeout(), 5000);
  }

  // Handle timeout if no response in 5 seconds
  function handleTimeout() {
    const trialHasTarget = gameContainer.dataset.hasTarget === "true";
    messageContainer.innerHTML = trialHasTarget
      ? `Time's up! You missed the target.`
      : `Time's up! Correct, no target was present.`;

    if (!trialHasTarget) {
      correctSelections++;
    } else {
      timeoutTrials++;
    }

    setTimeout(startNewTrial, 1000);
  }

  // Create a T letter
  function createTLetter(color, orientation) {
    const tLetter = document.createElement('span');
    tLetter.className = 't-letter';
    tLetter.textContent = 'T';
    tLetter.style.color = color;
    tLetter.style.fontSize = '25px';
    tLetter.style.position = 'absolute';
    tLetter.dataset.orientation = orientation;

    if (orientation === 'inverted') {
      tLetter.style.transform = 'rotate(180deg)';
    }

    return tLetter;
  }

  // Position items without overlap
  function positionItemsWithoutOverlap(items) {
    const placedPositions = [];
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;

    items.forEach(item => {
      let left, top, positionValid;

      do {
        left = Math.random() * (containerWidth - 30);
        top = Math.random() * (containerHeight - 30);
        positionValid = !placedPositions.some(pos => {
          return Math.abs(pos.left - left) < 30 && Math.abs(pos.top - top) < 30;
        });
      } while (!positionValid);

      placedPositions.push({ left, top });
      item.style.left = `${left}px`;
      item.style.top = `${top}px`;
    });
  }

  // Shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Start simulation
  function startSimulation() {
    clearTimeout(searchTimeout);
    setContainerDimensions();
    simulationStarted = true;
    currentTrial = 0;
    singletonSearchTimes = [];
    conjunctiveSearchTimes = [];
    correctSelections = 0;
    timeoutTrials = 0;
    startButton.style.display = 'none';
    resetButton.style.display = 'none';
    messageContainer.innerHTML = '';
    startNewTrial();
  }

  // Start new trial
  function startNewTrial() {
    if (currentTrial < searchDisplays) {
      currentTrial++;
      const itemsCount = minItems + (currentTrial - 1) * itemsStep;
      messageContainer.innerHTML = `Trial ${currentTrial}: Find the upright orange "T"`;
      setTimeout(() => createSearchDisplay(itemsCount), 400);
    } else {
      endSimulation();
    }
  }

  // Check user response
  document.addEventListener('keydown', (event) => {
    if (simulationStarted && event.key === ' ') {
      clearTimeout(searchTimeout);
      checkUserResponse();
    }
  });

  function checkUserResponse() {
    const endTime = Date.now();
    const searchTime = (endTime - startTime) / 1000;
    const trialHasTarget = gameContainer.dataset.hasTarget === "true";

    if (trialHasTarget) {
      const searchType = gameContainer.dataset.searchType;
      if (searchType === 'singleton') {
        singletonSearchTimes.push(searchTime);
      } else {
        conjunctiveSearchTimes.push(searchTime);
      }
      correctSelections++;
      messageContainer.innerHTML = `Correct! Time: ${searchTime.toFixed(2)}s`;
    } else {
      messageContainer.innerHTML = `Incorrect! No target was present.`;
    }

    setTimeout(startNewTrial, 1000);
  }

  // End simulation
  function endSimulation() {
    simulationStarted = false;

    const averageSingletonTime = calculateAverage(singletonSearchTimes);
    const averageConjunctiveTime = calculateAverage(conjunctiveSearchTimes);

    messageContainer.innerHTML = `
      Simulation Completed!<br>
      Correct Selections: ${correctSelections} / ${searchDisplays}<br>
      Timeout Trials: ${timeoutTrials}<br>
      Singleton Average Time: ${averageSingletonTime.toFixed(2)}s<br>
      Conjunctive Average Time: ${averageConjunctiveTime.toFixed(2)}s
    `;
    resetButton.style.display = 'block';
  }

  function calculateAverage(times) {
    if (times.length === 0) return 0;
    const total = times.reduce((sum, time) => sum + time, 0);
    return total / times.length;
  }

  // Reset simulation
  function resetSimulation() {
    simulationStarted = false;
    currentTrial = 0;
    singletonSearchTimes = [];
    conjunctiveSearchTimes = [];
    correctSelections = 0;
    timeoutTrials = 0;
    gameContainer.innerHTML = '';
    messageContainer.innerHTML = 'Results here';
    startButton.style.display = 'block';
    resetButton.style.display = 'none';
  }

  // Event listeners
  startButton.addEventListener('click', startSimulation);
  resetButton.addEventListener('click', resetSimulation);

  // Set container dimensions on load
  setContainerDimensions();
});
