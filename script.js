let currentNumber = localStorage.getItem('currentNumber') ? parseInt(localStorage.getItem('currentNumber')) : 0;
const numberDiv = document.getElementById('number');
const buttonContainer = document.getElementById('buttonContainer');
numberDiv.textContent = currentNumber;

function changeNumber(value) {
    currentNumber += value;
    numberDiv.textContent = currentNumber;
    localStorage.setItem('currentNumber', currentNumber);
}

function addNewButton() {
    const value = prompt("Enter the number to add/subtract:");
    if (value !== null) {
        const parsedValue = parseInt(value);
        if (!isNaN(parsedValue)) {
            createButton(parsedValue);
            saveButtons();
        } else {
            alert("Please enter a valid number.");
        }
    }
}

function createButton(value) {
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'button-wrapper';

    const newButton = document.createElement('button');
    newButton.textContent = (value > 0 ? "Add " : "Subtract ") + Math.abs(value);
    newButton.className = 'button-8';
    newButton.ontouchstart = handleTouchStart;
    newButton.ontouchmove = handleTouchMove;
    newButton.ontouchend = handleTouchEnd;
    newButton.onclick = function() {
        changeNumber(value);
    };

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'button-8 remove';
    removeButton.onclick = function() {
        buttonWrapper.remove();
        saveButtons();
    };

    buttonWrapper.appendChild(newButton);
    buttonWrapper.appendChild(removeButton);
    buttonContainer.appendChild(buttonWrapper);
}

function saveButtons() {
    const buttons = [];
    buttonContainer.querySelectorAll('.button-wrapper').forEach(wrapper => {
        const button = wrapper.querySelector('button:not(.remove)');
        const text = button.textContent;
        const className = button.className;
        buttons.push({ text, className });
    });
    localStorage.setItem('buttons', JSON.stringify(buttons));
}

function loadButtons() {
    const savedButtons = localStorage.getItem('buttons');
    if (savedButtons) {
        JSON.parse(savedButtons).forEach(buttonData => {
            const value = parseInt(buttonData.text.split(' ')[1]);
            const isAddition = buttonData.text.startsWith('Add');
            createButton(isAddition ? value : -value);
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadButtons();
    numberDiv.textContent = currentNumber;
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(function(error) {
        console.log('ServiceWorker registration failed: ', error);
    });
}

// Touch handling
let xStart = null;
let yStart = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xStart = firstTouch.clientX;
    yStart = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xStart || !yStart) {
        return;
    }

    const xMove = evt.touches[0].clientX;
    const yMove = evt.touches[0].clientY;

    const xDiff = xStart - xMove;
    const yDiff = yStart - yMove;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        evt.currentTarget.style.transform = `translateX(${xMove - xStart}px)`;
    }
}

function handleTouchEnd(evt) {
    if (!xStart || !yStart) {
        return;
    }

    const xEnd = evt.changedTouches[0].clientX;
    const xDiff = xStart - xEnd;

    if (Math.abs(xDiff) > 50) {
        evt.currentTarget.closest('.button-wrapper').classList.toggle('swiped');
    }

    evt.currentTarget.style.transform = '';
    xStart = null;
    yStart = null;
}
