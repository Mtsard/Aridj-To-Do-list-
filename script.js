const taskInput = document.getElementById('taskInput');
const taskDeadline = document.getElementById('taskDeadline');
const taskCategory = document.getElementById('taskCategory');
const taskList = document.getElementById('taskList');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const alarmSound = document.getElementById('alarmSound');
const toastMessage = document.getElementById('toastMessage');
const clockElement = document.getElementById('clock');

let activeAlarms = 0;
let savedTasks = JSON.parse(localStorage.getItem('aridjTasksActive')) || [];
let archivedTasks = JSON.parse(localStorage.getItem('aridjTasksArchive')) || [];

function updateClock() {
    const now = new Date();
    clockElement.innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

function saveToLocalStorage() {
    localStorage.setItem('aridjTasksActive', JSON.stringify(savedTasks));
    localStorage.setItem('aridjTasksArchive', JSON.stringify(archivedTasks));
}

function loadAll() {
    taskList.innerHTML = '';
    historyList.innerHTML = '';
    savedTasks.forEach((task, index) => createTaskElement(task.text, task.deadline, task.category, index));
    archivedTasks.forEach((taskText) => createArchiveElement(taskText));
}

function addTask() {
    const taskText = taskInput.value.trim();
    const deadlineVal = taskDeadline.value;
    const categoryVal = taskCategory.value;

    if (taskText === '' || deadlineVal === '') {
        alert('أدخلي المهمة والوقت يا أريج! 💖⏰');
        return;
    }

    const taskObj = { text: taskText, deadline: deadlineVal, category: categoryVal };
    savedTasks.push(taskObj);
    saveToLocalStorage();

    createTaskElement(taskText, deadlineVal, categoryVal, savedTasks.length - 1);

    taskInput.value = '';
    taskDeadline.value = '';
    taskInput.focus();
}

function createTaskElement(text, deadline, category, index) {
    const targetTime = new Date(deadline).getTime();
    const li = document.createElement('li');
    li.classList.add(`cat-${category}`);
    
    li.innerHTML = `
        <div class="task-details">
            <span class="task-title">${text}</span>
            <span class="task-countdown">Loading...</span>
        </div>
        <div class="actions">
            <button class="btn-action stop-btn">STOP</button>
            <button class="btn-action delete-btn"><i class="fa-solid fa-check"></i> DONE</button>
        </div>
    `;

    const countdownElement = li.querySelector('.task-countdown');
    const stopBtn = li.querySelector('.stop-btn');
    let alarmTriggered = false;

    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetTime - now;

        if (distance < 0) {
            clearInterval(timerInterval);
            countdownElement.innerHTML = "🎀 TIME IS UP!";
            
            if (!alarmTriggered) {
                li.classList.add('alarm-active');
                alarmSound.play().catch(e => console.log("Audio"));
                alarmTriggered = true;
                activeAlarms++;
            }
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let timeStr = "Left: ";
        if (days > 0) timeStr += `${days}d `;
        if (hours > 0) timeStr += `${hours}h `;
        timeStr += `${minutes}m ${seconds}s`;

        countdownElement.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> ${timeStr}`;
    }, 1000);

    stopBtn.addEventListener('click', () => {
        li.classList.remove('alarm-active');
        activeAlarms--;
        if (activeAlarms <= 0) {
            alarmSound.pause();
            alarmSound.currentTime = 0;
            activeAlarms = 0;
        }
        stopBtn.style.display = 'none';
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
        clearInterval(timerInterval);
        if (li.classList.contains('alarm-active')) {
            activeAlarms--;
            if (activeAlarms <= 0) {
                alarmSound.pause();
                alarmSound.currentTime = 0;
            }
        }
        
        // 💖 مفرقعات على شكل قلوب فقط 💖
        var defaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, colors: ['#ff1493', '#ff69b4', '#ffb6c1', '#ffffff'] };
        
        function shootHearts() {
          confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['heart'] });
          confetti({ ...defaults, particleCount: 20, scalar: 0.75, shapes: ['heart'] });
        }
        
        shootHearts();
        setTimeout(shootHearts, 100);
        setTimeout(shootHearts, 200);

        toastMessage.classList.add('show');
        setTimeout(() => toastMessage.classList.remove('show'), 2500);

        // الحفظ والأرشفة
        archivedTasks.push(text);
        savedTasks = savedTasks.filter((_, i) => i !== index);
        saveToLocalStorage();
        
        loadAll();
    });

    taskList.appendChild(li);
}

function createArchiveElement(text) {
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="task-details">
            <span class="history-task-title"><i class="fa-solid fa-circle-check"></i> ${text}</span>
        </div>
    `;
    historyList.appendChild(li);
}

clearHistoryBtn.addEventListener('click', () => {
    if(confirm("حاب تمسحي الأرشيف كامل يا أريج؟ 🌸")) {
        archivedTasks = [];
        saveToLocalStorage();
        loadAll();
    }
});

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });

loadAll();