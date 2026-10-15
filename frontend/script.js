const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const message = document.getElementById("message");

async function loadTasks() {
    try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
            throw new Error("Unable to load tasks");
        }

        const tasks = await response.json();

        taskList.replaceChildren();

        tasks.forEach(task => {
            displayTask(task);
        });

        updateCount();
    } catch (error) {
        message.textContent = "Could not load tasks. Check the server.";
    }
}

function displayTask(task) {
    const li = document.createElement("li");
    li.className = "task-item";

    if (task.completed) {
        li.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;

    checkbox.addEventListener("change", async () => {
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    completed: checkbox.checked
                })
            });

            if (!response.ok) {
                throw new Error("Update failed");
            }

            await loadTasks();
        } catch (error) {
            message.textContent = "Could not update task.";
            checkbox.checked = !checkbox.checked;
        }
    });

    const span = document.createElement("span");
    span.className = "task-title";
    span.textContent = task.title;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", async () => {
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Delete failed");
            }

            message.textContent = "Task deleted!";
            await loadTasks();
        } catch (error) {
            message.textContent = "Could not delete task.";
        }
    });

    li.append(checkbox, span, deleteButton);
    taskList.appendChild(li);
}

taskForm.addEventListener("submit", async event => {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        message.textContent = "Please enter a task.";
        return;
    }

    try {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title })
        });

        if (!response.ok) {
            throw new Error("Add task failed");
        }

        taskInput.value = "";
        message.textContent = "Task added!";
        await loadTasks();
    } catch (error) {
        message.textContent = "Could not add task. Check the server.";
    }
});

function updateCount() {
    const count = taskList.children.length;
    taskCount.textContent = `${count} ${count === 1 ? "task" : "tasks"}`;
}

loadTasks();
