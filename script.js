let todoList = [];
// Load the todoList from local storage on page load
const storedTodoList = localStorage.getItem('todoList');
if (storedTodoList) {
    todoList = JSON.parse(storedTodoList);
}
function showDueDateTags(task) {
    const dueDateTime = new Date(`${task.dueDate} ${task.dueTime}`);
    const currentTime = new Date();

    const timeDiff = dueDateTime - currentTime;
    const minutesInOneWeek = 7 * 24 * 60 * 60 * 1000;

    if (timeDiff <= 0) {
        return '<span class="text-red-500 font-semibold">Late</span>';
    } else if (timeDiff <= minutesInOneWeek && !task.completed) {
        return '<span class="text-yellow-500 font-semibold">Due Soon</span>';
    } else if (task.completed || timeDiff > minutesInOneWeek) {
        return '<span class="text-green-500 font-semibold">On Time</span>';
    }
}


function showToDo() {
    const groupedTasks = groupTasksByDate(todoList);
    let todoListHTML = '';

    for (const [date, tasks] of groupedTasks.entries()) {
        const dateHTML = `<p class="text-lg font-semibold mt-6 mb-2">${date}</p>`;
        const tasksHTML = tasks.map(task => {
            const isDueSoon = isTaskDueSoon(task);
            const dueDateTag = showDueDateTags(task);
            return `
                <div class="flex items-center justify-between bg-gray-800 p-4 rounded-md mb-4">
                    <div class="flex-grow">
                        <p class="text-xl">${task.name}</p>
                        <p class="text-sm text-gray-400">Time: ${task.dueTime} | Priority: ${task.priority}</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button class="text-yellow-400 hover:text-yellow-500" onclick="editTask('${task.id}', 'name');">Edit Name</button>
                        <button class="text-yellow-400 hover:text-yellow-500" onclick="editTask('${task.id}', 'time');">Edit Time</button>
                        <button class="text-yellow-400 hover:text-yellow-500" onclick="editTask('${task.id}', 'date');">Edit Date</button>
                        <button class="text-green-400 hover:text-green-500" onclick="toggleCompletion('${task.id}');">${task.completed ? 'Mark Uncompleted' : 'Mark Completed'}</button>
                        <button class="text-red-400 hover:text-red-500" onclick="deleteTodo('${task.id}');">Delete</button>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    ${dueDateTag}
                    ${isDueSoon ? '<span class="text-yellow-500 font-semibold">Due Soon</span>' : ''}
                </div>
            `;
        }).join('');

        todoListHTML += dateHTML + tasksHTML;
    }

    document.querySelector('.js-todo-list').innerHTML = todoListHTML;
}

function editTask(id, field) {
    const task = todoList.find(task => task.id === id);

    if (!task) {
        return;
    }

    let newValue;
    switch (field) {
        case 'name':
            newValue = prompt('Edit task name:', task.name);
            break;
        case 'time':
            newValue = prompt('Edit task time:', task.dueTime);
            if (newValue !== null) {
                if (!isValidTimeFormat(newValue)) {
                    alert('Invalid time format. Please use HH:MM format.');
                    return;
                }
            }
            break;
        case 'date':
            newValue = prompt('Edit task date:', task.dueDate);
            if (newValue !== null) {
                if (!isValidDateFormat(newValue)) {
                    alert('Invalid date format. Please use YYYY-MM-DD format.');
                    return;
                }
            }
            break;
        default:
            return;
    }

    if (newValue !== null) {
        if (field === 'name') {
            task.name = newValue;
        } else if (field === 'time') {
            task.dueTime = newValue;
        } else if (field === 'date') {
            task.dueDate = newValue;
        }
        localStorage.setItem('todoList', JSON.stringify(todoList));
        showToDo();
    }
}

function isValidTimeFormat(timeString) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(timeString);
}

function isValidDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
}

function groupTasksByDate(tasks) {
    const groupedTasks = new Map();
    for (const task of tasks) {
        const { dueDate } = task;
        if (!groupedTasks.has(dueDate)) {
            groupedTasks.set(dueDate, []);
        }
        groupedTasks.get(dueDate).push(task);
    }
    return groupedTasks;
}

function isTaskDueSoon(task) {
    const dueDateTime = new Date(`${task.dueDate} ${task.dueTime}`);
    const currentTime = new Date();
    const timeDiff = dueDateTime - currentTime;
    const minutesInOneDay = 24 * 60 * 60 * 1000;
    return timeDiff <= minutesInOneDay;
}

function add() {
    const inputEle = document.querySelector('.js-todo');
    const dateinputEle = document.querySelector('.js-date');
    const timeinputEle = document.querySelector('.js-time');
    const prioritySelectEle = document.querySelector('.js-priority');
    const name = inputEle.value;
    const dueDate = dateinputEle.value;
    const dueTime = timeinputEle.value;
    const priority = prioritySelectEle.value;
    const id = Date.now().toString(); // Generating a unique ID

    if (!name || !dueDate || !dueTime) {
        alert('Please fill out all fields.');
        return;
    }

    todoList.push({
        id,
        name,
        dueDate,
        dueTime,
        priority,
        completed: false
    });

    inputEle.value = '';
    dateinputEle.value = '';
    timeinputEle.value = '';

    // Save the updated todoList to local storage
    localStorage.setItem('todoList', JSON.stringify(todoList));

    showToDo();
}

function toggleCompletion(id) {
    const task = todoList.find(task => task.id === id);

    if (!task) {
        return;
    }

    task.completed = !task.completed;
    localStorage.setItem('todoList', JSON.stringify(todoList));
    showToDo();
}

function deleteTodo(id) {
    todoList = todoList.filter(task => task.id !== id);

    // Save the updated todoList to local storage
    localStorage.setItem('todoList', JSON.stringify(todoList));

    showToDo();
}

function clearAll() {
    if (confirm('Are you sure you want to clear all tasks?')) {
        todoList = [];
        localStorage.removeItem('todoList');
        showToDo();
    }
}

function sortTasksByPriority() {
    todoList.sort((a, b) => {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    localStorage.setItem('todoList', JSON.stringify(todoList));
    showToDo();
}

function sortTasksByDateAndTime() {
    todoList.sort((a, b) => {
        if (a.dueDate !== b.dueDate) {
            return a.dueDate.localeCompare(b.dueDate);
        } else {
            return a.dueTime.localeCompare(b.dueTime);
        }
    });
    localStorage.setItem('todoList', JSON.stringify(todoList));
    showToDo();
}

function sortTasks() {
    const sortSelect = document.getElementById('sortSelect');
    const selectedValue = sortSelect.value;
    
    if (selectedValue === 'priority') {
        sortTasksByPriority();
    } else if (selectedValue === 'date-time') {
        sortTasksByDateAndTime();
    }
}

// Request notification permission on page load
requestNotificationPermission();
