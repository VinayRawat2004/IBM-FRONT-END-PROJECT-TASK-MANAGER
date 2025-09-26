document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const themeSwitcher = document.querySelector('.theme-switcher');
    const body = document.body;

    // Load tasks and theme from Local Storage or set defaults
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentTheme = localStorage.getItem('theme') || 'light';

    // --- Data Persistence ---
    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));
    const saveTheme = (theme) => localStorage.setItem('theme', theme);

    // --- Core Functions ---
    const renderTasks = () => {
        taskList.innerHTML = ''; // Clear list before rendering
        if (tasks.length === 0) {
            taskList.innerHTML = '<p style="text-align:center;">No tasks yet. Add one to get started!</p>';
        }

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.index = index;

            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">🗑️</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        updateProgress();
    };

    const updateProgress = () => {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}% Complete`;
    };

    const addTask = () => {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ text, completed: false });
            saveTasks();
            renderTasks();
            taskInput.value = '';
            taskInput.focus();
        }
    };
    
    const applyTheme = (theme) => {
        body.className = `theme-${theme}`;
        // Update active button state
        document.querySelectorAll('.theme-switcher button').forEach(button => {
            button.classList.toggle('active', button.dataset.theme === theme);
        });
    };

    // --- Event Handlers ---
    const handleTaskListClick = (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;
        
        const index = parseInt(taskItem.dataset.index, 10);

        if (target.classList.contains('task-checkbox')) {
            tasks[index].completed = !tasks[index].completed;
        } else if (target.classList.contains('delete-btn')) {
            tasks.splice(index, 1);
        } else if (target.classList.contains('edit-btn')) {
            const taskTextSpan = taskItem.querySelector('.task-text');
            const isEditable = taskTextSpan.isContentEditable;
            
            if (isEditable) {
                // Save changes
                taskTextSpan.contentEditable = false;
                target.textContent = '✏️';
                tasks[index].text = taskTextSpan.textContent.trim();
            } else {
                // Enable editing
                taskTextSpan.contentEditable = true;
                taskTextSpan.focus();
                target.textContent = '💾';
            }
        } else {
            return; // Exit if the click wasn't on a relevant element
        }

        saveTasks();
        renderTasks();
    };

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
    
    // Use event delegation for task list items
    taskList.addEventListener('click', handleTaskListClick);

    themeSwitcher.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            currentTheme = e.target.dataset.theme;
            applyTheme(currentTheme);
            saveTheme(currentTheme);
        }
    });

    // --- Initial Load ---
    applyTheme(currentTheme);
    renderTasks();
});