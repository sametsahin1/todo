document.addEventListener('DOMContentLoaded', () => {

    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskLists = document.querySelectorAll('.task-list');
    const categoryCounters = document.querySelectorAll('.category-counter');
    const STORAGE_KEY = 'tasks';

    let draggedItem = null;

    taskForm.addEventListener('submit', addTask);

    function addTask(e) {
        e.preventDefault();

        if (taskInput.value.trim() === '') return;

        const li = createTaskElement(taskInput.value);
        taskLists[0].appendChild(li);
        taskInput.value = '';

        saveTasksToStorage();
        updateCategoryCounter(0);
    }

    function createTaskElement(content) {
        const li = document.createElement('li');
        li.textContent = content;
        li.draggable = true;

        const menuButton = document.createElement('button');
        menuButton.className = 'menu-button';
        menuButton.textContent = '⋮';

        const menu = document.createElement('div');
        menu.className = 'menu';
        menu.style.display = 'none';

        const editButton = document.createElement('button');
        editButton.textContent = 'Düzenle';
        editButton.addEventListener('click', editTask);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.addEventListener('click', deleteTask);

        menu.appendChild(editButton);
        menu.appendChild(deleteButton);
        li.appendChild(menuButton);
        li.appendChild(menu);

        menuButton.addEventListener('click', () => {
            menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
        });

        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragend', handleDragEnd);

        return li;
    }

    function editTask(e) {
        const li = this.parentElement.parentElement;
        const taskContent = li.firstChild.textContent;
        const taskInput = document.createElement('input');
        taskInput.type = 'text';
        taskInput.value = taskContent;
        taskInput.style.width = '100%';

        li.insertBefore(taskInput, li.firstChild);
        li.removeChild(li.firstChild.nextSibling);

        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
                if (e.key === 'Enter' && taskInput.value.trim() !== '') {
                    const newTaskContent = document.createTextNode(taskInput.value);
                    li.insertBefore(newTaskContent, taskInput);
                } else {
                    const oldTaskContent = document.createTextNode(taskContent);
                    li.insertBefore(oldTaskContent, taskInput);
                }
                li.removeChild(taskInput);
                saveTasksToStorage();
            }
        });

        taskInput.focus();
    }

    function deleteTask(e) {
        const li = this.parentElement.parentElement;
        const taskList = li.parentElement;
        const categoryIndex = Array.from(taskLists).indexOf(taskList);
        taskList.removeChild(li);
        saveTasksToStorage();
        updateCategoryCounter(categoryIndex);
    }

    function handleDragStart(e) {
        draggedItem = this;
        this.classList.add('dragged');
    }

    function handleDragEnd(e) {
        this.classList.remove('dragged');
        draggedItem = null;
    }

    taskLists.forEach((taskList) => {
        taskList.addEventListener('dragover', handleDragOver);
        taskList.addEventListener('drop', handleDrop);
        taskList.addEventListener('dragenter', handleDragEnter);
        taskList.addEventListener('dragleave', handleDragLeave);
    });

    function handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        if (draggedItem) {
            this.classList.add('drag-over');
        }
    }

    function handleDragLeave(e) {
        if (draggedItem) {
            this.classList.remove('drag-over');
        }
    }

    function handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (!draggedItem) return;
        this.classList.remove('drag-over');

        const oldCategoryIndex = Array.from(taskLists).indexOf(draggedItem.parentElement);        const newCategoryIndex = Array.from(taskLists).indexOf(this);

        this.appendChild(draggedItem);
        saveTasksToStorage();
        updateCategoryCounter(oldCategoryIndex);
        updateCategoryCounter(newCategoryIndex);
        return false;
    }

    function saveTasksToStorage() {
        const tasks = Array.from(taskLists).map(taskList => {
            return Array.from(taskList.children).map(li => li.firstChild.textContent);
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function loadTasksFromStorage() {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!tasks) return;

        tasks.forEach((taskList, i) => {
            taskList.forEach(taskContent => {
                const li = createTaskElement(taskContent);
                taskLists[i].appendChild(li);
                updateCategoryCounter(i);
            });
        });
    }

    function updateCategoryCounter(categoryIndex) {
        const tasks = taskLists[categoryIndex].querySelectorAll('li');
        categoryCounters[categoryIndex].textContent = tasks.length;
    }

    loadTasksFromStorage();
});

