document.addEventListener('DOMContentLoaded', () => {
  const gameContainer = document.getElementById('game-container');
  const messageContainer = document.getElementById('message-container');
  const startButton = document.getElementById('start-button');
  const searchDisplays = 10;
  const minItems = 5;
  const maxItems = 20;
  const itemsStep = 5;
  const uprightTColor = 'orange';

  let currentDisplay = 0;
  let searchTimeout;
  let simulationStarted = false;
  let correctCount = 0;
  let totalSearchTime = 0;
  let startTime;
  let trialCount = 0;
  let searchTimesByItems = {};

  function createSearchDisplay(itemsCount) {
    gameContainer.innerHTML = '';
    const colors = ['blue', 'orange'];
    const tLetters = [];
  
    // Number of total upright orange T's (at most 2)
    const totalUprightOrangeTs = Math.min(2, Math.floor(itemsCount / 4));
  
    // Number of total blue T's (upright and inverted combined)
    const totalBlueTs = Math.floor(itemsCount / 2);
  
    // Number of upright blue T's
    const uprightBlueTs = Math.floor(totalBlueTs / 2);
  
    // Number of inverted blue T's
    const invertedBlueTs = totalBlueTs - uprightBlueTs;
  
    // Function to check for collision between two elements
    function isColliding(element1, element2) {
      const rect1 = element1.getBoundingClientRect();
      const rect2 = element2.getBoundingClientRect();
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    }
  
    // Function to check for collision with existing letters
    function isCollidingWithLetters(tLetter) {
      for (const existingLetter of tLetters) {
        if (existingLetter !== tLetter && isColliding(existingLetter, tLetter)) {
          return true;
        }
      }
      return false;
    }
  
    // Add upright orange T's
    for (let i = 0; i < totalUprightOrangeTs; i++) {
      const tLetter = document.createElement('span');
      tLetter.className = 't-letter';
      tLetter.textContent = 'T';
      tLetter.style.color = 'orange';
      let left, top;
      do {
        left = Math.floor(Math.random() * (gameContainer.clientWidth - 30));
        top = Math.floor(Math.random() * (gameContainer.clientHeight - 30));
        tLetter.style.left = `${left}px`;
        tLetter.style.top = `${top}px`;
      } while (isCollidingWithLetters(tLetter));
      gameContainer.appendChild(tLetter);
      tLetters.push(tLetter);
    }
  
    // Add upright blue T's
    for (let i = 0; i < uprightBlueTs; i++) {
      const tLetter = document.createElement('span');
      tLetter.className = 't-letter';
      tLetter.textContent = 'T';
      tLetter.style.color = 'blue';
      let left, top;
      do {
        left = Math.floor(Math.random() * (gameContainer.clientWidth - 30));
        top = Math.floor(Math.random() * (gameContainer.clientHeight - 30));
        tLetter.style.left = `${left}px`;
        tLetter.style.top = `${top}px`;
      } while (isCollidingWithLetters(tLetter));
      gameContainer.appendChild(tLetter);
      tLetters.push(tLetter);
    }
  
    // Add inverted orange T's
    for (let i = 0; i < itemsCount - totalUprightOrangeTs - totalBlueTs; i++) {
      const tLetter = document.createElement('span');
      tLetter.className = 't-letter';
      tLetter.textContent = 'T';
      tLetter.style.color = 'orange';
      tLetter.style.transform = 'rotate(180deg)';
      let left, top;
      do {
        left = Math.floor(Math.random() * (gameContainer.clientWidth - 30));
        top = Math.floor(Math.random() * (gameContainer.clientHeight - 30));
        tLetter.style.left = `${left}px`;
        tLetter.style.top = `${top}px`;
      } while (isCollidingWithLetters(tLetter));
      gameContainer.appendChild(tLetter);
      tLetters.push(tLetter);
    }
  
    // Add inverted blue T's
    for (let i = 0; i < invertedBlueTs; i++) {
      const tLetter = document.createElement('span');
      tLetter.className = 't-letter';
      tLetter.textContent = 'T';
      tLetter.style.color = 'blue';
      tLetter.style.transform = 'rotate(180deg)';
      let left, top;
      do {
        left = Math.floor(Math.random() * (gameContainer.clientWidth - 30));
        top = Math.floor(Math.random() * (gameContainer.clientHeight - 30));
        tLetter.style.left = `${left}px`;
        tLetter.style.top = `${top}px`;
      } while (isCollidingWithLetters(tLetter));
      gameContainer.appendChild(tLetter);
      tLetters.push(tLetter);
    }
    shuffle(tLetters);
  }
  
  // Helper function to shuffle an array
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Function to start the simulation
  function startSimulation() {
    trialCount = 0; // Reset the trial count
    correctCount = 0;
    totalSearchTime = 0;
    searchTimesByItems = {}; // Reset search times for each item count
    simulationStarted = true;
    startButton.style.display = 'none';
    startNewDisplay();
  }

  // Function to start a new search display after some time
  function startNewDisplay() {
    clearTimeout(searchTimeout);
    if (trialCount < searchDisplays) {
      trialCount++; // Increment the trial count
      currentDisplay++;
      const itemsCount = minItems + (currentDisplay - 1) * itemsStep;
      createSearchDisplay(itemsCount);
      startTime = Date.now(); // Record the start time for this display
      searchTimeout = setTimeout(() => {
        showMessage('Wrong! Next search...');
        setTimeout(startNewDisplay, 1000); // Next search display after 1 second
      }, 5000); // Wait for 5 seconds before auto-proceeding to the next search
    } else {
      showMessage('Simulation completed!');
      calculateAverageTimes();
      gameContainer.innerHTML = '';
      simulationStarted = false;
      startButton.style.display = 'block';
    }
  }

  // Function to calculate search time based on the number of items
  function calculateSearchTime(itemsCount) {
    const baseSearchTime = 5000; // 5 seconds
    const maxItemsForBaseTime = 20;
    const itemsAboveMax = itemsCount - maxItemsForBaseTime;
    if (itemsAboveMax <= 0) {
      return baseSearchTime;
    } else {
      return baseSearchTime + itemsAboveMax * 200; // Additional 200ms for each item above the max
    }
  }

  function calculateAverageTimes() {
    const averageTimes = {};
    for (let items = minItems; items <= maxItems; items += itemsStep) {
      const times = searchTimesByItems[items];
      if (times && times.length > 0) {
        const total = times.reduce((acc, time) => acc + time, 0);
        averageTimes[items] = total / times.length;
      }
    }
  
    // Display the average times
    let averageTimesMessage = '';
    for (const items in averageTimes) {
      averageTimesMessage += `${items} items: ${averageTimes[items].toFixed(2)}ms<br>`;
    }
    showMessage(`Average search time for different numbers of items:<br>${averageTimesMessage}`);
  }  

  // Function to display messages below the game container
  function showMessage(message) {
    messageContainer.innerHTML = message;
  }

  function resetSimulation() {
    trialCount = 0;
    correctCount = 0;
    totalSearchTime = 0;
    searchTimesByItems = {};
    currentDisplay = 0;
    clearTimeout(searchTimeout);
    showMessage('');
    gameContainer.innerHTML = '';
    simulationStarted = false;
    startButton.style.display = 'block';
  }
  
  // Event listener to handle reset button click
  const resetButton = document.getElementById('reset-button');
  resetButton.addEventListener('click', () => {
    resetSimulation();
  });

  // Event listener to handle spacebar press
  document.addEventListener('keydown', (event) => {
    if (simulationStarted && event.key === ' ') { // Spacebar key press
      const tLetters = document.getElementsByClassName('t-letter');
      let foundCorrectT = false;
      for (let i = 0; i < tLetters.length; i++) {
        const tLetter = tLetters[i];
        const tColor = tLetter.style.color;
        const tRotation = tLetter.style.transform;
        if (tColor === uprightTColor && tRotation === '') {
          foundCorrectT = true;
          const endTime = Date.now();
          const searchTime = endTime - (startTime + calculateSearchTime(tLetters.length));
          totalSearchTime += searchTime;
  
          // Store the search time for this number of items
          const itemsCount = minItems + (currentDisplay - 1) * itemsStep;
          if (!searchTimesByItems[itemsCount]) {
            searchTimesByItems[itemsCount] = [];
          }
          searchTimesByItems[itemsCount].push(searchTime);
  
          correctCount++;
          showMessage('Correct! Next search...');
          setTimeout(() => {
            showMessage(''); // Clear the message after 1 second
            startNewDisplay();
          }, 1000); // Show next search display after 1 second
          break;
        }
      }
      if (!foundCorrectT) {
        showMessage('Wrong! Try again.');
      }
    }
  });

  // Attach click event listener to the "Start" button
  startButton.addEventListener('click', () => {
    if (!simulationStarted) {
      startSimulation();
    }
  });
});